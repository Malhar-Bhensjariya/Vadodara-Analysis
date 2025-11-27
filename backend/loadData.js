import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'vadodara_analysis';
const COLLECTION_NAME = 'data_points';
const BATCH_SIZE = 5000;

async function loadDataToMongoDB() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Drop existing collection
    try {
      await collection.drop();
      console.log('Dropped existing collection');
    } catch (err) {
      console.log('No existing collection to drop');
    }

    // Read CSV file
    const csvPath = path.join(__dirname, '../frontend/public/data/vadodara_final.csv');
    console.log(`Reading CSV from ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const documents = [];

    // Parse CSV synchronously first
    await new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        step: (row) => {
          const data = row.data;
          const lat = parseFloat(data.lat);
          const lon = parseFloat(data.lon);

          if (!isNaN(lat) && !isNaN(lon)) {
            documents.push({
              osm_id: data.osm_id,
              name: data.name || '',
              lat: lat,
              lon: lon,
              main_category: data.main_category || '',
              subcategory: data.subcategory || '',
              sector: Number(data.sector) || null,
              intra_class_weight: Number(data.intra_class_weight) || 0,
              inter_class_weights: Number(data.inter_class_weights) || 0,
              value: Number(data.value) || 0,
              location: {
                type: 'Point',
                coordinates: [lon, lat]
              }
            });
          }
        },
        complete: () => {
          console.log(`CSV parsing complete: ${documents.length} valid documents`);
          resolve();
        },
        error: (err) => {
          reject(new Error(`CSV parsing error: ${err.message}`));
        }
      });
    });

    // Now insert documents in batches
    console.log('Starting batch inserts to MongoDB...');
    let totalInserted = 0;

    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      try {
        const result = await collection.insertMany(batch, { ordered: false });
        totalInserted += result.insertedCount;
        console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${totalInserted} total documents`);
      } catch (err) {
        console.error('Batch insert error:', err.message);
        throw err;
      }
    }

    console.log(`Total documents inserted: ${totalInserted}`);

    // Create geospatial index
    console.log('Creating geospatial index...');
    await collection.createIndex({ location: '2dsphere' });

    // Create other indexes for faster queries
    console.log('Creating additional indexes...');
    await collection.createIndex({ main_category: 1 });
    await collection.createIndex({ subcategory: 1 });
    await collection.createIndex({ sector: 1 });
    await collection.createIndex({ name: 'text' });
    await collection.createIndex({ value: 1 });

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error loading data to MongoDB:', err);
    throw err;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
loadDataToMongoDB()
  .then(() => {
    console.log('\n✅ Data successfully loaded to MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Failed to load data:', err);
    process.exit(1);
  });

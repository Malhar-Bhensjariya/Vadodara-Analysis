import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function checkData() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db('vadodara_analysis');
    const collection = db.collection('data_points');
    
    const count = await collection.countDocuments();
    console.log('Total documents in MongoDB:', count);
    
    if (count === 0) {
      console.log('\n⚠️  No documents found. Need to load data.');
    } else if (count < 69988) {
      console.log(`\n⚠️  Only ${count} documents loaded out of 69988 expected.`);
    } else {
      console.log('\n✅ All data loaded successfully!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

checkData().then(() => process.exit(0));

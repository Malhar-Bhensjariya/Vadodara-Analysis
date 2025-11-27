import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'vadodara_analysis';
const COLLECTION_NAME = 'data_points';
const BATCH_SIZE = 1000;

// ---------------------------------------------------------
// SECTOR DEFINITIONS (unchanged as per your input)
// ---------------------------------------------------------
const sectors = [
  {id:1,name:"Nizampura",coords:[[22.345408,73.189611],[22.345408,73.215260],[22.323408,73.215260],[22.323408,73.189611]]},
  {id:2,name:"Laxmipura",coords:[[22.345408,73.165942],[22.345408,73.189611],[22.323408,73.189611],[22.323408,73.165942]]},
  {id:3,name:"Fategunj",coords:[[22.323408,73.182120],[22.323408,73.215260],[22.313097,73.215260],[22.313097,73.182120]]},
  {id:4,name:"Mandvi",coords:[[22.313097,73.207463],[22.313097,73.215260],[22.294040,73.215260],[22.294040,73.207463]]},
  {id:5,name:"Alkapuri",coords:[[22.323408,73.162120],[22.323408,73.182120],[22.301657,73.182120],[22.301657,73.162120]]},
  {id:6,name:"Gotri",coords:[[22.323408,73.125906],[22.323408,73.162120],[22.301657,73.162120],[22.301657,73.125906]]},
  {id:7,name:"Gorwa",coords:[[22.345408,73.125942],[22.345408,73.165942],[22.323408,73.165942],[22.323408,73.125942]]},
  {id:8,name:"Akota",coords:[[22.301657,73.162120],[22.301657,73.182120],[22.285657,73.182120],[22.285657,73.162120]]},
  {id:9,name:"Vasna",coords:[[22.301657,73.142120],[22.301657,73.162120],[22.285657,73.162120],[22.285657,73.142120]]},
  {id:10,name:"Bhayli",coords:[[22.301657,73.110120],[22.301657,73.142120],[22.285657,73.142120],[22.285657,73.110120]]},
  {id:11,name:"Manjalpur",coords:[[22.285657,73.177265],[22.285657,73.207463],[22.257364,73.207463],[22.257364,73.177265]]},
  {id:12,name:"Makarpura",coords:[[22.257364,73.177265],[22.257364,73.207463],[22.230307,73.207463],[22.230307,73.177265]]},
  {id:13,name:"Tarsali",coords:[[22.270523,73.207463],[22.270523,73.28000],[22.230307,73.28000],[22.230307,73.207463]]},
  {id:15,name:"Ajwa",coords:[[22.313097,73.182120],[22.313097,73.207463],[22.285657,73.207463],[22.285657,73.182120]]},
  {id:16,name:"Pratapnagar",coords:[[22.294040,73.207463],[22.294040,73.215260],[22.270523,73.215260],[22.270523,73.207463]]},
  {id:17,name:"Vadodara East Taluka",coords:[[22.345408,73.215260],[22.345408,73.280000],[22.270523,73.280000],[22.270523,73.215260]]},
  {id:19,name:"North-West Taluka",coords:[[22.345000,73.020000],[22.345000,73.125906],[22.301657,73.125906],[22.301657,73.020000]]},
  {id:20,name:"West Taluka",coords:[[22.301657,73.020000],[22.301657,73.110120],[22.230000,73.110120],[22.230000,73.020000]]},
  {id:22,name:"South Taluka",coords:[[22.230307,73.020000],[22.230307,73.280000],[22.100000,73.280000],[22.100000,73.020000]]},
  {id:23,name:"North Taluka",coords:[[22.380000,73.020000],[22.380000,73.280000],[22.345408,73.280000],[22.345408,73.020000]]},
  {id:24,name:"Atladra",coords:[[22.285657,73.110120],[22.285657,73.177265],[22.230000,73.177265],[22.230000,73.110120]]},
  {id:25,name:"Waghodia",coords:[[22.380000,73.280000],[22.380000,73.500000],[22.270523,73.500000],[22.270523,73.280000]]},
];

// ---------------------------------------------------------
// HELPER: Haversine
// ---------------------------------------------------------
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---------------------------------------------------------
// HELPER: Centroid for fallback
// ---------------------------------------------------------
function centroid(sector) {
  let lat = 0, lon = 0;
  for (const [x,y] of sector.coords) {
    lat += x;
    lon += y;
  }
  return { lat: lat / sector.coords.length, lon: lon / sector.coords.length };
}

// ---------------------------------------------------------
// POLYGON CHECK (Ray-casting)
// ---------------------------------------------------------
function isPointInPolygon(lat, lon, poly) {
  let inside = false;
  const x = lon, y = lat;

  for (let i=0, j=poly.length-1; i<poly.length; j=i++) {
    const xi = poly[i][1], yi = poly[i][0];
    const xj = poly[j][1], yj = poly[j][0];

    const intersect =
      ((yi > y) !== (yj > y)) &&
      (x < (xj - xi)*(y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }
  return inside;
}

// ---------------------------------------------------------
// FIND SECTOR
// ---------------------------------------------------------
function findSectorForPoint(lat, lon) {
  for (const s of sectors) {
    if (isPointInPolygon(lat, lon, s.coords)) return s.id;
  }
  return null;
}

// ---------------------------------------------------------
// NEAREST-SECTOR (when polygon fails)
// ---------------------------------------------------------
function nearestSector(lat, lon) {
  let best = null, bestDist = Infinity;

  for (const s of sectors) {
    const c = centroid(s);
    const d = haversine(lat, lon, c.lat, c.lon);
    if (d < bestDist) {
      bestDist = d;
      best = s.id;
    }
  }
  return best;
}

// ---------------------------------------------------------
// VALUE CALCULATION
// ---------------------------------------------------------
function calculateValue(intra, interWeights) {
  let val = intra || 0;
  if (Array.isArray(interWeights)) {
    for (const w of interWeights) val += w.weight || 0;
  }
  return Number(val.toFixed(1));
}

// ---------------------------------------------------------
// MAIN
// ---------------------------------------------------------
async function updateSectorValues() {
  const client = new MongoClient(MONGO_URI, {
    tls: true,
    serverSelectionTimeoutMS: 30000
  });

  try {
    console.log("\nConnecting...");
    await client.connect();
    console.log("Connected.");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const total = await collection.countDocuments();
    console.log(`Total documents: ${total}`);

    let processed = 0, updated = 0, fallbackUsed = 0, errors = 0;
    let ops = [];

    const cursor = collection.find({});

    for await (const doc of cursor) {
      try {
        const lat = doc.lat;
        const lon = doc.lon;

        let sector = findSectorForPoint(lat, lon);

        if (!sector) {
          sector = nearestSector(lat, lon);
          fallbackUsed++;
        }

        const value = calculateValue(doc.intra_class_weight, doc.inter_class_weights);

        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { sector, value } }
          }
        });

        updated++;
        processed++;

        if (ops.length >= BATCH_SIZE) {
          await collection.bulkWrite(ops, { ordered: false });
          console.log(`Progress: ${processed}/${total}`);
          ops = [];
        }
      } catch (err) {
        errors++;
      }
    }

    if (ops.length > 0) await collection.bulkWrite(ops, { ordered: false });

    console.log("\n===== SUMMARY =====");
    console.log("Processed:", processed);
    console.log("Updated:", updated);
    console.log("Used fallback:", fallbackUsed);
    console.log("Errors:", errors);
    console.log("==================\n");

  } finally {
    await client.close();
    console.log("Disconnected.");
  }
}

// Run
updateSectorValues()
  .then(() => { console.log("Done."); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });

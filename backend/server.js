import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { createDataRoutes } from './routes/dataRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MONGODB_URI not set in .env file');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(MONGO_URI);
let db;
let dataCollection;

// Helper: build an in-memory collection from local CSV for dev fallback
async function buildFallbackCollectionFromCSV(csvPath) {
  try {
    const csvRaw = await fs.readFile(csvPath, 'utf8');
    const parsed = Papa.parse(csvRaw, { header: true, skipEmptyLines: true });
    const rows = parsed.data;

    // Normalize rows and build documents matching expected fields
    const docs = rows.map((r, i) => {
      const lat = parseFloat(r.lat || r.latitude || r.LAT || r.Latitude || r.y || r.Y) || null;
      const lon = parseFloat(r.lon || r.longitude || r.LON || r.Longitude || r.x || r.X) || null;
      return {
        _id: String(i + 1),
        name: r.name || r.Name || r.NAME || r.shop_name || r.osm_name || '',
        osm_id: r.osm_id || r.id || null,
        lat,
        lon,
        main_category: r.main_category || r.category || r.type || null,
        subcategory: r.subcategory || r.sub_cat || null,
        sector: r.sector ? Number(r.sector) : (r.sector_id ? Number(r.sector_id) : null),
        value: r.value ? Number(r.value) : (r.score ? Number(r.score) : null),
        intra_class_weight: r.intra_class_weight ? Number(r.intra_class_weight) : null,
        location: (lat !== null && lon !== null) ? { type: 'Point', coordinates: [lon, lat] } : null
      };
    });

    // In-memory collection shim implementing minimal Mongo-like methods used by controllers
    const collection = {
      docs,
      async countDocuments(filter = {}) {
        return collection.find(filter).toArray().then(a => a.length);
      },
      find(filter = {}) {
        // Return a cursor-like object supporting project, sort, skip, limit, toArray
        const filterFunc = (doc) => {
          if (!filter || Object.keys(filter).length === 0) return true;
          // Very small subset of filter features used by the app
          for (const k of Object.keys(filter)) {
            const v = filter[k];
            if (k === 'location' && v && v.$geoWithin && v.$geoWithin.$box) {
              const [[minLon, minLat], [maxLon, maxLat]] = v.$geoWithin.$box;
              if (!doc.lat || !doc.lon) return false;
              if (doc.lat < minLat || doc.lat > maxLat || doc.lon < minLon || doc.lon > maxLon) return false;
              continue;
            }
            // regex
            if (v && v.$regex) {
              const re = new RegExp(v.$regex, v.$options || 'i');
              if (!re.test(String(doc[k] || ''))) return false;
              continue;
            }
            // numeric operators
            if (typeof v === 'object' && v !== null) {
              const op = Object.keys(v)[0];
              const val = v[op];
              const docVal = doc[k];
              if (op === '$gt' && !(docVal > val)) return false;
              if (op === '$lt' && !(docVal < val)) return false;
              if (op === '$gte' && !(docVal >= val)) return false;
              if (op === '$lte' && !(docVal <= val)) return false;
              if (op === '$eq' && !(docVal === val)) return false;
              continue;
            }
            // direct equality
            if (doc[k] != v) return false;
          }
          return true;
        };

        let results = collection.docs.filter(filterFunc);

        const cursor = {
          project(proj) {
            cursor._proj = proj;
            return cursor;
          },
          sort(sortObj) {
            const key = Object.keys(sortObj)[0];
            const dir = sortObj[key];
            results = results.sort((a, b) => (a[key] === b[key] ? 0 : (a[key] < b[key] ? -1 : 1)) * dir);
            return cursor;
          },
          skip(n) {
            cursor._skip = (cursor._skip || 0) + n;
            return cursor;
          },
          limit(n) {
            cursor._limit = n;
            return cursor;
          },
          async toArray() {
            let arr = results.slice();
            if (cursor._proj) {
              arr = arr.map(d => {
                const o = {};
                for (const k of Object.keys(cursor._proj)) {
                  if (cursor._proj[k]) o[k] = d[k];
                }
                return o;
              });
            }
            if (cursor._skip) arr = arr.slice(cursor._skip);
            if (cursor._limit) arr = arr.slice(0, cursor._limit);
            return arr;
          }
        };

        return cursor;
      },
      async aggregate(pipeline = []) {
        // Minimal support for the aggregation pipelines used by controllers
        let curr = collection.docs.slice();

        for (const stage of pipeline) {
          if (stage.$match) {
            const m = stage.$match;
            curr = curr.filter(d => {
              for (const k of Object.keys(m)) {
                const v = m[k];
                if (k === 'lat' || k === 'lon') {
                  if (v.$gte !== undefined && !(d[k] >= v.$gte)) return false;
                  if (v.$lte !== undefined && !(d[k] <= v.$lte)) return false;
                } else {
                  if (d[k] !== v) return false;
                }
              }
              return true;
            });
          } else if (stage.$project) {
            curr = curr.map(d => {
              const out = {};
              for (const k of Object.keys(stage.$project)) {
                if (typeof stage.$project[k] === 'number' && stage.$project[k]) out[k] = d[k];
                else if (stage.$project[k] && stage.$project[k].$round && Array.isArray(stage.$project[k].$round)) {
                  const fld = stage.$project[k].$round[0].slice ? stage.$project[k].$round[0] : stage.$project[k].$round[0];
                  // fallback: just round the source field
                  out[k] = Math.round((d[stage.$project[k].$round[0].slice ? stage.$project[k].$round[0] : 'lat'] || 0) * 100) / 100;
                }
              }
              return out;
            });
          } else if (stage.$group) {
            const idExpr = stage.$group._id;
            const groups = {};
            for (const d of curr) {
              let key;
              if (typeof idExpr === 'object' && idExpr.rlat) {
                // cluster grouping by rounded lat/lon
                const rlat = Math.round(d.lat * Math.pow(10, pipeline.find(s => s.$project)?.$project?.rlat?.$round?.[1] || 2)) / Math.pow(10, pipeline.find(s => s.$project)?.$project?.rlat?.$round?.[1] || 2);
                const rlon = Math.round(d.lon * Math.pow(10, pipeline.find(s => s.$project)?.$project?.rlon?.$round?.[1] || 2)) / Math.pow(10, pipeline.find(s => s.$project)?.$project?.rlon?.$round?.[1] || 2);
                key = `${rlat}|${rlon}`;
              } else if (typeof idExpr === 'string') {
                key = d[idExpr.replace('$', '')];
              } else if (typeof idExpr === 'object' && idExpr.$subcategory) {
                key = d.subcategory || null;
              } else if (typeof idExpr === 'object' && idExpr.subcategory) {
                key = d.subcategory || null;
              } else {
                // fallback: group by subcategory
                key = d.subcategory || null;
              }

              if (!groups[key]) groups[key] = { docs: [] };
              groups[key].docs.push(d);
            }

            // build grouped array
            const out = [];
            for (const k of Object.keys(groups)) {
              const arr = groups[k].docs;
              const obj = { _id: k };
              for (const aggKey of Object.keys(stage.$group)) {
                if (aggKey === '_id') continue;
                const expr = stage.$group[aggKey];
                if (expr.$sum === 1) obj[aggKey] = arr.length;
                if (expr.$avg) {
                  const fld = expr.$avg.replace('$', '');
                  const vals = arr.map(x => Number(x[fld]) || 0);
                  obj[aggKey] = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
                }
                if (expr.$max) {
                  const fld = expr.$max.replace('$', '');
                  obj[aggKey] = Math.max(...arr.map(x => Number(x[fld]) || -Infinity));
                }
                if (expr.$min) {
                  const fld = expr.$min.replace('$', '');
                  obj[aggKey] = Math.min(...arr.map(x => Number(x[fld]) || Infinity));
                }
              }
              out.push(obj);
            }

            curr = out;
          } else if (stage.$sort) {
            const key = Object.keys(stage.$sort)[0];
            const dir = stage.$sort[key];
            curr = curr.sort((a, b) => (a[key] === b[key] ? 0 : (a[key] < b[key] ? 1 : -1)) * dir);
          } else if (stage.$limit) {
            curr = curr.slice(0, stage.$limit);
          }
        }

        return curr;
      },
      async distinct(field) {
        const s = new Set();
        for (const d of collection.docs) {
          if (d[field] !== undefined && d[field] !== null) s.add(d[field]);
        }
        return Array.from(s);
      },
      async findOne(q) {
        if (q && q._id) {
          const id = String(q._id).replace(/\D/g, '') || String(q._id);
          return collection.docs.find(d => String(d._id) === String(id)) || null;
        }
        return null;
      }
    };

    return collection;
  } catch (err) {
    console.error('Failed to build fallback collection from CSV:', err.message);
    throw err;
  }
}

async function connectMongoDB() {
  try {
    await client.connect();
    db = client.db('vadodara_analysis');
    dataCollection = db.collection('data_points');
    // Ensure common indexes exist to support filtering and geo queries
    try {
      await dataCollection.createIndex({ location: '2dsphere' });
      await dataCollection.createIndex({ main_category: 1 });
      await dataCollection.createIndex({ subcategory: 1 });
      await dataCollection.createIndex({ sector: 1 });
      await dataCollection.createIndex({ name: 'text' });
      await dataCollection.createIndex({ value: 1 });
      console.log('Ensured database indexes');
    } catch (ixErr) {
      console.warn('Index creation warning:', ixErr.message);
    }
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    // Attempt local CSV fallback so backend can still serve during development
    try {
      const csvPath = path.resolve(process.cwd(), '../frontend/public/data/vadodara_final.csv');
      console.warn('MongoDB connection failed — attempting local CSV fallback at', csvPath);
      dataCollection = await buildFallbackCollectionFromCSV(csvPath);
      console.log('Using local CSV fallback collection — server will run without MongoDB.');
    } catch (fbErr) {
      console.error('Fallback build failed:', fbErr);
      process.exit(1);
    }
  }
}

// Start server after connecting to MongoDB and register routes
connectMongoDB().then(() => {
  // register routes now that `dataCollection` is available
  app.use('/api', createDataRoutes(dataCollection));

  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await client.close();
  process.exit(0);
});

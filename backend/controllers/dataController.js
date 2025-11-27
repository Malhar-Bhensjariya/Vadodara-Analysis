// DataController.js - COMPLETE FILE WITH MULTI-TAG FILTER SUPPORT
export class DataController {
  constructor(dataCollection) {
    this.collection = dataCollection;
  }

  // Helper: normalize query param that may be single value or array
  _toArray(val) {
    if (val === undefined || val === null) return null;
    return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
  }

  async getPagedData(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        searchName,
        ratingOp,
        ratingVal,
        valueOp,
        valueVal
      } = req.query;

      const mainCategories = this._toArray(req.query.mainCategory);
      const subCategories = this._toArray(req.query.subCategory);
      const sectors = this._toArray(req.query.sector);

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.min(100, Math.max(10, parseInt(limit, 10) || 50));
      const skip = (pageNum - 1) * pageSize;

      const projection = {
        name: 1,
        osm_id: 1,
        lat: 1,
        lon: 1,
        main_category: 1,
        subcategory: 1,
        sector: 1,
        value: 1,
        intra_class_weight: 1,
        location: 1
      };

      const filter = {};

      if (searchName && searchName.trim()) {
        filter.name = { $regex: searchName.trim(), $options: 'i' };
      }

      if (mainCategories && mainCategories.length > 0) {
        filter.main_category = { $in: mainCategories };
      }

      if (subCategories && subCategories.length > 0) {
        filter.subcategory = { $in: subCategories };
      }

      if (sectors && sectors.length > 0) {
        const secs = sectors.map(s => {
          const n = Number(s);
          return Number.isNaN(n) ? s : n;
        });
        filter.sector = { $in: secs };
      }

      const buildOperator = (op, rawVal) => {
        if (rawVal === undefined || rawVal === '') return null;
        const v = parseFloat(rawVal);
        if (Number.isNaN(v)) return null;
        const operators = {
          '>': { $gt: v },
          '<': { $lt: v },
          '=': { $eq: v },
          '>=': { $gte: v },
          '<=': { $lte: v }
        };
        return operators[op] || null;
      };

      const ratingFilter = buildOperator(ratingOp, ratingVal);
      if (ratingFilter) filter.intra_class_weight = ratingFilter;

      const valueFilter = buildOperator(valueOp, valueVal);
      if (valueFilter) filter.value = valueFilter;

      const total = await this.collection.countDocuments(filter);

      const sortField = req.query.sortField || 'value';
      const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

      const data = await this.collection
        .find(filter)
        .project(projection)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      res.json({
        success: true,
        data,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          pages: Math.ceil(total / pageSize)
        },
        filters: filter
      });
    } catch (err) {
      console.error('Error fetching paged data:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getHeatMap(req, res) {
    try {
      const pipeline = [
        { $match: { sector: { $ne: null } } },
        {
          $group: {
            _id: '$sector',
            avgValue: { $avg: '$value' },
            count: { $sum: 1 },
            maxValue: { $max: '$value' },
            minValue: { $min: '$value' }
          }
        },
        {
          $project: {
            _id: 0,
            sector: '$_id',
            avgValue: 1,
            count: 1,
            maxValue: 1,
            minValue: 1
          }
        },
        { $sort: { sector: 1 } }
      ];

      const heatmapData = await this.collection.aggregate(pipeline).toArray();

      res.json({
        success: true,
        heatmap: heatmapData
      });
    } catch (err) {
      console.error('Error fetching heatmap:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getDataByBounds(req, res) {
    try {
      const { 
        minLat, maxLat, minLon, maxLon, limit = 1000,
        searchName, ratingOp, ratingVal, valueOp, valueVal
      } = req.query;

      console.log('getDataByBounds called with query:', req.query);

      if (minLat === undefined || maxLat === undefined || minLon === undefined || maxLon === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required bounds parameters: minLat, maxLat, minLon, maxLon'
        });
      }

      const minLatN = parseFloat(minLat);
      const maxLatN = parseFloat(maxLat);
      const minLonN = parseFloat(minLon);
      const maxLonN = parseFloat(maxLon);

      if ([minLatN, maxLatN, minLonN, maxLonN].some(v => Number.isNaN(v))) {
        return res.status(400).json({ success: false, error: 'Invalid numeric bounds provided' });
      }

      const mainCategories = this._toArray(req.query.mainCategory);
      const subCategories = this._toArray(req.query.subCategory);
      const sectors = this._toArray(req.query.sector);

      console.log('Parsed filters:', {
        mainCategories,
        subCategories,
        sectors,
        searchName
      });

      const box = [[minLonN, minLatN], [maxLonN, maxLatN]];

      // Build filter with bounds AND all other filters
      const filter = {
        location: { $geoWithin: { $box: box } }
      };

      // Add search name filter
      if (searchName && searchName.trim()) {
        filter.name = { $regex: searchName.trim(), $options: 'i' };
      }

      // Add category filters
      if (mainCategories && mainCategories.length > 0) {
        filter.main_category = { $in: mainCategories };
      }

      if (subCategories && subCategories.length > 0) {
        filter.subcategory = { $in: subCategories };
      }

      // Add sector filter
      if (sectors && sectors.length > 0) {
        const secs = sectors.map(s => {
          const n = Number(s);
          return Number.isNaN(n) ? s : n;
        });
        filter.sector = { $in: secs };
      }

      // Add rating filter
      const buildOperator = (op, rawVal) => {
        if (rawVal === undefined || rawVal === '') return null;
        const v = parseFloat(rawVal);
        if (Number.isNaN(v)) return null;
        const operators = {
          '>': { $gt: v },
          '<': { $lt: v },
          '=': { $eq: v },
          '>=': { $gte: v },
          '<=': { $lte: v }
        };
        return operators[op] || null;
      };

      const ratingFilter = buildOperator(ratingOp, ratingVal);
      if (ratingFilter) filter.intra_class_weight = ratingFilter;

      const valueFilter = buildOperator(valueOp, valueVal);
      if (valueFilter) filter.value = valueFilter;

      console.log('Final MongoDB filter:', JSON.stringify(filter, null, 2));

      const data = await this.collection
        .find(filter)
        .project({ name: 1, lat: 1, lon: 1, main_category: 1, subcategory: 1, sector: 1, value: 1, intra_class_weight: 1 })
        .limit(Math.min(2000, parseInt(limit, 10)))
        .toArray();

      console.log('Found data points:', data.length);

      res.json({ success: true, data, count: data.length });
    } catch (err) {
      console.error('Error fetching data by bounds:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getDataStats(req, res) {
    try {
      const mainCategories = this._toArray(req.query.mainCategory);
      const sectors = this._toArray(req.query.sector);

      const pipeline = [];
      const matchStage = {};

      if (mainCategories && mainCategories.length > 0) {
        matchStage.main_category = { $in: mainCategories };
      }

      if (sectors && sectors.length > 0) {
        const secs = sectors.map(s => {
          const n = Number(s);
          return Number.isNaN(n) ? s : n;
        });
        matchStage.sector = { $in: secs };
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      pipeline.push({
        $group: {
          _id: '$subcategory',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          avgWeight: { $avg: '$intra_class_weight' }
        }
      });

      pipeline.push({ $sort: { count: -1 } });

      const stats = await this.collection.aggregate(pipeline).toArray();

      res.json({
        success: true,
        stats
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getClusters(req, res) {
    try {
      const { minLat, maxLat, minLon, maxLon, precision = 2, limit = 500 } = req.query;

      if (minLat === undefined || maxLat === undefined || minLon === undefined || maxLon === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required bounds parameters' });
      }

      const minLatN = parseFloat(minLat);
      const maxLatN = parseFloat(maxLat);
      const minLonN = parseFloat(minLon);
      const maxLonN = parseFloat(maxLon);

      if ([minLatN, maxLatN, minLonN, maxLonN].some(v => Number.isNaN(v))) {
        return res.status(400).json({ success: false, error: 'Invalid numeric bounds provided' });
      }

      const p = Math.min(6, Math.max(0, parseInt(precision, 10) || 2));
      const lim = Math.min(2000, Math.max(10, parseInt(limit, 10) || 500));

      const pipeline = [
        {
          $match: {
            lat: { $gte: minLatN, $lte: maxLatN },
            lon: { $gte: minLonN, $lte: maxLonN }
          }
        },
        {
          $project: {
            lat: 1,
            lon: 1,
            value: 1,
            rlat: { $round: ['$lat', p] },
            rlon: { $round: ['$lon', p] }
          }
        },
        {
          $group: {
            _id: { rlat: '$rlat', rlon: '$rlon' },
            count: { $sum: 1 },
            avgValue: { $avg: '$value' }
          }
        },
        { $project: { _id: 0, lat: '$_id.rlat', lon: '$_id.rlon', count: 1, avgValue: 1 } },
        { $sort: { count: -1 } },
        { $limit: lim }
      ];

      const clusters = await this.collection.aggregate(pipeline).toArray();

      res.json({ success: true, clusters });
    } catch (err) {
      console.error('Error fetching clusters:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getCategories(req, res) {
    try {
      const mainCategories = await this.collection.distinct('main_category');
      const subCategories = await this.collection.distinct('subcategory');
      const sectors = await this.collection.distinct('sector');

      const categoryCounts = await this.collection.aggregate([
        {
          $group: {
            _id: '$main_category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();

      res.json({
        success: true,
        mainCategories: (mainCategories || []).filter(Boolean).sort(),
        subCategories: (subCategories || []).filter(Boolean).sort(),
        sectors: (sectors || []).filter(x => x !== null).sort((a, b) => {
          // numeric sort when possible
          const an = Number(a), bn = Number(b);
          if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
          return String(a).localeCompare(String(b));
        }),
        categoryCounts: (categoryCounts || []).map(c => ({
          category: c._id,
          count: c.count
        }))
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getSearchSuggestions(req, res) {
    try {
      const { q, limit = 10 } = req.query;
      if (!q || q.trim().length < 2) {
        return res.json({ success: true, suggestions: [] });
      }

      const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

      const suggestions = await this.collection
        .find({ name: { $regex: q.trim(), $options: 'i' } })
        .project({ name: 1 })
        .limit(lim)
        .toArray();

      const uniqueNames = [...new Set((suggestions || []).map(s => s.name).filter(Boolean))];

      res.json({
        success: true,
        suggestions: uniqueNames
      });
    } catch (err) {
      console.error('Error getting suggestions:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getDataPointById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Missing id parameter' });
      }

      const { ObjectId } = await import('mongodb');
      const objId = ObjectId.isValid(id) ? new ObjectId(id) : null;
      if (!objId) {
        return res.status(400).json({ success: false, error: 'Invalid id' });
      }

      const data = await this.collection.findOne({ _id: objId });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Data point not found' });
      }

      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching data point:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getHealth(req, res) {
    try {
      const count = await this.collection.countDocuments();
      const statsAgg = await this.collection.aggregate([
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            avgValue: { $avg: '$value' },
            maxValue: { $max: '$value' },
            minValue: { $min: '$value' }
          }
        }
      ]).toArray();

      const stats = (statsAgg && statsAgg[0]) ? {
        totalCount: statsAgg[0].totalCount,
        avgValue: statsAgg[0].avgValue,
        maxValue: statsAgg[0].maxValue,
        minValue: statsAgg[0].minValue
      } : {};

      res.json({
        success: true,
        status: 'ok',
        dataPoints: count,
        stats
      });
    } catch (err) {
      console.error('Error fetching health:', err);
      res.status(500).json({ success: false, status: 'error', error: err.message });
    }
  }
}

import express from 'express';
import { DataController } from '../controllers/dataController.js';

export function createDataRoutes(dataCollection) {
  const router = express.Router();
  const controller = new DataController(dataCollection);

  // Paginated data endpoint (primary endpoint for frontend)
  router.get('/data', (req, res) => controller.getPagedData(req, res));
  
  router.get('/data/heatmap', (req, res) => controller.getHeatMap(req, res));

  // Geographic bounds endpoint (for map viewport loading)
  router.get('/data/bounds', (req, res) => controller.getDataByBounds(req, res));

  // Stats/aggregation endpoint
  router.get('/data/stats', (req, res) => controller.getDataStats(req, res));

  // Categories endpoint
  router.get('/categories', (req, res) => controller.getCategories(req, res));

  // Search suggestions
  router.get('/search', (req, res) => controller.getSearchSuggestions(req, res));
  // alias
  router.get('/suggestions', (req, res) => controller.getSearchSuggestions(req, res));

  // Clustering / heatmap aggregation
  router.get('/data/cluster', (req, res) => controller.getClusters(req, res));

  // Individual data point
  router.get('/data/:id', (req, res) => controller.getDataPointById(req, res));

  // Health check
  router.get('/health', (req, res) => controller.getHealth(req, res));

  return router;
}

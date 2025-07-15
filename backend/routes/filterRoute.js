import express from 'express';
import { 
  addFilter, 
  getAllFilters, 
  getFiltersForCategory, 
  updateFilter, 
  deleteFilter, 
  getDynamicFilters,
  initializeDefaultFilters 
} from '../controllers/filterController.js';
import adminAuth from '../middleware/adminAuth.js';

const filterRouter = express.Router();

// Initialize default filters (admin only)
filterRouter.post('/initialize', adminAuth, initializeDefaultFilters);

// Add new filter (admin only)
filterRouter.post('/', adminAuth, addFilter);

// Get all filters
filterRouter.get('/', getAllFilters);

// Get filters for specific category
filterRouter.get('/category/:category', getFiltersForCategory);

// Get dynamic filters from products
filterRouter.get('/dynamic', getDynamicFilters);

// Update filter (admin only)
filterRouter.put('/:id', adminAuth, updateFilter);

// Delete filter (admin only)
filterRouter.delete('/:id', adminAuth, deleteFilter);

export default filterRouter;

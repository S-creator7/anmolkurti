import express from 'express';
import { addFilter, getFiltersByCategory, getAllFilters, getDynamicFilters, updateFilter, deleteFilter } from '../controllers/filterController.js';
import adminAuth from '../middleware/adminAuth.js';

const filterRouter = express.Router();

filterRouter.post('/', adminAuth, addFilter);
filterRouter.get('/dynamic', getDynamicFilters);
filterRouter.get('/', getAllFilters);
filterRouter.get('/:category', getFiltersByCategory);
filterRouter.put('/:id', adminAuth, updateFilter);
filterRouter.delete('/:id', adminAuth, deleteFilter);

export default filterRouter;

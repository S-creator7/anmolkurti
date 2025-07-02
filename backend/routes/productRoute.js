import express from 'express'
import {listProducts, addProduct, removeProduct, singleProduct, addStockAlert, getFilterValues, getBestsellerProducts} from '../controllers/productController.js'
import adminAuth from '../middleware/adminAuth.js'

const productRouter = express.Router()

productRouter.get('/list', listProducts)
productRouter.post('/add', adminAuth, addProduct)
productRouter.post('/remove', adminAuth, removeProduct)
productRouter.post('/single', singleProduct)
productRouter.post('/stockAlert', addStockAlert)
productRouter.get('/filters', getFilterValues)
productRouter.get('/bestsellers', getBestsellerProducts)

export default productRouter

import productModel from "../models/productModel.js";
import { sendStockAlert } from "./emailService.js";

export async function checkStockAlerts() {
    try {
        const products = await productModel.find({
            "stockAlerts.0": { $exists: true } // Products with alerts
        });

        for (const product of products) {
            let hasStock = false;
            
            // Check if any size has stock
            for (const size of product.sizes) {
                if ((product.stock.get(size) || 0) > 0) {
                    hasStock = true;
                    break;
                }
            }

            if (hasStock && product.stockAlerts.length > 0) {
                // Send alerts to all subscribers
                for (const email of product.stockAlerts) {
                    await sendStockAlert(email, product);
                }
                
                // Clear alerts
                product.stockAlerts = [];
                await product.save();
            }
        }
    } catch (error) {
        console.error("Stock alert check failed:", error);
    }
}
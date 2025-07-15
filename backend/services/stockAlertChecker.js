import productModel from "../models/productModel.js";
import { sendStockAlert } from "./emailService.js";

export async function checkStockAlerts() {
    try {
        const products = await productModel.find({
            "stockAlerts.0": { $exists: true } // Products with alerts
        });

        console.log(`Found ${products.length} products with stock alerts`);

        for (const product of products) {
            let hasStock = false;
            
            if (product.hasSize) {
                // Check if any size has stock for products with sizes
                for (const size of product.sizes) {
                    let sizeStock = 0;
                    
                    // Handle both Map and plain object
                    if (product.stock instanceof Map) {
                        sizeStock = product.stock.get(size) || 0;
                    } else {
                        sizeStock = product.stock[size] || 0;
                    }
                    
                    if (sizeStock > 0) {
                        hasStock = true;
                        console.log(`Product ${product.name} has stock for size ${size}: ${sizeStock}`);
                        break;
                    }
                }
            } else {
                // Check stock for products without sizes
                const totalStock = typeof product.stock === 'number' ? product.stock : 0;
                hasStock = totalStock > 0;
                if (hasStock) {
                    console.log(`Product ${product.name} has stock: ${totalStock}`);
                }
            }

            if (hasStock && product.stockAlerts.length > 0) {
                console.log(`Sending stock alerts for product: ${product.name}`);
                
                // Send alerts to all subscribers
                for (const email of product.stockAlerts) {
                    try {
                        await sendStockAlert(email, product);
                        console.log(`Stock alert sent to: ${email}`);
                    } catch (emailError) {
                        console.error(`Failed to send stock alert to ${email}:`, emailError);
                    }
                }
                
                // Clear alerts after sending
                product.stockAlerts = [];
                await product.save();
                console.log(`Stock alerts cleared for product: ${product.name}`);
            } else if (product.stockAlerts.length > 0) {
                console.log(`Product ${product.name} still out of stock, keeping ${product.stockAlerts.length} alerts`);
            }
        }
    } catch (error) {
        console.error("Stock alert check failed:", error);
    }
}
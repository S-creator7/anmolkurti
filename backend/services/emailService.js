import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendStockAlert(email, product) {
    const msg = {
        to: email,
        from: 'your@store.com',
        subject: `Back in Stock: ${product.name}`,
        html: `<p>Hi there! The product you wanted is back in stock:</p>
               <h3>${product.name}</h3>
               <a href="https://yourstore.com/product/${product._id}">View Product</a>`
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error('Email sending error:', error);
    }
}
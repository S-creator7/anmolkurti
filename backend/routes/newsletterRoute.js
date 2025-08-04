import express from 'express';
import Newsletter from '../models/newsletterModel.js';
import { Parser } from 'json2csv';  // For CSV export

const router = express.Router();

// ✅ Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: 'Already subscribed!' });
    }

    await Newsletter.create({ email });
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ View all subscribers with pagination
router.get('/subscribers', async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const total = await Newsletter.countDocuments();
    const subscribers = await Newsletter.find()
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: subscribers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Export subscribers as CSV

// router.get('/subscribers/export', async (req, res) => {
//   try {
//     const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });

//     // ✅ Format date to IST before exporting
//     const formattedSubscribers = subscribers.map(sub => ({
//       email: sub.email,
//       subscribedAt: new Date(sub.subscribedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
//     }));

//     const fields = ['email', 'subscribedAt'];
//     const parser = new Parser({ fields });
//     const csv = parser.parse(formattedSubscribers);

//     res.header('Content-Type', 'text/csv');
//     res.attachment('newsletter-subscribers.csv');
//     return res.send(csv);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });


export default router;

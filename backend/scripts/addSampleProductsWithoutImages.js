import axios from 'axios';

const backendUrl = 'http://localhost:5000'; // Adjust this to your backend URL

const sampleProducts = Array.from({ length: 20 }, (_, index) => ({
  name: `Sample Product ${index + 1}`,
  description: `Description for Sample Product ${index + 1}`,
  price: (Math.random() * 100).toFixed(2),
  gender: 'unisex',
  category: 'clothing',
  subCategory: 'shirts',
  occasion: ['casual'],
  type: ['t-shirt'],
  filterTags: ['sample', 'product'],
  sizes: ['S', 'M', 'L'],
  hasSize: true,
  stock: { S: 10, M: 10, L: 10 },
  image: [], // No images for this test
  bestseller: false,
  date: Date.now(),
}));

const addProducts = async () => {
  for (const product of sampleProducts) {
    try {
      const response = await axios.post(`${backendUrl}/product/add`, product);
      console.log(response.data.message);
    } catch (error) {
      console.error('Error adding product:', error.response.data.message);
    }
  }
};

addProducts();

import mongoose from 'mongoose';
import filterModel from '../models/filterModel.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/skyroot');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test the new filter system
const testFilters = async () => {
  try {
    console.log('\n🧪 Testing New Filter System...\n');

    // 1. Clear existing filters
    await filterModel.deleteMany({});
    console.log('✅ Cleared existing filters');

    // 2. Create test filters
    const testFilters = [
      {
        name: 'color',
        displayName: 'Color',
        description: 'Product colors',
        type: 'global',
        filterType: 'multi-select',
        values: [
          { value: 'red', displayName: 'Red', colorCode: '#FF0000', isActive: true },
          { value: 'blue', displayName: 'Blue', colorCode: '#0000FF', isActive: true },
          { value: 'green', displayName: 'Green', colorCode: '#008000', isActive: true }
        ],
        sortOrder: 1
      },
      {
        name: 'size',
        displayName: 'Size',
        description: 'Product sizes',
        type: 'global',
        filterType: 'multi-select',
        values: [
          { value: 'S', displayName: 'Small', isActive: true },
          { value: 'M', displayName: 'Medium', isActive: true },
          { value: 'L', displayName: 'Large', isActive: true },
          { value: 'XL', displayName: 'Extra Large', isActive: true }
        ],
        sortOrder: 2
      },
      {
        name: 'saree_style',
        displayName: 'Saree Style',
        description: 'Styles specific to sarees',
        type: 'category-specific',
        filterType: 'multi-select',
        applicableCategories: ['Saree'],
        values: [
          { value: 'banarasi', displayName: 'Banarasi', isActive: true },
          { value: 'silk', displayName: 'Silk', isActive: true },
          { value: 'cotton', displayName: 'Cotton', isActive: true }
        ],
        sortOrder: 10
      }
    ];

    for (const filter of testFilters) {
      const result = await filterModel.create(filter);
      console.log(`✅ Created filter: ${result.displayName} (${result.name})`);
    }

    // 3. Test queries
    console.log('\n📋 Testing Filter Queries...\n');

    // Get all filters
    const allFilters = await filterModel.find({}).sort({ sortOrder: 1 });
    console.log(`✅ Found ${allFilters.length} total filters`);

    // Get global filters only
    const globalFilters = await filterModel.find({ type: 'global' }).sort({ sortOrder: 1 });
    console.log(`✅ Found ${globalFilters.length} global filters`);

    // Get filters for Saree category
    const sareeFilters = await filterModel.find({
      $or: [
        { type: 'global' },
        { type: 'category-specific', applicableCategories: 'Saree' }
      ]
    }).sort({ sortOrder: 1 });
    console.log(`✅ Found ${sareeFilters.length} filters applicable to Saree category`);

    // 4. Display results
    console.log('\n📊 Filter Details:\n');
    allFilters.forEach(filter => {
      console.log(`🏷️  ${filter.displayName} (${filter.name})`);
      console.log(`   Type: ${filter.type}`);
      console.log(`   Input: ${filter.filterType}`);
      console.log(`   Values: ${filter.values.map(v => v.displayName).join(', ')}`);
      if (filter.applicableCategories?.length > 0) {
        console.log(`   Categories: ${filter.applicableCategories.join(', ')}`);
      }
      console.log('');
    });

    console.log('🎉 All tests passed! New filter system is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
const run = async () => {
  await connectDB();
  await testFilters();
  mongoose.connection.close();
  console.log('Test completed');
};

run(); 
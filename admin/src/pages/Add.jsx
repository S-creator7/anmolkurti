import React, { useState, useCallback } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useFilters } from '../context/FilterContext'
import { FaCloudUploadAlt, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle, FaPlus, FaTrash, FaImage, FaFilter } from 'react-icons/fa'
import { useEffect } from 'react'

const token = localStorage.getItem('token');

const Add = () => {
  const { filterOptions, getFilterValues, dynamicFilters, getGlobalFilters, getCategoryFilters, getApplicableFilters } = useFilters();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Image state
  const [images, setImages] = useState([null, null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Form state - now with dynamic filter values
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    gender: '',
    category: '',
    bestseller: false,
    sizes: [],
    stock: {},
    hasSize: true,
    // Dynamic object to store all filter values
    filterValues: {}
  });

  // Validation state
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Product Images', icon: FaImage },
    { id: 2, title: 'Basic Details', icon: FaInfoCircle },
    { id: 3, title: 'Categories & Filters', icon: FaPlus },
    { id: 4, title: 'Stock & Pricing', icon: FaCheck }
  ];

  // Image validation
  const validateImage = (file) => {
    if (!file) return { valid: false, error: 'No file selected' };
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid format. Use JPEG, PNG, or WebP' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Max 5MB' };
    }
    return { valid: true, error: '' };
  };

  // Handle image upload
  const handleImageUpload = (file, index) => {
    const validation = validateImage(file);
    if (validation.valid) {
      setImages(prev => {
        const newImages = [...prev];
        newImages[index] = file;
        return newImages;
      });
      setImageErrors(prev => ({ ...prev, [index]: '' }));
    } else {
      setImageErrors(prev => ({ ...prev, [index]: validation.error }));
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0], index);
    }
  }, []);

  // Remove image
  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
    setImageErrors(prev => ({ ...prev, [index]: '' }));
  };

  // Form validation
  const validateStep = (step, currentErrors) => {
    const newErrors = { ...currentErrors };
    // Remove errors for the current step fields first
    switch (step) {
      case 1:
        delete newErrors.images;
        if (!images.some(img => img !== null)) {
          newErrors.images = 'At least one image is required';
        }
        break;
      case 2:
        delete newErrors.name;
        delete newErrors.description;
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 3:
        delete newErrors.gender;
        delete newErrors.category;
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      // case 4:
      //   delete newErrors.price;
      //   delete newErrors.sizes;
      //   if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
      //   if (formData.hasSize && formData.sizes.length === 0) {
      //     newErrors.sizes = 'Select at least one size';
      //   }

      //   break;
      case 4:
        delete newErrors.price;
        delete newErrors.sizes;
        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0) {
          newErrors.price = 'Valid price is required';
        }
        if (formData.hasSize && (!formData.sizes || formData.sizes.length === 0)) {
          newErrors.sizes = 'Select at least one size';
        }
        break;
    }
    // Remove setErrors call here to avoid premature state updates
    // setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

  };

  // Get available categories based on gender
  const getAvailableCategories = () => {
    if (formData.gender === "Women") {
      return ["Sarees", "Kurtis", "Dress", "Salwars", "Sets"];
    } else if (formData.gender === "Men") {
      return ["Shirts", "Pants", "Suits", "Sets"];
    } else if (formData.gender === "Children") {
      return ["Suits", "Dress", "Sets"];
    }
    return [];
  };

  // Get filter options with fallbacks
  const getFilterOptions = (filterName) => {
    const filterValues = getFilterValues(filterName);
    if (filterValues.length > 0) {
      return filterValues;
    }
    return filterOptions[filterName] || [];
  };

  // Get filters that should be shown for the current product
  const getAvailableFilters = () => {
    let availableFilters = [];

    if (!formData.category) {
      // If no category selected, show only global filters
      availableFilters = getGlobalFilters();
    } else {
      // Show global + category-specific filters for the selected category
      availableFilters = getApplicableFilters(formData.category);
    }

    // Filter out redundant filters that are handled elsewhere in the form
    const excludedFilters = ['gender', 'size']; // Gender is selected above, Size is in Step 4

    return availableFilters.filter(filter =>
      !excludedFilters.includes(filter.name.toLowerCase()) &&
      filter.values &&
      filter.values.length > 0 &&
      filter.values.some(v => v.isActive)
    );
  };

  // Handle dynamic filter value changes
  const handleFilterValueChange = (filterName, value, isMultiSelect = true) => {
    if (isMultiSelect) {
      const currentValues = formData.filterValues[filterName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      setFormData(prev => ({
        ...prev,
        filterValues: {
          ...prev.filterValues,
          [filterName]: newValues
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        filterValues: {
          ...prev.filterValues,
          [filterName]: value
        }
      }));
    }
  };

  // Handle step navigation
  const nextStep = () => {
    const { isValid, errors: newErrors } = validateStep(currentStep, errors);
    console.log("Validating Step", currentStep, newErrors);

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(msg => toast.error(msg));
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };


  useEffect(() => {
    console.log("My Current step is", currentStep)
  }, [currentStep])

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const onSubmitHandler = async (e) => {
    console.log("onsubmit handler triggerred")

    e.preventDefault();


    // Validate all steps
    let allValid = true;
    let currentErrors = { ...errors };
    for (let i = 1; i <= totalSteps; i++) {
      const { isValid, errors: newErrors } = validateStep(i, currentErrors);
      currentErrors = newErrors;
      if (!isValid) {
        allValid = false;
      }
    }
    setErrors(currentErrors);

    if (!allValid) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", parseFloat(formData.price) || 0);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("bestseller", formData.bestseller);
      formDataToSend.append("hasSize", formData.hasSize);
      formDataToSend.append("sizes", JSON.stringify(formData.hasSize ? formData.sizes : []));

      // Include all dynamic filter values
      formDataToSend.append("occasion", JSON.stringify(formData.filterValues.occasion || []));
      formDataToSend.append("type", JSON.stringify(formData.filterValues.type || []));

      // Add all filter values as a combined filters object
      const allFilterValues = { ...formData.filterValues };
      formDataToSend.append("filters", JSON.stringify(allFilterValues));

      // Handle stock properly
      // if (formData.hasSize) {
      //   formDataToSend.append("stock", JSON.stringify(formData.stock));
      // } else {
      //   formDataToSend.append("stock", JSON.stringify({ value: formData.stock.value || 0 }));
      // }
      // ✅ Normalize stock before appending
      let normalizedStock = {};
      if (formData.hasSize) {
        formData.sizes.forEach((size) => {
          const val = formData.stock[size];
          normalizedStock[size] = val === '' || val === undefined ? 0 : parseInt(val);
        });
      } else {
        normalizedStock = {
          value: formData.stock?.value === '' || formData.stock?.value === undefined
            ? 0
            : parseInt(formData.stock.value)
        };
      }

      formDataToSend.append("stock", JSON.stringify(normalizedStock));
      // Add images
      images.forEach((image, index) => {
        if (image) {
          formDataToSend.append(`image${index + 1}`, image);
        }
      });

      const response = await axios.post(backendUrl.join("/product/add"), formDataToSend, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(response.data.message);

        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          gender: '',
          category: '',
          bestseller: false,
          sizes: [],
          stock: {},
          hasSize: true,
          filterValues: {}
        });
        setImages([null, null, null, null]);
        setImageErrors({});
        setErrors({});
        setCurrentStep(1);
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to add product");
    } finally {
      setUploading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Product Images</h3>
              <p className="text-gray-600">Add up to 4 high-quality images of your product</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative group ${dragActive ? 'scale-105' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className={`w-full h-40 border-2 border-dashed rounded-xl transition-all duration-300 ${image
                    ? 'border-green-400 bg-green-50'
                    : dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    {image ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], index)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <FaCloudUploadAlt className="text-3xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 font-medium">
                          {index === 0 ? 'Main Image' : `Image ${index + 1}`}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">Click or drag</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], index)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {imageErrors[index] && (
                    <p className="text-xs text-red-500 mt-2 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {imageErrors[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Image Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use high-resolution images (minimum 800x800px)</li>
                <li>• Supported formats: JPEG, PNG, WebP</li>
                <li>• Maximum file size: 5MB per image</li>
                <li>• First image will be the main product display</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic Product Information</h3>
              <p className="text-gray-600">Tell customers about your product</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product features, materials, and benefits"
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${errors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Categories & Filters</h3>
              <p className="text-gray-600">Organize your product for better discoverability</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => {
                    handleInputChange('gender', e.target.value);
                    handleInputChange('category', '');
                    // handleInputChange('subCategory', ''); // Removed subCategory
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.gender
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                >
                  <option value="">Select Gender</option>
                  {getFilterOptions('gender').map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    handleInputChange('category', e.target.value);
                    // handleInputChange('subCategory', ''); // Removed subCategory
                  }}
                  disabled={!formData.gender}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${!formData.gender
                    ? 'bg-gray-100 cursor-not-allowed'
                    : errors.category
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                    }`}
                >
                  <option value="">Select Category</option>
                  {getAvailableCategories().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Removed subCategory field - not properly integrated with filter system */}

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-4 py-3 hover:from-yellow-100 hover:to-orange-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.bestseller}
                    onChange={(e) => handleInputChange('bestseller', e.target.checked)}
                    className="mr-3 w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as Bestseller</span>
                </label>
              </div>
            </div>

            {/* Dynamic Product Filters */}
            <div className="space-y-6">
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Product Attributes</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Select the attributes that describe this product. These help customers find and filter products.
                </p>

                {getAvailableFilters().length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {getAvailableFilters()
                      .sort((a, b) => {
                        // Priority order for better UX
                        const priority = {
                          'color': 1,
                          'material': 2,
                          'occasion': 3,
                          'type': 4
                        };
                        return (priority[a.name.toLowerCase()] || 99) - (priority[b.name.toLowerCase()] || 99);
                      })
                      .map((filter) => (
                        <div key={filter._id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-800 text-base mb-1">
                              {filter.displayName}
                            </h5>
                            {filter.description && (
                              <p className="text-xs text-gray-500">{filter.description}</p>
                            )}
                          </div>

                          {filter.filterType === 'single-select' ? (
                            // Radio buttons for single select
                            <div className="grid grid-cols-2 gap-3">
                              {filter.values.filter(v => v.isActive).map((item) => (
                                <label key={item.value} className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                  <input
                                    type="radio"
                                    name={filter.name}
                                    checked={formData.filterValues[filter.name] === item.value}
                                    onChange={() => handleFilterValueChange(filter.name, item.value, false)}
                                    className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700 flex items-center gap-2">
                                    {item.colorCode && (
                                      <span
                                        className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                                        style={{ backgroundColor: item.colorCode }}
                                      />
                                    )}
                                    {item.displayName}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : filter.filterType === 'multi-select' ? (
                            // Checkboxes for multi select
                            <div className="grid grid-cols-2 gap-3">
                              {filter.values.filter(v => v.isActive).map((item) => (
                                <label key={item.value} className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={(formData.filterValues[filter.name] || []).includes(item.value)}
                                    onChange={() => handleFilterValueChange(filter.name, item.value, true)}
                                    className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700 flex items-center gap-2">
                                    {item.colorCode && (
                                      <span
                                        className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                                        style={{ backgroundColor: item.colorCode }}
                                      />
                                    )}
                                    {item.displayName}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            // Range input (for future use)
                            <div className="text-sm text-gray-500 italic bg-white p-3 rounded border">
                              Range filters are not implemented yet
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FaFilter className="text-5xl text-gray-300 mx-auto mb-3" />
                    <h5 className="text-lg font-medium text-gray-700 mb-2">No product attributes available</h5>
                    <p className="text-sm text-gray-500 mb-4">
                      {!formData.category
                        ? "Select a category above to see available product attributes"
                        : "No attributes are configured for this category"
                      }
                    </p>
                    <p className="text-xs text-gray-400">
                      Add filters in Filter Management to enable product attributes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // case 4:
      //   return (
      //     <div className="space-y-6">
      //       <div className="text-center">
      //         <h3 className="text-xl font-semibold text-gray-800 mb-2">Stock & Pricing</h3>
      //         <p className="text-gray-600">Set your product pricing and inventory</p>
      //       </div>

      //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-2">
      //             Price (₹) <span className="text-red-500">*</span>
      //           </label>
      //           <input
      //             type="number"
      //             value={formData.price}
      //             onChange={(e) => handleInputChange('price', e.target.value)}
      //             placeholder="0"
      //             min="1"
      //             className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.price
      //               ? 'border-red-300 focus:ring-red-500'
      //               : 'border-gray-300 focus:ring-blue-500'
      //               }`}
      //           />

      //         </div>

      //         <div className="flex items-center">
      //           <label className="flex items-center cursor-pointer bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 hover:bg-blue-100 transition-all">
      //             <input
      //               type="checkbox"
      //               checked={formData.hasSize}
      //               onChange={(e) => {
      //                 handleInputChange('hasSize', e.target.checked);
      //                 handleInputChange('sizes', []);
      //                 handleInputChange('stock', {});
      //               }}
      //               className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      //             />
      //             <span className="text-sm font-medium text-gray-700">Product has sizes</span>
      //           </label>
      //         </div>
      //       </div>

      //       {formData.hasSize ? (
      //         <div className="space-y-4">
      //           <div>
      //             <label className="block text-sm font-medium text-gray-700 mb-3">
      //               Available Sizes <span className="text-red-500">*</span>
      //             </label>
      //             <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      //               {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map(size => (
      //                 <button
      //                   key={size}
      //                   type="button"
      //                   placeholder="0"
      //                   min="1"
      //                   onClick={() => {
      //                     const newSizes = formData.sizes.includes(size)
      //                       ? formData.sizes.filter(s => s !== size)
      //                       : [...formData.sizes, size];
      //                     handleInputChange('sizes', newSizes);

      //                     // Remove stock for deselected size
      //                     if (!newSizes.includes(size)) {
      //                       const newStock = { ...formData.stock };
      //                       delete newStock[size];
      //                       handleInputChange('stock', newStock);
      //                     }
      //                   }}
      //                   className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${formData.sizes.includes(size)
      //                     ? 'bg-blue-600 text-white border-blue-600'
      //                     : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
      //                     }`}
      //                 >
      //                   {size}
      //                 </button>
      //               ))}
      //             </div>

      //           </div>

      //           {formData.sizes.length > 0 && (
      //             <div>
      //               <label className="block text-sm font-medium text-gray-700 mb-3">Stock per Size</label>
      //               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      //                 {formData.sizes.map(size => (
      //                   <div key={size} className="flex items-center space-x-2">
      //                     <span className="w-12 text-sm font-medium text-gray-700">{size}:</span>
      //                     <input
      //                       type="number"
      //                       min="0"
      //                       placeholder="0"

      //                       value={formData.stock[size] || 0}
      //                       onChange={(e) => handleInputChange('stock', {
      //                         ...formData.stock,
      //                         [size]: parseInt(e.target.value) || 0
      //                       })}
      //                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      //                     />
      //                   </div>
      //                 ))}
      //               </div>
      //             </div>
      //           )}
      //         </div>
      //       ) : (
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-2">
      //             Stock Quantity <span className="text-red-500">*</span>
      //           </label>
      //           <input
      //             type="number"
      //             min="0"
      //             value={formData.stock.value || 0}
      //             onChange={(e) => handleInputChange('stock', { value: parseInt(e.target.value) || 0 })}
      //             className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      //           />
      //         </div>
      //       )}
      //     </div>
      //   );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Stock & Pricing</h3>
              <p className="text-gray-600">Set your product pricing and inventory</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('price', value === '' ? 0 : parseInt(value));
                  }}
                  placeholder="0"
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.price
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 hover:bg-blue-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.hasSize}
                    onChange={(e) => {
                      handleInputChange('hasSize', e.target.checked);
                      handleInputChange('sizes', []);
                      handleInputChange('stock', {});
                    }}
                    className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Product has sizes</span>
                </label>
              </div>
            </div>

            {formData.hasSize ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Sizes <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const newSizes = formData.sizes.includes(size)
                            ? formData.sizes.filter((s) => s !== size)
                            : [...formData.sizes, size];
                          handleInputChange('sizes', newSizes);

                          if (!newSizes.includes(size)) {
                            const newStock = { ...formData.stock };
                            delete newStock[size];
                            handleInputChange('stock', newStock);
                          }
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${formData.sizes.includes(size)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Stock per Size</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.sizes.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <span className="w-14 text-sm font-medium text-gray-700">{size}:</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            value={
                              formData.stock[size] === undefined || formData.stock[size] === 0
                                ? ''
                                : formData.stock[size]
                            }
                            onChange={(e) =>
                              handleInputChange('stock', {
                                ...formData.stock,
                                [size]: e.target.value === '' ? 0 : parseInt(e.target.value)
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  value={formData.stock?.value === 0 ? '' : formData.stock?.value}
                  onChange={(e) =>
                    handleInputChange('stock', {
                      value: e.target.value === '' ? 0 : parseInt(e.target.value)
                    })
                  }
                  className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        );

      default:
        return <div>Step content will be added</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
        <p className="text-gray-600 mt-1">Create a new product listing for your store</p>
      </div>

      {/* Progress Steps */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep >= step.id
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-500'
                }`}>
                {currentStep > step.id ? (
                  <FaCheck className="text-sm" />
                ) : (
                  <step.icon className="text-sm" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={onSubmitHandler}
        onKeyDown={(e) => {
          if (e.key === "Enter" && currentStep !== totalSteps) {
            e.preventDefault(); // Prevent auto-submit on intermediate steps
          }
        }}
        className="p-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep === totalSteps ? (
            <button
              type="submit"
              disabled={uploading}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Product...
                </div>
              ) : (
                'Create Product'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Add;
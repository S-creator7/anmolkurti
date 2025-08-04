import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';


export default function EditProductModal({ product, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    gender: '',
    category: '',
    subCategory: '',
    occasion: [],
    type: [],
    filterTags: [],
    bestseller: false,
    hasSize: false,
    sizes: [],
    stock: {},
    filters: {},
  });

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        occasion: product.occasion || [],
        type: product.type || [],
        filterTags: product.filterTags || [],
        sizes: product.sizes || [],
        stock: product.stock || (product.hasSize ? {} : 0),
        filters: product.filters || {},
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value.split(',').map(v => v.trim()) }));
  };

  const handleStockChange = (size, value) => {
    setFormData(prev => ({
      ...prev,
      stock: {
        ...prev.stock,
        [size]: Number(value),
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      ...formData,
      price: Number(formData.price),
      occasion: JSON.stringify(formData.occasion),
      type: JSON.stringify(formData.type),
      filterTags: JSON.stringify(formData.filterTags),
      sizes: JSON.stringify(formData.sizes),
      filters: JSON.stringify(formData.filters),
      hasSize: String(formData.hasSize),
      bestseller: String(formData.bestseller),
      stock: JSON.stringify(formData.hasSize ? formData.stock : { value: formData.stock }),
    };

    try {
      const res = await axios.put(backendUrl.join(`/product/${product._id}`), payload, {
        headers: { token }
      });
      console.log("Edit product response", res)
      if (res.data.success) {
        toast.success("Product updated successfully!");
        onUpdate(res.data.product);
        onClose();
      } else {
        toast.error("Update failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
          <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full border p-2 rounded" />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="w-full border p-2 rounded" />
          <input name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="Sub Category" className="w-full border p-2 rounded" />
          <input name="gender" value={formData.gender} onChange={handleChange} placeholder="Gender" className="w-full border p-2 rounded" />

          <input name="occasion" value={formData.occasion.join(', ')} onChange={(e) => handleArrayChange('occasion', e.target.value)} placeholder="Occasion (comma-separated)" className="w-full border p-2 rounded" />
          <input name="type" value={formData.type.join(', ')} onChange={(e) => handleArrayChange('type', e.target.value)} placeholder="Type (comma-separated)" className="w-full border p-2 rounded" />
          <input name="filterTags" value={formData.filterTags.join(', ')} onChange={(e) => handleArrayChange('filterTags', e.target.value)} placeholder="Filter Tags (comma-separated)" className="w-full border p-2 rounded" />
          <input name="sizes" value={formData.sizes.join(', ')} onChange={(e) => handleArrayChange('sizes', e.target.value)} placeholder="Sizes (comma-separated)" className="w-full border p-2 rounded" />

          <label className="flex items-center gap-2">
            <input type="checkbox" name="hasSize" checked={formData.hasSize} onChange={handleChange} />
            Has Sizes
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="bestseller" checked={formData.bestseller} onChange={handleChange} />
            Bestseller
          </label>

          {formData.hasSize ? (
            <div className="space-y-2">
              {formData.sizes.map(size => (
                <div key={size} className="flex gap-2 items-center">
                  <label className="w-16">{size}</label>
                  <input type="number" className="border p-1 rounded w-full" value={formData.stock[size] || 0} onChange={(e) => handleStockChange(size, e.target.value)} />
                </div>
              ))}
            </div>
          ) : (
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={formData.stock || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
              placeholder="Stock"
            />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
          </div>

        </form>
      </div>
    </div>
  );
}

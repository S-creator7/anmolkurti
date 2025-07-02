import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const categories = ['Saree', 'Kurti', 'Suit', 'Shirt', 'Pants'];

const FilterManager = ({ token }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [filters, setFilters] = useState([]);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterValues, setNewFilterValues] = useState('');
  const [editingFilterId, setEditingFilterId] = useState(null);
  const [editingFilterValues, setEditingFilterValues] = useState('');

  const fetchFilters = async (category) => {
    try {
      const response = await axios.get(`${backendUrl}/api/filter/${category}`);
      if (response.data.success) {
        setFilters(response.data.filters);
      } else {
        toast.error('Failed to fetch filters');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchFilters(activeCategory);
  }, [activeCategory]);

  const handleAddFilter = async () => {
    if (!newFilterName.trim() || !newFilterValues.trim()) {
      toast.error('Filter name and values are required');
      return;
    }
    const valuesArray = newFilterValues.split(',').map(v => v.trim()).filter(v => v);
    try {
      const response = await axios.post(
        `${backendUrl}/api/filter`,
        { category: activeCategory, filterName: newFilterName, filterValues: valuesArray },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Filter added');
        setNewFilterName('');
        setNewFilterValues('');
        fetchFilters(activeCategory);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateFilter = async (id) => {
    if (!editingFilterValues.trim()) {
      toast.error('Filter values are required');
      return;
    }
    const valuesArray = editingFilterValues.split(',').map(v => v.trim()).filter(v => v);
    try {
      const response = await axios.put(
        `${backendUrl}/api/filter/${id}`,
        { filterValues: valuesArray },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Filter updated');
        setEditingFilterId(null);
        setEditingFilterValues('');
        fetchFilters(activeCategory);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteFilter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this filter?')) return;
    try {
      const response = await axios.delete(`${backendUrl}/api/filter/${id}`, { headers: { token } });
      if (response.data.success) {
        toast.success('Filter deleted');
        fetchFilters(activeCategory);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Filter Manager</h2>
      <div className="flex gap-4 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            className={`px-4 py-2 border rounded ${activeCategory === cat ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add New Filter</h3>
        <input
          type="text"
          placeholder="Filter Name"
          value={newFilterName}
          onChange={e => setNewFilterName(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <input
          type="text"
          placeholder="Filter Values (comma separated)"
          value={newFilterValues}
          onChange={e => setNewFilterValues(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <button onClick={handleAddFilter} className="bg-green-500 text-white px-3 py-1 rounded">Add</button>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Existing Filters</h3>
        {filters.length === 0 && <p>No filters found for this category.</p>}
        {filters.map(filter => (
          <div key={filter._id} className="mb-4 border p-3 rounded">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{filter.filterName}</div>
              <div>
                {editingFilterId === filter._id ? (
                  <>
                    <button
                      onClick={() => handleUpdateFilter(filter._id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingFilterId(null);
                        setEditingFilterValues('');
                      }}
                      className="bg-gray-300 px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingFilterId(filter._id);
                        setEditingFilterValues(filter.filterValues.join(', '));
                      }}
                      className="bg-yellow-400 px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(filter._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            {editingFilterId === filter._id ? (
              <input
                type="text"
                value={editingFilterValues}
                onChange={e => setEditingFilterValues(e.target.value)}
                className="border px-2 py-1 w-full"
              />
            ) : (
              <div>{filter.filterValues.join(', ')}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterManager;

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children, token }) => {
  const [filters, setFilters] = useState([]);
  const [dynamicFilters, setDynamicFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    gender: ['Women', 'Men', 'Children'],
    occasion: ['Casual', 'Office', 'Party', 'Wedding', 'Festival'],
    type: ['Plain', 'Printed', 'Embroidered', 'Designer'],
    color: ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Black', 'White'],
    size: ['S', 'M', 'L', 'XL', 'XXL'],
    material: ['Cotton', 'Silk', 'Polyester', 'Georgette']
  });

  // Fetch all filters from backend
  const fetchFilters = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/filter`, {
        headers: token ? { token } : {}
      });
      if (response.data.success) {
        setFilters(response.data.filters);
        
        // Update filter options from fetched filters
        const options = {};
        response.data.filters.forEach(filter => {
          options[filter.name] = filter.values.filter(v => v.isActive).map(v => v.value);
        });
        setFilterOptions(prev => ({ ...prev, ...options }));
      }
    } catch (error) {
      console.error('Failed to fetch filters:', error);
      toast.error('Failed to fetch filters');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dynamic filters from products
  const fetchDynamicFilters = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/filter/dynamic`);
      if (response.data.success) {
        setDynamicFilters(response.data.filters);
      }
    } catch (error) {
      console.error('Failed to fetch dynamic filters:', error);
    }
  };

  // Add new filter
  const addFilter = async (filterData) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/filter`,
        filterData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Filter added successfully');
        await fetchFilters();
        await fetchDynamicFilters();
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add filter');
      return false;
    }
  };

  // Update filter
  const updateFilter = async (filterId, filterData) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/filter/${filterId}`,
        filterData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Filter updated successfully');
        await fetchFilters();
        await fetchDynamicFilters();
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update filter');
      return false;
    }
  };

  // Delete filter
  const deleteFilter = async (filterId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/filter/${filterId}`, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success('Filter deleted successfully');
        await fetchFilters();
        await fetchDynamicFilters();
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete filter');
      return false;
    }
  };

  // Initialize default filters
  const initializeDefaultFilters = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/filter/initialize`, {}, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success('Default filters initialized successfully');
        await fetchFilters();
        await fetchDynamicFilters();
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize filters');
      return false;
    }
  };

  // Get filter by name
  const getFilterByName = (name) => {
    return filters.find(f => f.name === name);
  };

  // Get filter values by name
  const getFilterValues = (filterName) => {
    const filter = getFilterByName(filterName);
    return filter ? filter.values.filter(v => v.isActive).map(v => v.value) : [];
  };

  // Get global filters
  const getGlobalFilters = () => {
    return filters.filter(f => f.type === 'global');
  };

  // Get category-specific filters for a category
  const getCategoryFilters = (category) => {
    return filters.filter(f => 
      f.type === 'category-specific' && 
      f.applicableCategories.includes(category)
    );
  };

  // Get all applicable filters for a category (global + category-specific)
  const getApplicableFilters = (category) => {
    return filters.filter(f => 
      f.type === 'global' || 
      (f.type === 'category-specific' && f.applicableCategories.includes(category))
    );
  };

  // Refresh all filter data
  const refreshFilters = async () => {
    await Promise.all([fetchFilters(), fetchDynamicFilters()]);
  };

  useEffect(() => {
    refreshFilters();
  }, [token]);

  const value = {
    filters,
    dynamicFilters,
    filterOptions,
    loading,
    addFilter,
    updateFilter,
    deleteFilter,
    initializeDefaultFilters,
    getFilterByName,
    getFilterValues,
    getGlobalFilters,
    getCategoryFilters,
    getApplicableFilters,
    refreshFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}; 
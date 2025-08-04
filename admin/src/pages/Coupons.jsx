import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl, currency } from '../App';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    applicableCategories: [],
    excludedCategories: [],
    couponType: 'public',
    firstTimeUserOnly: false,
    minimumPurchaseItems: 1,
    maximumUsagePerUser: 1,
    stackable: false,
    priority: 1,
    bannerImage: '',
    termsAndConditions: [],
    isActive: true
  });


  const token = localStorage.getItem('token');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(backendUrl.join(`/coupon/list`), {
        headers: { token }
      });
      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Fix for usageLimit and discountValue fields to prevent scroll changing values
    if ((name === 'usageLimit' || name === 'discountValue' || name === 'maximumDiscountAmount') && value !== '') {
      // Allow only numbers and prevent scroll changing value
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const parseLocalDateTime = (value) => {
      if (!value) return null;
      const [date, time] = value.split('T');
      if (!date || !time) return null;
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, 0);
    };

    const now = new Date();
    now.setSeconds(0, 0); // Round to nearest minute
    now.setMinutes(now.getMinutes() - 1);
    const validFromDate = parseLocalDateTime(formData.validFrom);
    const validUntilDate = parseLocalDateTime(formData.validUntil);
    validUntilDate.setSeconds(0, 0);
    if (!validFromDate || !validUntilDate || isNaN(validFromDate.getTime()) || isNaN(validUntilDate.getTime())) {
      toast.error('Please provide valid dates for Valid From and Valid Until.');
      setIsLoading(false);
      return;
    }

    if (validFromDate > validUntilDate) {
      toast.error('Valid From date must be less than or equal to Valid Until date.');
      setIsLoading(false);
      return;
    }

    if (validFromDate.getTime() < now.getTime()) {
      toast.error('Valid From date must be greater than the current date and time.');
      setIsLoading(false);
      return;
    }


    if (validUntilDate < validFromDate) {
      toast.error('Valid Until date must be greater than or equal to Valid From date.');
      setIsLoading(false);
      return;
    }

    // Validate discountValue presence based on discountType
    if ((formData.discountType === 'percentage' || formData.discountType === 'fixed') && (!formData.discountValue || formData.discountValue === '')) {
      toast.error('Discount Value is required for percentage and fixed discount types.');
      setIsLoading(false);
      return;
    }

    try {
      // Sanitize and validate coupon code
      const sanitizedCode = formData.code.trim().toUpperCase();
      const codePattern = /^[A-Z0-9_-]+$/;
      if (!codePattern.test(sanitizedCode)) {
        toast.error('Coupon code must contain only uppercase letters, numbers, underscores, and hyphens');
        setIsLoading(false);
        return;
      }

      const url = editingCoupon
        ? backendUrl.join(`/coupon/update/${editingCoupon._id}`)
        : backendUrl.join(`/coupon/create`);

      const method = editingCoupon ? 'put' : 'post';

      // Ensure termsAndConditions is an array before sending
      const { isActive, discountValue, discountType, bannerImage, ...restFormData } = formData;
      const dataToSend = {
        ...restFormData,
        code: sanitizedCode,
        discountType,
        discountValue: (discountType === 'percentage' || discountType === 'fixed') && discountValue !== '' && discountValue !== undefined ? Number(discountValue) : undefined,
        maximumDiscountAmount: discountType === 'percentage' && formData.maximumDiscountAmount ? Number(formData.maximumDiscountAmount) : undefined,
        bannerImage: bannerImage || undefined,
        termsAndConditions: Array.isArray(formData.termsAndConditions)
          ? (formData.termsAndConditions.length > 0 ? formData.termsAndConditions : ['N/A'])
          : (typeof formData.termsAndConditions === 'string' ? formData.termsAndConditions.split('\n').filter(line => line.trim() !== '') : ['N/A'])
      };

      const response = await axios[method](url, dataToSend, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        setShowForm(false);
        setEditingCoupon(null);
        resetForm();
        loadCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      validFrom: new Date(new Date(coupon.validFrom).toDateString() + ' 00:00:00').toISOString().slice(0, 16),
      validUntil: new Date(new Date(coupon.validUntil).toDateString() + ' 23:59:59').toISOString().slice(0, 16),
      applicableCategories: coupon.applicableCategories || [],
      excludedCategories: coupon.excludedCategories || [],
      couponType: coupon.couponType,
      firstTimeUserOnly: coupon.firstTimeUserOnly,
      minimumPurchaseItems: coupon.minimumPurchaseItems,
      maximumUsagePerUser: coupon.maximumUsagePerUser,
      stackable: coupon.stackable,
      priority: coupon.priority,
      bannerImage: coupon.bannerImage || '',
      // termsAndConditions: [],
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const response = await axios.delete(backendUrl.join(`/coupon/delete/${couponId}`), {
        headers: { token }
      });

      if (response.data.success) {
        toast.success('Coupon deleted successfully!');
        loadCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      applicableCategories: [],
      excludedCategories: [],
      couponType: 'public',
      firstTimeUserOnly: false,
      minimumPurchaseItems: 1,
      maximumUsagePerUser: 1,
      stackable: false,
      priority: 1,
      bannerImage: '',
      // termsAndConditions: '',
      isActive: true
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else if (coupon.discountType === 'free_shipping') {
      return 'FREE SHIPPING';
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  };

  const formatDateToInput = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCoupon(null);
            resetForm();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Coupon
        </button>
      </div>

      {/* Coupon Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    // Allow only uppercase letters, numbers, underscores, and hyphens
                    if (/^[A-Z0-9_-]*$/.test(value)) {
                      setFormData(prev => ({ ...prev, code: value }));
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Coupon Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Discount Type *</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              {(formData.discountType === 'percentage' || formData.discountType === 'fixed') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order Amount</label>
                <input
                  type="number"
                  name="minimumOrderAmount"
                  value={formData.minimumOrderAmount}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Maximum Discount Amount</label>
                  <input
                    type="number"
                    name="maximumDiscountAmount"
                    value={formData.maximumDiscountAmount}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valid From *</label>
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  min={formatDateToInput(new Date())}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valid Until *</label>
                <input
                  type="datetime-local"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Coupon Type</label>
                <select
                  name="couponType"
                  value={formData.couponType}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="first_order">First Time User</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="flash_sale">Flash Sale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Banner Image</label>
              <input
                type="file"
                name="bannerImage"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  // Placeholder: Implement actual upload logic here
                  // For now, simulate upload and set formData.bannerImage to file name or URL
                  // You can replace this with actual upload to backend or cloud storage
                  const uploadedImageUrl = URL.createObjectURL(file);

                  setFormData(prev => ({
                    ...prev,
                    bannerImage: uploadedImageUrl
                  }));
                }}
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="firstTimeUserOnly"
                  checked={formData.firstTimeUserOnly}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                First Time User Only
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="stackable"
                  checked={formData.stackable}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Stackable with other coupons
              </label>

            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isLoading ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCoupon(null);
                  resetForm();
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">All Coupons</h2>
        </div>

        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Usage</th>
                  <th className="px-4 py-3 text-left">Valid Until</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-t">
                    <td className="px-4 py-3 font-mono">{coupon.code}</td>
                    <td className="px-4 py-3">{coupon.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                        {formatDiscount(coupon)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {coupon.usedCount}/{coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-4 py-3">{formatDate(coupon.validUntil)}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const now = new Date();
                        const validFrom = new Date(coupon.validFrom);
                        const validUntil = new Date(coupon.validUntil);
                        const isWithinDateRange = now >= validFrom && now <= validUntil;
                        const hasUsageLeft = coupon.usedCount < (coupon.usageLimit || Infinity);
                        const isActive = isWithinDateRange && hasUsageLeft;
                        return (
                          <span className={`px-2 py-1 rounded text-sm ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;

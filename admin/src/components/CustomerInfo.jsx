import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const CustomerInfo = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await axios.get(backendUrl + '/api/user/list', {
        headers: { token }
      });
      if (response.data.success) {
        setCustomers(response.data.users);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6 bg-purple-100 rounded shadow">
      <h3 className="text-xl font-semibold mb-4 text-purple-800">Customer Information</h3>
      {loadingCustomers ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div className="overflow-x-auto max-h-64">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-purple-200 sticky top-0">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Phone Number</th>
                <th className="border px-4 py-2 text-left">Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id} className="hover:bg-purple-50">
                  <td className="border px-4 py-2">{customer.name}</td>
                  <td className="border px-4 py-2">{customer.email}</td>
                  <td className="border px-4 py-2">{customer.phone || 'N/A'}</td>
                  <td className="border px-4 py-2">{customer.address || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

CustomerInfo.propTypes = {
  token: PropTypes.string.isRequired,
};

export default CustomerInfo;

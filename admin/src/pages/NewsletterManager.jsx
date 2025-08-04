import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import Pagination from '../components/Pagination';

const token = localStorage.getItem('token');

const NewsletterManager = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    useEffect(() => {
        fetchSubscribers();
    }, []);


    const fetchSubscribers = async (pageNum = page) => {
        try {
            const res = await axios.get(backendUrl.join(`/newsletter/subscribers`), {
                params: { page: pageNum, limit },
                headers: { token },
            });
            setSubscribers(res.data.data);
            setPagination(res.data.pagination);
            setPage(res.data.pagination.page);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold mb-4">Newsletter Subscribers</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>

                    <table className="w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2 text-left">Email</th>
                                <th className="border px-4 py-2 text-left">Subscribed On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr key={sub._id}>
                                    <td className="border px-4 py-2">{sub.email}</td>
                                    <td className="border px-4 py-2">
                                        {new Date(sub.subscribedAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-6 border-t">
                        <Pagination
                            page={page}
                            total={pagination.total}
                            limit={limit}
                            onPageChange={(newPage) => fetchSubscribers(newPage)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default NewsletterManager;

import React, { useState, useEffect } from 'react';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:3000/myorders', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                    },
                });
                const data = await response.json();
                if (data) {
                    setOrders(data);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div>
            {loading ? <p>Loading...</p> : (
                <div>
                    {orders.length === 0 ? (
                        <p>No orders found</p>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id}>
                                <h3>Order Date: {new Date(order.orderDate).toLocaleDateString()}</h3>
                                <p>Status: {order.status}</p>
                                <p>Payment ID: {order.paymentId}</p>
                                <p>Total Cost: ${order.totalCost}</p>
                                <h4>Delivery Information:</h4>
                                <p>Name: {order.deliveryInfo.firstName} {order.deliveryInfo.lastName}</p>
                                <p>Email: {order.deliveryInfo.email}</p>
                                <p>Phone: {order.deliveryInfo.phone}</p>
                                <p>Address: {order.deliveryInfo.address}, {order.deliveryInfo.city}, {order.deliveryInfo.postalCode}</p>
                                <h4>Items:</h4>
                                <ul>
                                    {order.items.map((item, index) => (
                                        <li key={index}>{item.name} - ${item.price}</li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MyOrders;

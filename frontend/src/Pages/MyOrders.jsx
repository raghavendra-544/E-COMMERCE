import React, { useState, useEffect } from 'react';
import './CSS/MyOrders.css'; // Ensure CSS file is linked
import packageOrderImage from '../Components/Assets/package_order.svg'; // Import the local image

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:3000/myorders', {
                    method: 'GET',
                    headers: {
                        'auth-token': localStorage.getItem('auth-token'),
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched Orders:", data); // Debugging

                // Sort orders by orderDate (latest first)
                const sortedOrders = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                
                setOrders(sortedOrders || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="my-orders-container">
            <h2>My Orders</h2>
            {loading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div>
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <h3>Order Date: {new Date(order.orderDate).toLocaleString()}</h3>
                                <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery || '5-7 business days'}</p>
                                <p><strong>Status:</strong>
                                    <span className={`order-status status-${order.status?.toLowerCase() || 'pending'}`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </p>
                                {order.paymentDate && (
                                    <p><strong>Payment Date:</strong> {new Date(order.paymentDate).toLocaleString()}</p>
                                )}
                                <p><strong>Total Cost:</strong> ₹{order.totalCost}</p>
                            </div>

                            <h4>Delivery Information</h4>
                            <p><strong>Name:</strong> {order.deliveryInfo?.firstName || ''} {order.deliveryInfo?.lastName || ''}</p>
                            <p><strong>Email:</strong> {order.deliveryInfo?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {order.deliveryInfo?.phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {order.deliveryInfo?.address || ''}, {order.deliveryInfo?.city || ''}, {order.deliveryInfo?.postalCode || ''}</p>

                            <h4>Items Ordered:</h4>
                            <div className="order-items-container"> {/* New container for better styling */}
                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img src={item.image || packageOrderImage} alt={item.name} className="order-item-image"/>
                                            <div className="order-item-details">
                                                <h5>{item.name}</h5>
                                                <p><strong>Quantity:</strong> {item.quantity || 1}</p> {/* Added quantity */}
                                                <p><strong>Payment ID:</strong> {order.paymentId || 'N/A'}</p>
                                                <p><strong>Payment Status: </strong>
                                                    <span className={order.paymentId ? 'paid' : 'unpaid'}>
                                                        {order.paymentId ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;

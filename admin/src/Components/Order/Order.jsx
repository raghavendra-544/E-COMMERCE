import { useState, useEffect } from 'react';
import './Order.css'; // Ensure CSS file is linked
import packageOrderImage from '../../assets/package_order.svg'; // Import the local image

const Order = () => {
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

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/myorders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            setOrders((prevOrders) => 
                prevOrders.map((order) => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    return (
        <div className="my-orders-container">
            <h2>Orders</h2>
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
                                <p><strong>Status:</strong> {order.status || 'Pending'}</p>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
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
                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img 
                                            src={item.image || packageOrderImage} 
                                            alt={item.name} 
                                            className="order-item-image" 
                                        />
                                        <div className="order-item-details">
                                            <h5>{item.name}</h5>
                                            <p><strong>Payment ID:</strong> {order.paymentId || 'N/A'}</p>
                                            <p>
                                                <strong>Payment Status: </strong>
                                                <span className={order.paymentId ? 'paid' : 'unpaid'}>
                                                    {order.paymentId ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Order;

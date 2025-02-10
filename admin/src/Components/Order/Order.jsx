import { useState, useEffect } from 'react';
import './Order.css'
import packageOrderImage from '../../assets/package_order.svg'; // Import default order image

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/orders', {
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
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status.');
            }

            const updatedOrder = await response.json();
            console.log('Updated Order:', updatedOrder);

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error);
            setError('Failed to update order status.');
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete order.');
            }

            setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            setError('Failed to delete order.');
        }
    };

    return (
        <div className="admin-orders-container">
            <h2>Manage Orders</h2>
            {loading ? (
                <p>Loading orders...</p>
            ) : error ? (
                <p className="error">{error}</p>
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
                                    <select 
                                        value={order.status || 'Pending'} 
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </p>
                                <p><strong>Total Cost:</strong> ₹{order.totalCost}</p>
                            </div>

                            <h4>Delivery Information</h4>
                            <p><strong>Name:</strong> {order.deliveryInfo?.firstName || ''} {order.deliveryInfo?.lastName || ''}</p>
                            <p><strong>Email:</strong> {order.deliveryInfo?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {order.deliveryInfo?.phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {order.deliveryInfo?.address || ''}, {order.deliveryInfo?.city || ''}, {order.deliveryInfo?.postalCode || ''}</p>

                            <h4>Items Ordered:</h4>
                            <div className="order-items-container">
                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img src={item.image || packageOrderImage} alt={item.name} className="order-item-image"/>
                                            <div className="order-item-details">
                                                <h5>{item.name}</h5>
                                                <p><strong>Quantity:</strong> {item.quantity || 1}</p>
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

                            <button className="delete-button" onClick={() => deleteOrder(order._id)}>Delete Order</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;

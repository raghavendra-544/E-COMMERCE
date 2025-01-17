// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import './Order.css';  // Ensure you have this file for styling

const Order = () => {
  const [orders, setOrders] = useState([]);

  // Fetch orders when the component mounts
  const fetchOrders = async () => {
    await fetch('http://localhost:3000/orders')  // Assuming this endpoint returns orders
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="order-container">
      <h1>Customer Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <h3>Order ID: {order.id}</h3>
            <p><strong>Customer Name:</strong> {order.customerName}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
            <div className="order-items">
              <h4>Products Ordered:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <p>{item.productName} x {item.quantity}</p>
                  <p>₹{item.productPrice}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Order;

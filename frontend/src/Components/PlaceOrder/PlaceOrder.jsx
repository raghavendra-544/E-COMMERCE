import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';

import './PlaceOrder.css';

const PlaceOrder = () => {
  const { getTotalCartAmount, getTotalCartItems, cartItems } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '', // Changed from 'street'
    city: '',
    state: '',
    postalCode: '', // Changed from 'zipCode'
    country: '',
    phone: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const cartTotal = getTotalCartAmount();
  const cartItemCount = getTotalCartItems();
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('auth-token') !== null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handlePayment = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.postalCode) {
      alert('Please fill in all required fields.');
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch('http://localhost:3000/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal === 0 ? 0 : cartTotal + 50,
          currency: 'INR',
        }),
      });

      if (!response.ok) throw new Error('Error initiating payment');

      const data = await response.json();
      const options = {
        key: 'rzp_test_4HWc8dIvl5vg8Y',
        amount: data.amount,
        currency: data.currency,
        name: 'FASHIONMART',
        order_id: data.orderId,
        handler: function(response) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#F37254' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = async (razorpayData) => {
    // Calculate total quantity of items in the cart
    const totalItems = Array.isArray(cartItems) 
        ? cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0) 
        : 0;

    const orderData = {
        orderDate: new Date().toISOString(), // Ensure order date is recorded
        paymentId: razorpayData.razorpay_payment_id,
        paymentDate: new Date().toISOString(), // Capture payment date
        totalCost: cartTotal === 0 ? 0 : cartTotal + 50,
        totalItems: totalItems,  // Updated total item count
        items: cartItems,
        deliveryInfo: {
            ...formData,
            address: formData.address, // Ensure correct field mapping
            postalCode: formData.postalCode
        }
    };

    console.log("Order Data to save:", orderData);

    try {
        const response = await fetch('http://localhost:3000/saveorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('auth-token'),
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Error saving order:', errorMessage);
            alert(`Error saving order: ${errorMessage}`);
            return;
        }

        const data = await response.json();
        if (data.success) {
            console.log('Order saved successfully:', data);
            window.location.href = '/myorders';
        } else {
            console.error('Failed to save order:', data);
            alert('Failed to save order');
        }
    } catch (error) {
        console.error('Error saving order:', error);
        alert('Error saving order');
    }
};


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePayment();
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
};

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
        </div>
        <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} required />
        <div className="multi-fields">
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
          <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
        </div>
        <div className="multi-fields">
          <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} required />
          <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
        </div>
        <PhoneInput name="phone" placeholder='Phone' country={'in'} value={formData.phone} onChange={handlePhoneChange} required/>
      </div>

      <div className="place-order-right">
        <div className="cartitems-total">
          <h1>Cart Summary</h1>
          <p>Total items: {cartItemCount}</p>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₹{cartTotal}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>₹{cartTotal === 0 ? 0 : 50}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>₹{cartTotal === 0 ? 0 : cartTotal + 50}</h3>
            </div>
          </div>
          <button type="submit" disabled={cartTotal === 0 || paymentLoading}>
            {paymentLoading ? 'Processing Payment...' : 'PROCEED TO PAYMENT'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;

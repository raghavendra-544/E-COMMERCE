import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const { getTotalCartAmount, getTotalCartItems } = useContext(ShopContext);
  const [userData, setUserData] = useState(null); // Store user data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  }); // Manage user input
  const [loading, setLoading] = useState(true); // Loading state for user data
  const [paymentLoading, setPaymentLoading] = useState(false); // Loading state for payment
  const cartTotal = getTotalCartAmount();
  const cartItemCount = getTotalCartItems();

  // Fetch user data if it's not available in context
  useEffect(() => {
    const fetchUserData = async () => {
      if (localStorage.getItem('auth-token')) {
        try {
          const response = await fetch('http://localhost:3000/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch user data');
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false); // Set loading to false once the data is fetched
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle payment initiation
  const handlePayment = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Please fill in your contact details.');
      return;
    }

    setPaymentLoading(true); // Set payment loading state

    try {
      const response = await fetch('http://localhost:3000/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal === 0 ? 0 : cartTotal + 50, // Add shipping fee if cart total > 0
          currency: 'INR',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.statusText}, ${errorText}`);
      }

      const data = await response.json();
      const { orderId, amount, currency } = data;

      const options = {
        key: 'rzp_test_4HWc8dIvl5vg8Y', // Razorpay public key
        amount, // Amount in paise
        currency,
        name: 'FASHIONMART',
        description: 'Order Description',
        order_id: orderId, // Razorpay order ID from backend
        handler: function(response) {
          console.log("Payment Successful:", response);
          verifyPayment(response); // Pass the response to the verification function
        },
        prefill: {
          name: userData?.name || `${formData.firstName} ${formData.lastName}`,
          email: userData?.email || formData.email,
          contact: userData?.phone || formData.phone,
        },
        theme: { color: '#F37254' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment');
    } finally {
      setPaymentLoading(false); // Set loading state to false after payment initiation
    }
  };

  const verifyPayment = async (response) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
  
    if (!razorpay_order_id || !razorpay_signature) {
      alert('Missing order ID or signature!');
      return;
    }
  
    try {
      const verificationResponse = await fetch('http://localhost:3000/razorpay/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        }),
      });
  
      const result = await verificationResponse.json();
      if (result.status === 'ok') {
        alert('Payment Successful!');
      } else {
        alert('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Error verifying payment');
    }
  };

  // Handle form field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handlePayment();
  };

  if (loading) {
    return <p>Loading user data...</p>;
  }

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="street"
          placeholder="Street"
          value={formData.street}
          onChange={handleChange}
          required
        />
        <div className="multi-fields">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="multi-fields">
          <input
            type="text"
            name="zipCode"
            placeholder="Zip code"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
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

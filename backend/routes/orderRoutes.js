const express = require("express");
const Razorpay = require("razorpay");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const fs = require('fs');
const { readData, writeData } = require('../utils/fileUtils'); // Assuming you move file logic to utils

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_4HWc8dIvl5vg8Y",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "UFr06eUFazTXJtsXmc3RPEA9",
});

// Order creation
router.post('/razorpay/order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    
    const options = {
        amount: amount * 100, // Convert amount to paise
        currency,
        receipt,
        notes, 
    };
    
    const order = await razorpay.orders.create(options);
    
    const orders = readData();
    orders.push({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: 'created',
    });
    writeData(orders);
    
    res.json(order); // Send order details to frontend
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
});

// Payment verification
router.post('razorpay/payment/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const secret = razorpay.key_secret;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  try {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
    if (isValidSignature) {
      const orders = readData();
      const order = orders.find(o => o.order_id === razorpay_order_id);
      if (order) {
        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        writeData(orders);
      }
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'verification_failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }
});

module.exports = router;

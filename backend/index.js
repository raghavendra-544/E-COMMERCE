const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3001',  // Allow frontend
        'http://localhost:5173'   // Allow admin
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  // Allow cookies if necessary
}));

// Authentication middleware
const fetchUser = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_ecom");
        req.user = decoded;  // Attach user information to the request object
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: "Invalid token" });
    }
};


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://ragava5454:Ragav%402004@cluster0.p1tdy.mongodb.net/e-commerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.get("/", (req, res) => res.send("Express App is Running"));

// Image Upload Setup
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });
app.use('/images', express.static('upload/images'));

// Image Upload Endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: "No file uploaded." });
    }
    res.json({
        success: 1,
        image_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/images/${req.file.filename}`
    });
});

// Product Schema
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

// Add Product Endpoint
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = (products.length > 0) ? products[products.length - 1].id + 1 : 1;
        const product = new Product({
            id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: "Error adding product" });
    }
});

// Remove Product Endpoint
app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error removing product" });
    }
});

// Get All Products Endpoint
app.get('/allproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
        console.log("All Products Fetched");
    } catch (error) {
        res.status(500).json({ error: "Error fetching products" });
    }
});

// New Collections Endpoint
app.get('/newcollections', async (req, res) => {
    try {
        const products = await Product.find({});
        const newCollection = products.slice(-8);
        res.json(newCollection);
        console.log("NewCollections Fetched");
    } catch (error) {
        res.status(500).json({ error: "Error fetching collections" });
    }
});

// Popular in Women Endpoint
app.get('/popularinwomen', async (req, res) => {
    try {
        const products = await Product.find({ category: "women" });
        const popularInWomen = products.slice(0, 4);
        res.json(popularInWomen);
        console.log("PopularinWomen Fetched");
    } catch (error) {
        res.status(500).json({ error: "Error fetching popular items" });
    }
});

// Razorpay Setup
const razorpay = new Razorpay({
    key_id: "rzp_test_4HWc8dIvl5vg8Y",
    key_secret: "UFr06eUFazTXJtsXmc3RPEA9",
});

// Create Razorpay Order
app.post('/razorpay/order', async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;
        const options = { amount: amount * 100, currency, receipt, notes };
        const order = await razorpay.orders.create(options);
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating Razorpay order" });
    }
});

const crypto = require('crypto');

// Backend route to verify payment
app.post('/razorpay/payment/verify', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  try {
    // Fetch the order from Razorpay using the order_id
    const order = await razorpay.orders.fetch(razorpay_order_id);

    // Generate the expected signature using the secret key
    const generated_signature = crypto
      .createHmac('sha256', 'UFr06eUFazTXJtsXmc3RPEA9') // Razorpay secret key
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Compare the generated signature with the received signature
    if (generated_signature === razorpay_signature) {
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'error', message: 'Signature verification failed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ status: 'error', message: 'Payment verification failed' });
  }
});

// User Schema
const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    deliveryInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    paymentId: { type: String, required: true },
    totalCost: { type: Number, required: true },
    items: [{ type: Object, required: true }],  // Array of items in the order
    orderDate: { type: Date, default: Date.now },
    paymentDate: new Date().toISOString(),
    status: { type: String, default: 'Pending' },  // or 'Completed', 'Shipped', etc.
});


// Save order after payment verification (no middleware)
app.post('/saveorder', async (req, res) => {
    const { paymentId, deliveryInfo, totalCost, items, paymentDate } = req.body;
    console.log("Order Data to Save:", req.body);

    // Extract user from token
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || "secret_ecom");
        const user = await Users.findById(data.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const formattedItems = Object.entries(items) // Convert to array
        .filter(([key, value]) => value > 0)    // Remove items with 0 quantity
        .map(([key, value]) => ({ productId: key, quantity: value })); 
    
    const order = new Order({
        userId: user._id,
        paymentId,
        paymentDate,
        deliveryInfo,
        totalCost,
        items: formattedItems,  // Use the formatted array
    });
    console.log("Formatted Items:", formattedItems);

        await order.save();
        res.json({ success: true, order });
    } catch (dbError) {
        console.error("MongoDB Error:", dbError.message, dbError.stack);
        return res.status(500).json({ error: "Database error", details: dbError.message });
    } 
});


// Fetch user's orders without middleware
app.get('/myorders', async (req, res) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom');
        const userId = decoded.id;

        // Fetch orders for the user
        const orders = await Order.find({ userId }).populate('userId');
        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'No orders found' });
        }
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});


// Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        const existingUser = await Users.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        let cart = {};
        for (let i = 0; i < 300; i++) cart[i] = 0;

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret_ecom");
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ error: "Error during signup" });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.body.email });
        if (user && req.body.password === user.password) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret_ecom" );
            res.json({ success: true, token });
        } else {
            res.status(400).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error during login" });
    }
});

app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { itemId } = req.body;
        user.cartData[itemId] = (user.cartData[itemId] || 0) + 1;

        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error adding to cart" });
    }
});

// Remove from Cart Endpoint
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.cartData[req.body.itemId] > 0) {
            user.cartData[req.body.itemId] -= 1;
            await user.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error removing from cart" });
    }
});

// GET cart data for a logged-in user
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user.cartData); // Send cart data back to frontend
    } catch (error) {
        res.status(500).json({ error: "Error fetching cart" });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Import routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3001',  // Allow frontend
        'http://localhost:5173'   // Allow admin
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  // Allow cookies if necessary
}));
app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(cookieParser()); // Middleware to parse cookies

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log("Database connection error:", err));

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to the shop API!");
});

// Set up the server to listen on a specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

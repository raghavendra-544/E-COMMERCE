import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0; // Initialize with 0 quantity for each product ID
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]); // All products data
    const [cartItems, setCartItems] = useState(getDefaultCart()); // Cart items data

    useEffect(() => {
        // Fetch all products data on initial render
        fetch('http://localhost:3000/allproducts')
            .then((response) => response.json())
            .then((data) => setAll_Product(data));

        // If a user is logged in, fetch their cart data
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:3000/getcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), // Empty body for getting cart data
            })
                .then((response) => response.json())
                .then((data) => setCartItems(data));
        }
    }, []); // Runs once on component mount

    // Add item to the cart
    const addToCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1, // Increase item quantity by 1
        }));

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:3000/addtocart', {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }), // Send the itemId to the backend
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    };

    // Remove item from the cart
    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] > 0 ? prev[itemId] - 1 : 0), // Decrease item quantity by 1, if > 0
        }));

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:3000/removefromcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }), // Send the itemId to the backend
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    };

    // Calculate total cart amount based on products and quantities
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) { // Ensure item exists in the product list
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    // Calculate total cart items count
    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;

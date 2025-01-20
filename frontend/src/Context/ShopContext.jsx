import React, { createContext, useState, useEffect } from "react";

export const ShopContext = createContext();

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [loading, setLoading] = useState(false);

    // Fetching all products and cart data when the component mounts
    useEffect(() => {
        fetch("http://localhost:3000/allproducts")
            .then((response) => response.json())
            .then((data) => setAll_Product(data));

        if (localStorage.getItem("auth-token")) {
            fetchCartData();
        }
    }, []);

    const fetchCartData = () => {
        setLoading(true); // Set loading state to true
        const token = localStorage.getItem("auth-token");
        if (!token) {
            console.error("No token found");
            setLoading(false); // Stop loading if no token is found
            return;
        }

        fetch("http://localhost:3000/getcart", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "auth-token": token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Cart data:", data);
            setCartItems(data); // Update the state with the cart data
        })
        .catch((error) => {
            console.error("Error fetching cart data:", error);
        })
        .finally(() => {
            setLoading(false); // Set loading state to false once data fetching is complete
        });
    };

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch("http://localhost:3000/addtocart", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "auth-token": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId: itemId }),
            })
            .catch((error) => {
                console.error("Error adding to cart:", error);
            });
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
        }));

        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch("http://localhost:3000/removefromcart", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "auth-token": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId: itemId }),
            })
            .catch((error) => {
                console.error("Error removing from cart:", error);
            });
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((acc, quantity) => acc + quantity, 0);
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        fetchCartData,
        loading, // Include loading state in context
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;

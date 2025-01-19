// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state

    // Fetch product data from backend
    const fetchInfo = async () => {
        try {
            const response = await fetch('http://localhost:3000/allproducts');
            if (response.ok) {
                const data = await response.json();
                setAllProducts(data);
            } else {
                console.error('Error fetching products:', response.statusText);
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            setLoading(false); // Stop loading after fetching
        }
    };

    // Fetch products when component mounts
    useEffect(() => {
        fetchInfo();
    }, []);

    // Remove product
    const remove_product = async (id) => {
        try {
            const response = await fetch('http://localhost:3000/removeproduct', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });
            if (response.ok) {
                await fetchInfo(); // Refresh products list
            } else {
                console.error('Failed to remove product:', response.statusText);
            }
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    return (
        <div className='list-product'>
            <h1>All Products List</h1>
            <div className="listproduct-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Remove</p>
            </div>
            <div className="listproduct-allproducts">
                <hr />
                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    allproducts.length === 0 ? (
                        <p>No products available</p>
                    ) : (
                        allproducts.map((product, index) => (
                            <div key={index} className="listproduct-format-main listproduct-format">
                                <img src={product.image} alt="" className="listproduct-product-icon" />
                                <p>{product.name}</p>
                                <p>₹{product.old_price}</p>
                                <p>₹{product.new_price}</p>
                                <p>{product.category}</p>
                                <img
                                    onClick={() => remove_product(product.id)}
                                    className='listproduct-remove-icon'
                                    src={cross_icon}
                                    alt="remove"
                                />
                            </div>
                        ))
                    )
                )}
                <hr />
            </div>
        </div>
    );
};

export default ListProduct;

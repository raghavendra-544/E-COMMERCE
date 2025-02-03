import React, { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import { useNavigate } from "react-router-dom";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItem = ({ product, quantity, onRemove }) => (
  <div className="cartitems-format cartitems-format-main">
    <img src={product.image} alt={product.name} className="carticon-product-icon" />
    <p>{product.name}</p>
    <p>₹{product.new_price}</p>
    <button className="cartitems-quantity">{quantity}</button>
    <p>₹{product.new_price * quantity}</p>
    <img
      className="cartitems-remove-icon"
      src={remove_icon}
      onClick={onRemove}
      alt="Remove item"
      aria-label={`Remove ${product.name} from cart`}
    />
  </div>
);

const CartItems = () => {
  const { getTotalCartAmount, cartItems, all_product, removeFromCart } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); // Set loading to false when the component is mounted
  }, []);

  // Display loading text while data is being fetched
  if (loading) {
    return <p>Loading your cart...</p>;
  }

  // Display error if cart data is missing
  if (!cartItems || !all_product) {
    return <p>Cart or product data is missing!</p>;
  }

  // Render cart items
  const renderCartItems = () => {
    return Object.keys(cartItems).map((productId) => {
      const product = all_product.find((p) => p.id === parseInt(productId));
      const quantity = cartItems[productId];

      if (quantity > 0 && product) {
        return (
          <div key={product.id}>
            <CartItem
              product={product}
              quantity={quantity}
              onRemove={() => removeFromCart(product.id)} // Remove item from cart
            />
            <hr />
          </div>
        );
      }
      return null;
    });
  };

  const cartTotal = getTotalCartAmount();

  // Proceed to checkout when button is clicked
  const handleProceedToCheckout = () => {
    navigate("/order", { state: { cartTotal, cartItems } });
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {renderCartItems()}
      {Object.keys(cartItems).length === 0 || cartTotal === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cartitems-down">
          <div className="cartitems-total">
            <h1>Cart Totals</h1>
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
            <button onClick={handleProceedToCheckout}>PROCEED TO CHECKOUT</button>
          </div>
          <div className="cartitems-promocode">
            <p>If you have a promo code, enter it here</p>
            <div className="cartitems-promobox">
              <input type="text" placeholder="Promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;

import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate here
import ShopCategory from './Pages/ShopCategory';
import Shop from './Pages/Shop';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';
import PlaceOrder from './Components/PlaceOrder/PlaceOrder';
import MyOrders from './Pages/MyOrders'; // Import your MyOrders component

function App() {
  const isAuthenticated = localStorage.getItem('auth-token') !== null; // Check if the user is authenticated

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/mens" element={<ShopCategory banner={men_banner} category="men" />} />
          <Route path="/womens" element={<ShopCategory banner={women_banner} category="women" />} />
          <Route path="/kids" element={<ShopCategory banner={kid_banner} category="kid" />} />
          
          {/* Dynamic product route */}
          <Route path="/product/:productId" element={<Product />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginSignup />} />
          
          {/* PlaceOrder route */}
          <Route path="/order" element={<PlaceOrder />} />

          {/* MyOrders route, only accessible if the user is authenticated */}
          <Route 
            path="/myorders" 
            element={isAuthenticated ? <MyOrders /> : <Navigate to="/login" />} 
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

import React from 'react';
import './Offers.css';
import { useNavigate } from 'react-router-dom';
import exclusive_image from '../Assets/exclusive_image.png';

const Offers = () => {
    const navigate = useNavigate();

    const handleCheckNowClick = () => {
        navigate('/womens'); // Navigate to /offers when button is clicked
    };

    return (
        <div className='offers'>
            <div className="offers-left">
                <h1>Exclusive</h1>
                <h1>Offers For You</h1>
                <p>ONLY ON BEST SELLERS PRODUCTS</p>
                <button onClick={handleCheckNowClick}>Check Now</button>
            </div>
            <div className="offers-right">
                <img src={exclusive_image} alt="" />
            </div>
        </div>
    );
};

export default Offers;

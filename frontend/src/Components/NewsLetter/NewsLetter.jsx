import React, { useState, useEffect } from 'react';
import './NewsLetter.css';

const NewsLetter = () => {
    const [email, setEmail] = useState(''); // State to track the email input value
    const [subscribed, setSubscribed] = useState(false); // State to manage subscription status
    const [showInput, setShowInput] = useState(true); // State to manage visibility of input and button

    const handleSubscribe = () => {
        setSubscribed(true); // Set subscribed state to true when button is clicked
        setShowInput(false); // Hide input and button
        setEmail(''); // Reset the email input field
    };

    // Reset input and button visibility after 5 seconds
    useEffect(() => {
        if (subscribed) {
            const timer = setTimeout(() => {
                setSubscribed(false); // Hide subscription message
                setShowInput(true); // Show input and button again
            }, 5000); // 5 seconds delay

            return () => clearTimeout(timer); // Cleanup timeout if component unmounts
        }
    }, [subscribed]);

    return (
        <div className='newsletter'>
            <h1>Get Exclusive Offers On Your Email</h1>
            <p>Subscribe to our newsletter and stay updated</p>
            <div>
                {/* Show the email input and button only if not subscribed */}
                {showInput && (
                    <>
                        <input 
                            type="email" 
                            placeholder='Your Email id' 
                            value={email} // Bind input value to email state
                            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                        />
                        <button onClick={handleSubscribe}>Subscribe</button>
                    </>
                )}
            </div>

            {subscribed && <p className="subscription-message">You'll be notified!</p>}  {/* Show message when subscribed */}
        </div>
    );
};

export default NewsLetter;

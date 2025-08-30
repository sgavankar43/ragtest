import React, { useState, useEffect } from 'react';
import '../assets/css/login.css';

const Login = () => {
  const [currentForm, setCurrentForm] = useState('signup');
  const [isAnimating, setIsAnimating] = useState(false);

  const switchForm = (e) => {
    e.preventDefault();
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentForm(prev => prev === 'signup' ? 'login' : 'signup');
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1250); // Matches CSS transition duration
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${currentForm} form submitted`);
    // Add your form submission logic here
  };

  return (
    <div className="main">
      {/* Sign Up Container */}
      <div className={`container a-container ${currentForm === 'login' ? 'is-txl' : ''}`}>
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="title">Create Account</h2>
          <div className="form__icons">
            {/* Add social icons here */}
          </div>
          <span className="form__span">or use email for registration</span>
          <input className="form__input" type="text" placeholder="Name" required />
          <input className="form__input" type="email" placeholder="Email" required />
          <input className="form__input" type="password" placeholder="Password" required />
          <button className="button" type="submit">SIGN UP</button>
        </form>
      </div>

      {/* Login Container */}
      <div className={`container b-container ${currentForm === 'signup' ? 'is-txl' : ''}`}>
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="title">Sign in to Website</h2>
          <div className="form__icons">
            {/* Add social icons here */}
          </div>
          <span className="form__span">or use your email account</span>
          <input className="form__input" type="email" placeholder="Email" required />
          <input className="form__input" type="password" placeholder="Password" required />
          <a className="form__link">Forgot your password?</a>
          <button className="button" type="submit">SIGN IN</button>
        </form>
      </div>

      {/* Switch Container */}
      <div className={`switch ${isAnimating ? 'is-gx' : ''} ${currentForm === 'login' ? 'is-txr' : ''}`}>
        <div className="switch__circle"></div>
        <div className="switch__circle switch__circle--t"></div>
        
        <div className={`switch__container ${currentForm === 'login' ? 'is-hidden' : ''}`}>
          <h2 className="title">Welcome Back!</h2>
          <p className="description">
            To keep connected with us please login with your personal info
          </p>
          <button className="button" onClick={switchForm}>SIGN IN</button>
        </div>
        
        <div className={`switch__container ${currentForm === 'signup' ? 'is-hidden' : ''}`}>
          <h2 className="title">Hello Friend!</h2>
          <p className="description">
            Enter your personal details and start journey with us
          </p>
          <button className="button" onClick={switchForm}>SIGN UP</button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React from 'react';
import logo from '../assets/logo-rentcar.jpg'; // **Importante: Guarda la imagen aquí**
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo-container">
      <img src={logo} alt="RentCar Logo" className="logo-img" />
    </div>
  );
};

export default Logo;
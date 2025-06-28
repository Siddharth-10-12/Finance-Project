import React from 'react';
import './s.css';

const Home = () => {
  return (
    <div className="container">
      {/* Header Section */}
      <header className="header">
        <div className="logo">
          <i className="fa fa-institution"></i>
          <span>Smart Investing</span>
        </div>
        <nav className="nav-bar">
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">About Us</a></li>
            <li><button className="logout-button">Logout</button></li>
          </ul>
        </nav>
      </header>

      {/* Body Container */}
      <div className="body-container">
        <h1>Welcome to Smart Investing</h1>
        <p>Manage your finances effortlessly with our tools and insights.</p>
      </div>
    </div>
  );
};

export default Home;
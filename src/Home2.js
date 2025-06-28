import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home2.css"; // Import custom CSS
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap Icons

const Home2 = () => {
  const navigate = useNavigate();
  const [isBlurred, setIsBlurred] = useState(false);

  const handleFreeTrial = () => {
    setIsBlurred(true); // Blur the background immediately
    setTimeout(() => {
      navigate("/free"); // Navigate to the FreeTrial page after 3 seconds
    }, 3000);
  };

  const handleWatchDemo = () => {
    const confirmAction = window.confirm(
      "You need to log in or sign up to watch the demo. Would you like to proceed?"
    );
    if (confirmAction) {
      navigate("/login"); // Navigate to the login page
    }
  };

  const handleSignIn = () => {
    navigate("/login"); // Navigate to the login page
  };

  const handleSignUp = () => {
    navigate("/signup"); // Navigate to the signup page
  };

  return (
    <div className={`financial-platform-home ${isBlurred ? "blurred" : ""}`}>
      {/* Background Gradient */}
      <div className="background-gradient"></div>

      {/* Top Navigation */}
      <nav className="top-navigation">
        <div className="nav-button">
          <i className="bi bi-currency-dollar"></i>
        </div>
        <div className="auth-buttons">
          <button className="btn btn-outline-light" onClick={handleSignIn}>
            Sign In
          </button>
          <button className="btn btn-light" onClick={handleSignUp}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Headline and Subtitle */}
      <section className="main-headline">
        <h1>Master Your Money, Shape Your Future</h1>
        <p>Experience the next generation of financial management. Powered by AI, driven by your success.</p>
      </section>

      {/* Call-to-Action Buttons */}
      <section className="cta-buttons">
        <button className="btn btn-primary cta-button" onClick={handleFreeTrial}>
          Start Free Trial
        </button>
        <button className="btn btn-secondary cta-button" onClick={handleWatchDemo}>
          Watch Demo
        </button>
      </section>

      {/* Statistics Section */}
      <section className="statistics">
        <div className="stat-item">
          <span className="stat-number">50K+</span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">$2.5M</span>
          <span className="stat-label">Managed Daily</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">98%</span>
          <span className="stat-label">Satisfaction</span>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-cards">
          <div className="card">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&auto=format&fit=crop&q=80"
              alt="Sarah Johnson"
              className="profile-pic"
            />
            <p className="quote">"This platform has transformed how I manage my business finances."</p>
            <p className="name">Sarah Johnson</p>
            <p className="title">Small Business Owner</p>
          </div>
          <div className="card">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&auto=format&fit=crop&q=80"
              alt="David Chen"
              className="profile-pic"
            />
            <p className="quote">"The tax optimization features alone have saved me thousands."</p>
            <p className="name">David Chen</p>
            <p className="title">Freelancer</p>
          </div>
          <div className="card">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&auto=format&fit=crop&q=80"
              alt="Emily Brown"
              className="profile-pic"
            />
            <p className="quote">"Finally, a platform that makes financial planning accessible."</p>
            <p className="name">Emily Brown</p>
            <p className="title">Investment Analyst</p>
          </div>
        </div>
      </section>

      {/* Quick Links, Support, and Contact Us Section */}
      <section className="footer-links">
        <div className="quick-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
          </ul>
        </div>
        <div className="support">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQs</a></li>
          </ul>
        </div>
        <div className="contact-us">
          <h4>Contact Us</h4>
          <p>Email: support@smartfinance.com</p>
          <p>Phone: +1 (123) 456-7890</p>
        </div>
      </section>

      {/* Scroll Prompt */}
      <div className="scroll-prompt">
        <span>Scroll to explore</span>
        <i className="bi bi-mouse"></i>
      </div>
    </div>
  );
};

export default Home2;
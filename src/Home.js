import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import './Home.css';
import { X } from "lucide-react";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Video Player Component - Updated with your custom video
  const VideoPlayer = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoRef.current.duration);
    };

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
      <div className="video-player">
        <video 
          ref={videoRef}
          className="video-element"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          poster="/images/img1.jpg" // Your custom poster image
        >
          <source src="/videos/finance.mp4" type="video/mp4" /> {/* Your custom video */}
          Your browser does not support the video tag.
        </video>
        
        {!isPlaying && (
          <div className="video-play-overlay" onClick={togglePlay}>
            ▶
          </div>
        )}
        
        <div className="video-controls">
          <div className="video-progress">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                videoRef.current.currentTime = e.target.value;
                setCurrentTime(e.target.value);
              }}
            />
          </div>
          <div className="video-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <button className="video-control-button" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (location.state && location.state.userName) {
      setUserName(location.state.userName);
    } else {
      const user = auth.currentUser;
      if (user) {
        setUserName(user.displayName || 'User');
      }
    }
  }, [location]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.body.classList.toggle('dark-mode', newMode);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleStartSubscription = () => {
    navigate('/Sub');
  };

  const handleBankRecommendationClick = () => {
    navigate('/bank');
  };

  const handleSmartInvestingClick = () => {
    navigate('/fin');
  };

  const handleTaxManagementClick = () => {
    navigate('/tax-profile');
  };

  const handleExpenditureClick = () => {
    navigate('/exp');
  };

  return (
    <div className={`${darkMode ? 'dark-mode' : ''} full-width-mod`} style={{margin:"0", width:"100%", padding:"0"}}>
      {/* Video Modal */}
      {showVideo && (
        <div className="video-modal">
          <div className="video-container">
            <button className="close-button" onClick={() => setShowVideo(false)}>
              <X className="w-6 h-6" />
            </button>
            <VideoPlayer />
          </div>
        </div>
      )}

      <header className="header">
        <div className="logo">
          <span>Welcome, {userName}</span>
        </div>
        <nav className="nav-bar">
          <ul>
            <li>
              <button className="nav-button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                Home  
              </button>
            </li>
            <li>
              <button className="nav-button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                   
              </button>
            </li>
            
            <li>
              <button className="nav-button" onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}>
                Features
              </button>
            </li>
            <li>
              <button 
                className="dark-mode-toggle"
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <i
                  className={`fas fa-lightbulb ${darkMode ? 'dark' : ''}`}
                  style={{ fontSize: '24px', color: darkMode ? 'yellow' : '#6C757D' }}
                />
              </button>
            </li>
            
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <h1>Invest Smarter Today</h1>
        <p>Manage your finances effortlessly with expenditure tracking, smart investing, tax management, and bank & loan recommendations—all in one place.</p>
        <div className="hero-buttons">
          <button onClick={() => setShowVideo(true)} className="cta-button">
            Watch Demo →
          </button>
          <button className="cta-button" onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}>
            Learn More →
          </button>
        </div>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">95%</span>
            <span className="stat-label">Tracking Accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1M+</span>
            <span className="stat-label">Loans Managed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-label">Tax Compliance</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">20+</span>
            <span className="stat-label">Bank Partners</span>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Why Smart Investing?</h2>
        <p className="features-subtitle">Innovative features designed to simplify investing for everyone.</p>
        <div className="feature-cards">
          <div 
            className="feature-card" 
            onClick={handleExpenditureClick}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && handleExpenditureClick()}
          >
            <div className="feature-icon">
              <i className="fa fa-pie-chart"></i>
            </div>
            <h3>Expenditure Tracking</h3>
            <p>Monitor your spending instantly with real-time updates and precise analytics.</p>
          </div>
          <div 
            className="feature-card"
            onClick={handleSmartInvestingClick}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && handleSmartInvestingClick()}
          >
            <div className="feature-icon"><i className="fa fa-line-chart"></i></div>
            <h3>Smart Investing</h3>
            <p>Plan with confidence using our intelligent financial tools and insights.</p>
          </div>
          <div 
            className="feature-card"
            onClick={handleTaxManagementClick}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && handleTaxManagementClick()}
          >
            <div className="feature-icon"><i className="fa fa-address-card-o"></i></div>
            <h3>Tax Management</h3>
            <p>Save time with automated tax calculations and filings.</p>
          </div>
          <div 
            className="feature-card"
            onClick={handleBankRecommendationClick}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && handleBankRecommendationClick()}
          >
            <div className="feature-icon">
              <i className="fa fa-institution"></i>
            </div>
            <h3>Bank & Loan Recommendation</h3>
            <p>Access tailored banking and loan options anytime, anywhere.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">
              <i className="fa fa-arrow-circle-right"></i>
            </div>
            <h3>Track</h3>
            <p>Monitor your expenses in real time.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <i className="fa fa-arrow-circle-right"></i>
            </div>
            <h3>Plan</h3>
            <p>Create smart financial strategies instantly.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <i className="fa fa-arrow-circle-right"></i>
            </div>
            <h3>Manage</h3>
            <p>Handle taxes with ease.</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <i className="fa fa-arrow-circle-right"></i>
            </div>
            <h3>Borrow</h3>
            <p>Find the best loans securely.</p>
          </div>
        </div>
        <div className="animation-ball"></div>
      </section>

      <section className="testimonials-cta">
        <div className="testimonials">
          <h2>What Our Users Say</h2>
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Smart Investing saves me so much time tracking expenses!"</p>
              <div className="user-info">
                <i className="fa fa-user-circle-o"></i>
                <span>John Doe, Regular User</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Managing my taxes has never been easier."</p>
              <div className="user-info">
                <i className="fa fa-user-circle-o"></i>
                <span>Jane Smith, Business Owner</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Loan recommendations are a game-changer!"</p>
              <div className="user-info">
                <i className="fa fa-user-circle-o"></i>
                <span>Mike Johnson, Daily User</span>
              </div>
            </div>
          </div>
        </div>
        <div className="cta">
          <h1>Ready to Start Investing?</h1>
          <p>Join thousands managing finances effortlessly today.</p>
          <button onClick={handleStartSubscription} className="cta-button">Start Subscription →</button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>Smart Investing</span>
            <p>Smarter investing for a better future.</p>
          </div>
          <div className="footer-support">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <button className="footer-link" onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}>
                  Features
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={handleStartSubscription}>
                  Pricing
                </button>
              </li>
            </ul>
          </div>
          <div className="footer-support">
            <h4>Support</h4>
            <ul>
              <li>
                <button className="footer-link">Help Center</button>
              </li>
              <li>
                <button className="footer-link">Contact Us</button>
              </li>
            </ul>
          </div>
          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <button className="social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </button>
              <button className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </button>
            </div>
          </div>
        </div>
        <p className="footer-copyright">© 2025 Smart Investing. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
"use client"
import React from 'react'
import PropTypes from 'prop-types'

const LearnMoreContent = ({ darkMode }) => {
  return (
    <section id="learn-more-section" className={`learn-more-section ${darkMode ? "dark-mode" : ""}`}>
      <div className="learn-more-container">
        <h2>About Smart Investing</h2>
        <p className="learn-more-intro">
          Smart Investing is a comprehensive financial management platform designed to help individuals and businesses
          make informed financial decisions through data-driven insights and expert recommendations.
        </p>

        <div className="learn-more-grid">
          <div className="learn-more-item">
            <div className="learn-more-icon">
              <i className="fa fa-shield"></i>
            </div>
            <h3>Our Mission</h3>
            <p>
              We believe everyone deserves access to powerful financial tools. Our mission is to democratize financial
              management by providing intuitive, data-driven solutions that empower users to take control of their
              financial future regardless of their financial literacy level.
            </p>
          </div>

          <div className="learn-more-item">
            <div className="learn-more-icon">
              <i className="fa fa-history"></i>
            </div>
            <h3>Our Story</h3>
            <p>
              Founded in 2020, Smart Investing began as a simple expense tracker. Today, we've evolved into a
              comprehensive platform serving over 1 million users worldwide, with a team of financial experts and
              developers dedicated to continuous improvement and innovation in personal finance.
            </p>
          </div>

          <div className="learn-more-item">
            <div className="learn-more-icon">
              <i className="fa fa-cogs"></i>
            </div>
            <h3>How It Works</h3>
            <p>
              Our platform uses advanced algorithms and machine learning to analyze your financial data, providing
              personalized recommendations and insights. We securely connect to your accounts, ensuring your data is
              always protected while delivering real-time analytics and actionable advice.
            </p>
          </div>

          <div className="learn-more-item">
            <div className="learn-more-icon">
              <i className="fa fa-users"></i>
            </div>
            <h3>Who We Serve</h3>
            <p>
              From individuals looking to better manage personal finances to small businesses optimizing cash flow, our
              platform scales to meet diverse needs. Our solutions are tailored to your specific financial goals and
              circumstances, making financial management accessible to everyone.
            </p>
          </div>
        </div>

        <div className="learn-more-testimonial">
          <blockquote>
            "Smart Investing transformed how I manage my finances. The personalized recommendations helped me increase
            my savings by 32% in just six months, and the tax optimization features saved me thousands on my annual
            returns."
            <cite>— Sarah Johnson, Software Engineer</cite>
          </blockquote>
        </div>

        <div className="learn-more-cta">
          <h3>Ready to transform your financial future?</h3>
          <button className="cta-button" onClick={() => (window.location.href = "#premium-features-section")}>
            Get Started Now →
          </button>
        </div>
      </div>
    </section>
  )
}

LearnMoreContent.propTypes = {
  darkMode: PropTypes.bool.isRequired
}

export default LearnMoreContent
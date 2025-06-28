"use client"
import React from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

const PremiumFeaturesContent = ({ darkMode, isPaidUser }) => {
  const navigate = useNavigate()

  const handleSubscribe = () => {
    navigate("/Sub")
  }

  return (
    <section id="premium-features-section" className={`premium-features-section ${darkMode ? "dark-mode" : ""}`}>
      <div className="premium-features-container">
        <h2>Premium Features</h2>
        <p className="premium-features-intro">
          Unlock these powerful tools with a Smart Investing subscription and take control of your financial future
        </p>

        <div className="premium-features-grid">
          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa fa-bolt"></i>
            </div>
            <h3>AI-Powered Financial Insights</h3>
            <p>
              Our advanced AI analyzes your spending patterns and financial behavior to provide personalized
              recommendations that help you save more and spend smarter. Get real-time alerts for unusual spending and
              opportunities to save.
            </p>
            <div className="feature-access">
              {isPaidUser ? (
                <span className="access-granted">✓ Access Granted</span>
              ) : (
                <span className="access-locked">🔒 Premium Feature</span>
              )}
            </div>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa fa-chart-line"></i>
            </div>
            <h3>Investment Portfolio Optimization</h3>
            <p>
              Receive tailored investment recommendations based on your risk tolerance, financial goals, and market
              conditions to maximize your returns. Our algorithm rebalances your portfolio automatically for optimal
              performance.
            </p>
            <div className="feature-access">
              {isPaidUser ? (
                <span className="access-granted">✓ Access Granted</span>
              ) : (
                <span className="access-locked">🔒 Premium Feature</span>
              )}
            </div>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa fa-calculator"></i>
            </div>
            <h3>Automated Tax Optimization</h3>
            <p>
              Our system automatically identifies tax-saving opportunities and helps you maximize deductions,
              potentially saving thousands each year. Get year-round tax planning advice, not just during tax season.
            </p>
            <div className="feature-access">
              {isPaidUser ? (
                <span className="access-granted">✓ Access Granted</span>
              ) : (
                <span className="access-locked">🔒 Premium Feature</span>
              )}
            </div>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa fa-university"></i>
            </div>
            <h3>Personalized Loan Recommendations</h3>
            <p>
              Get matched with the best loan options based on your credit profile, income, and financial history,
              ensuring you always get the best rates. Compare offers from multiple lenders with a single application.
            </p>
            <div className="feature-access">
              {isPaidUser ? (
                <span className="access-granted">✓ Access Granted</span>
              ) : (
                <span className="access-locked">🔒 Premium Feature</span>
              )}
            </div>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa fa-comments"></i>
            </div>
            <h3>Financial Advisor Chat</h3>
            <p>
              Connect with certified financial advisors through our in-app chat feature to get expert advice on complex
              financial decisions. Schedule video consultations for more in-depth financial planning sessions.
            </p>
            <div className="feature-access">
              {isPaidUser ? (
                <span className="access-granted">✓ Access Granted</span>
              ) : (
                <span className="access-locked">🔒 Premium Feature</span>
              )}
            </div>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa fa-file-alt"></i>
            </div>
            <h3>Advanced Financial Reports</h3>
            <p>
              Access detailed financial reports and projections that help you visualize your financial progress and plan
              for the future. Export custom reports for tax filing, loan applications, or personal record-keeping.
            </p>
            <div className="feature-access">
              {isPaidUser ? (
                <span className="access-granted">✓ Access Granted</span>
              ) : (
                <span className="access-locked">🔒 Premium Feature</span>
              )}
            </div>
          </div>
        </div>

        {!isPaidUser && (
          <div className="premium-features-cta">
            <h3>Ready to unlock all premium features?</h3>
            <button className="cta-button" onClick={handleSubscribe}>
              Subscribe Now →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

PremiumFeaturesContent.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isPaidUser: PropTypes.bool.isRequired
}

export default PremiumFeaturesContent
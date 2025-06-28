"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Sub.css"
import { CheckCircle, CreditCard, Wallet, BanknoteIcon, Shield, ArrowRight } from "lucide-react"
import { storePaymentInfo } from "./firebase"

const Sub = () => {
  const [selectedTab, setSelectedTab] = useState("Basic")
  const [isYearly, setIsYearly] = useState(true)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    upiId: "",
    bank: ""
  })
  const navigate = useNavigate()

  const handleTabClick = (tab) => {
    setSelectedTab(tab)
  }

  const handleToggle = () => {
    setIsYearly(!isYearly)
  }

  const handleSubscribe = () => {
    setShowPaymentMethods(true)
  }

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method)
    setFormErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const errors = {}
    
    if (!selectedPaymentMethod) {
      errors.paymentMethod = "Please select a payment method"
      return errors
    }

    if (selectedPaymentMethod === "card") {
      if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.cardNumber = "Please enter a valid 16-digit card number"
      }
      if (!formData.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = "Please enter a valid expiry date (MM/YY)"
      }
      if (!formData.cvv.trim() || formData.cvv.length !== 3) {
        errors.cvv = "Please enter a valid 3-digit CVV"
      }
      if (!formData.cardName.trim()) {
        errors.cardName = "Please enter the name on card"
      }
    } else if (selectedPaymentMethod === "upi") {
      if (!formData.upiId.trim() || !/^[\w.-]+@\w+$/.test(formData.upiId)) {
        errors.upiId = "Please enter a valid UPI ID"
      }
    } else if (selectedPaymentMethod === "netbanking") {
      if (!formData.bank.trim()) {
        errors.bank = "Please select your bank"
      }
    }

    return errors
  }

  const handlePaymentSubmit = async () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setProcessingPayment(true)

    try {
      // In a real app, you would process payment here
      // For demo, we'll just store the payment info in Firebase
      const paymentDetails = {
        plan: selectedTab,
        duration: isYearly ? "yearly" : "monthly",
        amount: pricing[selectedTab][isYearly ? "yearly" : "monthly"],
        paymentMethod: selectedPaymentMethod,
        timestamp: new Date().toISOString()
      }

      // Store payment info in Firebase
      await storePaymentInfo("user-uid", paymentDetails) // Replace "user-uid" with actual user ID

      setProcessingPayment(false)
      setPaymentSuccess(true)

      // Redirect after successful payment
      setTimeout(() => {
        navigate("/home")
      }, 2000)
    } catch (error) {
      console.error("Payment error:", error)
      setProcessingPayment(false)
      // Handle error (show error message to user)
    }
  }

  const handleBackToPlans = () => {
    setShowPaymentMethods(false)
    setSelectedPaymentMethod(null)
    setFormErrors({})
  }

  // Pricing based on monthly or yearly (in Rs)
  const pricing = {
    Basic: {
      monthly: 199,
      yearly: 2999,
    },
    Pro: {
      monthly: 399,
      yearly: 4999,
    },
    Premium: {
      monthly: 599,
      yearly: 7999,
    },
  }

  // Features for each plan
  const features = {
    Basic: [
      "Expenditure Tracking",
      "Smart Investing (Limited)",
      "Tax Management (Manual)",
      "Bank & Loan Recommendations (Basic)",
    ],
    Pro: [
      "Expenditure Tracking",
      "Smart Investing (Advanced)",
      "Tax Management (Semi-Automated)",
      "Bank & Loan Recommendations (Tailored)",
      "Priority Customer Support",
    ],
    Premium: [
      "Expenditure Tracking",
      "Smart Investing (Full Access)",
      "Tax Management (Fully Automated)",
      "Bank & Loan Recommendations (Premium)",
      "Dedicated Financial Advisor",
      "Exclusive Investment Opportunities",
    ],
  }

  // Payment methods
  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: <CreditCard className="payment-icon" /> },
    { id: "upi", name: "UPI", icon: <Wallet className="payment-icon" /> },
    { id: "netbanking", name: "Net Banking", icon: <BanknoteIcon className="payment-icon" /> },
  ]

  if (paymentSuccess) {
    return (
      <div className="sub-container payment-success-container">
        <div className="payment-success">
          <div className="success-icon">
            <CheckCircle size={60} className="check-icon" />
          </div>
          <h2>Payment Successful!</h2>
          <p>Thank you for subscribing to our {selectedTab} Plan.</p>
          <p>Your subscription is now active.</p>
          <button className="select" onClick={() => navigate("/home")}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (processingPayment) {
    return (
      <div className="sub-container processing-container">
        <div className="processing-payment">
          <div className="loader"></div>
          <h2>Processing Payment</h2>
          <p>Please wait while we process your payment...</p>
        </div>
      </div>
    )
  }

  if (showPaymentMethods) {
    return (
      <div className="sub-container payment-container">
        <button className="back-button" onClick={handleBackToPlans}>
          ← Back to Plans
        </button>

        <div className="header">
          <h1>Select Payment Method</h1>
          <p className="subheader">Choose your preferred payment option for the {selectedTab} Plan</p>
        </div>

        <div className="payment-summary">
          <h3>Order Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Plan:</span>
              <span>{selectedTab}</span>
            </div>
            <div className="summary-row">
              <span>Duration:</span>
              <span>{isYearly ? "Yearly" : "Monthly"}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{pricing[selectedTab][isYearly ? "yearly" : "monthly"]}</span>
            </div>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Methods</h3>
          {formErrors.paymentMethod && <p className="error-message">{formErrors.paymentMethod}</p>}
          <div className="payment-options">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-option ${selectedPaymentMethod === method.id ? "selected" : ""}`}
                onClick={() => handlePaymentMethodSelect(method.id)}
              >
                {method.icon}
                <span>{method.name}</span>
                {selectedPaymentMethod === method.id && <CheckCircle className="selected-icon" size={20} />}
              </div>
            ))}
          </div>
        </div>

        {selectedPaymentMethod === "card" && (
          <div className="payment-form card-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                value={formData.cardNumber}
                onChange={handleInputChange}
              />
              {formErrors.cardNumber && <p className="error-message">{formErrors.cardNumber}</p>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
                {formErrors.expiryDate && <p className="error-message">{formErrors.expiryDate}</p>}
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  maxLength="3"
                  value={formData.cvv}
                  onChange={handleInputChange}
                />
                {formErrors.cvv && <p className="error-message">{formErrors.cvv}</p>}
              </div>
            </div>
            <div className="form-group">
              <label>Name on Card</label>
              <input
                type="text"
                name="cardName"
                placeholder="John Doe"
                value={formData.cardName}
                onChange={handleInputChange}
              />
              {formErrors.cardName && <p className="error-message">{formErrors.cardName}</p>}
            </div>
          </div>
        )}

        {selectedPaymentMethod === "upi" && (
          <div className="payment-form upi-form">
            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                name="upiId"
                placeholder="yourname@upi"
                value={formData.upiId}
                onChange={handleInputChange}
              />
              {formErrors.upiId && <p className="error-message">{formErrors.upiId}</p>}
            </div>
          </div>
        )}

        {selectedPaymentMethod === "netbanking" && (
          <div className="payment-form netbanking-form">
            <div className="form-group">
              <label>Select Bank</label>
              <select
                name="bank"
                value={formData.bank}
                onChange={handleInputChange}
              >
                <option value="">Select your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
              </select>
              {formErrors.bank && <p className="error-message">{formErrors.bank}</p>}
            </div>
          </div>
        )}

        <div className="secure-payment">
          <Shield size={16} />
          <span>Secure Payment</span>
        </div>

        <button
          className={`pay-button ${!selectedPaymentMethod ? "disabled" : ""}`}
          onClick={handlePaymentSubmit}
          disabled={!selectedPaymentMethod}
        >
          Pay ₹{pricing[selectedTab][isYearly ? "yearly" : "monthly"]}
          <ArrowRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="sub-container">
      {/* Header & Subheader */}
      <div className="header">
        <h1>Choose Your Plan</h1>
        <p className="subheader">Unlock Your Smart Financial Future – Subscribe Today!</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${selectedTab === "Basic" ? "active" : ""}`} onClick={() => handleTabClick("Basic")}>
          Basic
        </button>
        <button className={`tab ${selectedTab === "Pro" ? "active" : ""}`} onClick={() => handleTabClick("Pro")}>
          Pro
        </button>
        <button
          className={`tab ${selectedTab === "Premium" ? "active" : ""}`}
          onClick={() => handleTabClick("Premium")}
        >
          Premium
        </button>
      </div>

      {/* Pricing & Toggle */}
      <div className="pricing-toggle">
        <div className="toggle-container">
          <span className={!isYearly ? "active" : ""}>Monthly</span>
          <div className="toggle-switch" onClick={handleToggle}>
            <div className={`slider ${isYearly ? "yearly" : "monthly"}`}></div>
          </div>
          <span className={isYearly ? "active" : ""}>Yearly</span>
          {isYearly && <span className="save-badge">Save 15%</span>}
        </div>
        <div className="pricing">
          <h2>
            ₹{pricing[selectedTab][isYearly ? "yearly" : "monthly"]} <span>/{isYearly ? "year" : "month"}</span>
          </h2>
        </div>
      </div>

      {/* Features List */}
      <div className="features">
        <h3>What's Included:</h3>
        <ul>
          {features[selectedTab].map((feature, index) => (
            <li key={index}>
              <CheckCircle className="feature-check" size={18} />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Plan */}
      <div className="suggested-plan">
        <h3>Suggested Plan:</h3>
        <p>
          Based on your usage of <strong>Expenditure Tracking</strong>, <strong>Smart Investing</strong>,{" "}
          <strong>Tax Management</strong>, and <strong>Bank & Loan Recommendations</strong>, we recommend the{" "}
          <strong>Pro Plan</strong> for the best value.
        </p>
      </div>

      {/* Select Button */}
      <div className="select-button">
        <button className="select" onClick={handleSubscribe}>
          Subscribe to {selectedTab} Plan
        </button>
      </div>

      <div className="plan-footer">
        <p>
          By subscribing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default Sub
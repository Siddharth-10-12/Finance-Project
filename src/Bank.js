"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { auth } from "./firebase"
import {
  ChevronLeft,
  Star,
  StarHalf,
  CheckCircle,
  Eye,
  FileText,
  ArrowRight,
  FolderOpen,
  AlertCircle,
  Upload,
  ExternalLink,
} from "lucide-react"
import "./bank.css"

// Import for chart
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Import Firebase functions
import {
  storeLoanRecommendation,
  storeLoanApplication,
  fetchLoanApplications,
  storeInvestmentRecommendation,
  storeUploadedDocument,
  fetchUploadedDocuments,
} from "./firebase"

// Import bank recommendation function
import { recommendBank } from "./bankRecommendation"

const Bank = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [userName, setUserName] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("loans")
  const [cibilScore, setCibilScore] = useState("")
  const [loanType, setLoanType] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [tenure, setTenure] = useState("")
  const [income, setIncome] = useState("")
  const [occupation, setOccupation] = useState("")
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [recommendedBanks, setRecommendedBanks] = useState([])
  const [investmentType, setInvestmentType] = useState("")
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [investmentTenure, setInvestmentTenure] = useState("")
  const [showInvestmentRecommendation, setShowInvestmentRecommendation] = useState(false)
  const [recommendedInvestments, setRecommendedInvestments] = useState([])
  const [applications, setApplications] = useState([])
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [selectedBanksToCompare, setSelectedBanksToCompare] = useState([])
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [documentType, setDocumentType] = useState("")
  const [documentFile, setDocumentFile] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    panCard: "",
    aadharCard: "",
    employmentType: "",
    monthlyIncome: "",
    existingEmi: "",
    loanPurpose: "",
  })

  // Refs for scroll notifications
  const investmentCalculatorRef = useRef(null)
  const applicationFormRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (location.state && location.state.userName) {
      setUserName(location.state.userName)
    } else {
      const user = auth.currentUser
      if (user) {
        setUserName(user.displayName || "User")
      }
    }

    // Load dark mode preference from localStorage
    const savedMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedMode)
    document.body.classList.toggle("dark-mode", savedMode)

    // Load loan applications
    const loadApplications = async () => {
      const user = auth.currentUser
      if (user) {
        const applications = await fetchLoanApplications(user.uid)
        setApplications(applications)

        // Also fetch uploaded documents
        const documents = await fetchUploadedDocuments(user.uid)
        setUploadedDocuments(documents)
      }
    }

    loadApplications()
  }, [location])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("darkMode", String(newMode))
    document.body.classList.toggle("dark-mode", newMode)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleHomeClick = () => {
    navigate("/")
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setShowRecommendation(false)
    setShowInvestmentRecommendation(false)
    setFormSubmitted(false)
    setSelectedBanksToCompare([])
    setShowCompareModal(false)
  }

  const validateForm = (data) => {
    const errors = {}

    // Validate Aadhar Card (exactly 12 digits)
    if (data.aadharCard && !/^\d{12}$/.test(data.aadharCard)) {
      errors.aadharCard = "Aadhar Card must be exactly 12 digits"
    }

    // Validate PAN Card (ABCDE1234F format)
    if (data.panCard && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panCard)) {
      errors.panCard = "Invalid PAN Card format (e.g., ABCDE1234F)"
    }

    // Validate Phone Number (10 digits)
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      errors.phone = "Phone number must be 10 digits"
    }

    // Validate Email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email format"
    }

    return errors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Special handling for Aadhar Card to limit to 12 digits
    if (name === "aadharCard") {
      const digitsOnly = value.replace(/\D/g, "")
      if (digitsOnly.length <= 12) {
        setFormData({
          ...formData,
          [name]: digitsOnly,
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  const showNotificationMessage = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  const handleLoanRecommendation = async () => {
    if (!cibilScore || !loanType || !loanAmount || !tenure || !income) {
      alert("Please fill all the fields to get recommendations")
      return
    }

    // Use the bank recommendation function to get customized recommendations
    const customerDetails = {
      cibil_score: Number.parseInt(cibilScore),
      loan_type: loanType,
      loan_amount: Number.parseInt(loanAmount),
      tenure: Number.parseInt(tenure),
      monthly_income: Number.parseInt(income),
      occupation: occupation || "salaried",
    }

    // Get bank recommendations based on customer details
    const banks = await recommendBank(customerDetails)

    setRecommendedBanks(banks)
    setShowRecommendation(true)

    // Store loan recommendation in Firebase
    const user = auth.currentUser
    if (user) {
      await storeLoanRecommendation(user.uid, {
        cibilScore,
        loanType,
        loanAmount,
        tenure,
        income,
        occupation,
        recommendedBanks: banks,
      })
    }
  }

  const handleInvestmentRecommendation = async () => {
    if (!investmentType || !investmentAmount || !investmentTenure) {
      alert("Please fill all the fields to get investment recommendations")
      return
    }

    // Hardcoded investment recommendations
    let investments = []

    if (investmentType === "fd") {
      investments = [
        {
          name: "SBI",
          interestRate: "7.25%",
          minInvestment: "₹1,000",
          tenure: "1-10 years",
          specialFeatures: "Additional 0.5% for senior citizens, Loan against FD",
          logo: "https://1000logos.net/wp-content/uploads/2018/03/SBI-Logo.png",
          rating: 4.8,
        },
        {
          name: "HDFC Bank",
          interestRate: "7.35%",
          minInvestment: "₹5,000",
          tenure: "7 days to 10 years",
          specialFeatures: "Flexible tenure options, Premature withdrawal facility",
          logo: "https://1000logos.net/wp-content/uploads/2021/06/HDFC-Bank-emblem.png",
          rating: 4.7,
        },
        {
          name: "ICICI Bank",
          interestRate: "7.20%",
          minInvestment: "₹10,000",
          tenure: "7 days to 10 years",
          specialFeatures: "Auto-renewal option, iWish flexible deposits",
          logo: "https://1000logos.net/wp-content/uploads/2021/05/ICICI-Bank-logo.png",
          rating: 4.6,
        },
        {
          name: "Deutsche Bank",
          interestRate: "7.50%",
          minInvestment: "₹10,000",
          tenure: "6 months to 5 years",
          specialFeatures: "Higher interest rates, International banking services",
          logo: "https://1000logos.net/wp-content/uploads/2021/05/Deutsche-Bank-logo.png",
          rating: 4.5,
        },
      ]
    } else if (investmentType === "rd") {
      investments = [
        {
          name: "Post Office",
          interestRate: "7.40%",
          minInvestment: "₹100 per month",
          tenure: "5 years",
          specialFeatures: "Government backed security, Tax benefits under 80C",
          logo: "https://www.indiapost.gov.in/VAS/DOP/Images/indiapostlogo.jpg",
          rating: 4.9,
        },
        {
          name: "SBI",
          interestRate: "7.10%",
          minInvestment: "₹100 per month",
          tenure: "1-10 years",
          specialFeatures: "Auto-debit facility, Loan against RD",
          logo: "https://1000logos.net/wp-content/uploads/2018/03/SBI-Logo.png",
          rating: 4.7,
        },
        {
          name: "ICICI Bank",
          interestRate: "7.00%",
          minInvestment: "₹500 per month",
          tenure: "6 months to 10 years",
          specialFeatures: "iWish goal-based RDs, Flexible payment options",
          logo: "https://1000logos.net/wp-content/uploads/2021/05/ICICI-Bank-logo.png",
          rating: 4.6,
        },
      ]
    } else if (investmentType === "savings") {
      investments = [
        {
          name: "Kotak Mahindra Bank",
          interestRate: "4.50%",
          minInvestment: "₹0 (Zero balance)",
          tenure: "Ongoing",
          specialFeatures: "High interest savings account, Digital banking",
          logo: "https://1000logos.net/wp-content/uploads/2021/06/Kotak-Mahindra-Bank-logo.png",
          rating: 4.7,
        },
        {
          name: "IDFC First Bank",
          interestRate: "6.00%",
          minInvestment: "₹10,000 (Avg. quarterly balance)",
          tenure: "Ongoing",
          specialFeatures: "Highest interest rates, Free unlimited ATM transactions",
          logo: "https://www.idfcfirstbank.com/content/dam/IDFCFirstBank/images/icons/logo-main.svg",
          rating: 4.6,
        },
        {
          name: "Yes Bank",
          interestRate: "5.50%",
          minInvestment: "₹5,000 (Avg. monthly balance)",
          tenure: "Ongoing",
          specialFeatures: "Competitive interest rates, Digital-first experience",
          logo: "https://1000logos.net/wp-content/uploads/2021/06/Yes-Bank-logo.png",
          rating: 4.4,
        },
        {
          name: "DBS Bank",
          interestRate: "5.00%",
          minInvestment: "₹5,000 (Avg. monthly balance)",
          tenure: "Ongoing",
          specialFeatures: "Global banking network, Innovative digital solutions",
          logo: "https://1000logos.net/wp-content/uploads/2021/05/DBS-Bank-logo.png",
          rating: 4.5,
        },
      ]
    } else if (investmentType === "ppf") {
      investments = [
        {
          name: "SBI",
          interestRate: "7.10%",
          minInvestment: "₹500 per year",
          tenure: "15 years",
          specialFeatures: "Tax-free returns, Partial withdrawal after 7 years",
          logo: "https://1000logos.net/wp-content/uploads/2018/03/SBI-Logo.png",
          rating: 4.9,
        },
        {
          name: "Post Office",
          interestRate: "7.10%",
          minInvestment: "₹500 per year",
          tenure: "15 years",
          specialFeatures: "Government backed, Loan facility available",
          logo: "https://www.indiapost.gov.in/VAS/DOP/Images/indiapostlogo.jpg",
          rating: 4.8,
        },
        {
          name: "HDFC Bank",
          interestRate: "7.10%",
          minInvestment: "₹500 per year",
          tenure: "15 years",
          specialFeatures: "Online account management, Auto-debit facility",
          logo: "https://1000logos.net/wp-content/uploads/2021/06/HDFC-Bank-emblem.png",
          rating: 4.7,
        },
      ]
    }

    setRecommendedInvestments(investments)
    setShowInvestmentRecommendation(true)

    // Store investment recommendation in Firebase
    const user = auth.currentUser
    if (user) {
      await storeInvestmentRecommendation(user.uid, {
        investmentType,
        investmentAmount,
        investmentTenure,
        recommendedInvestments: investments,
      })
    }
  }

  const handleLoanApplication = async (e) => {
    e.preventDefault()

    // Validate form
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)

      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }

      return
    }

    // In a real application, you would submit this data to your backend
    console.log("Loan application submitted:", formData)

    // Add a new application to the list
    const newApplication = {
      id: `LOAN${Math.floor(100000 + Math.random() * 900000)}`,
      bank: recommendedBanks[0]?.name || "HDFC Bank",
      type:
        loanType === "home"
          ? "Home Loan"
          : loanType === "personal"
            ? "Personal Loan"
            : loanType === "car"
              ? "Car Loan"
              : loanType === "education"
                ? "Education Loan"
                : "Business Loan",
      amount: `₹${Number.parseInt(loanAmount).toLocaleString("en-IN")}`,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Document Verification Pending",
      color: "#FF9800", // Orange for pending document verification
      progress: 10,
      nextStep: "Upload required documents for verification",
      documents: [
        { name: "Identity Proof", status: "Requested", date: new Date().toISOString().split("T")[0] },
        { name: "Income Proof", status: "Requested", date: new Date().toISOString().split("T")[0] },
        { name: "Address Proof", status: "Requested", date: new Date().toISOString().split("T")[0] },
      ],
      timeline: [
        { date: new Date().toISOString().split("T")[0], event: "Application Submitted", status: "Completed" },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          event: "Document Verification",
          status: "Pending",
        },
        {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          event: "Credit Assessment",
          status: "Pending",
        },
        {
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          event: "Loan Approval",
          status: "Pending",
        },
        {
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          event: "Disbursement",
          status: "Pending",
        },
      ],
    }

    setApplications([newApplication, ...applications])
    setFormSubmitted(true)

    // Store loan application in Firebase
    const user = auth.currentUser
    if (user) {
      await storeLoanApplication(user.uid, newApplication)
    }

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      panCard: "",
      aadharCard: "",
      employmentType: "",
      monthlyIncome: "",
      existingEmi: "",
      loanPurpose: "",
    })

    // Show success notification
    showNotificationMessage("Application submitted successfully!")
  }

  const toggleBankSelection = (bank) => {
    if (selectedBanksToCompare.some((b) => b.name === bank.name)) {
      setSelectedBanksToCompare(selectedBanksToCompare.filter((b) => b.name !== bank.name))
    } else {
      if (selectedBanksToCompare.length < 3) {
        setSelectedBanksToCompare([...selectedBanksToCompare, bank])
      } else {
        showNotificationMessage("You can compare up to 3 banks at a time")
      }
    }
  }

  const handleCompare = () => {
    if (selectedBanksToCompare.length < 2) {
      showNotificationMessage("Please select at least 2 banks to compare")
      return
    }

    setShowCompareModal(true)
  }

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
  }

  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0])
  }

  // Only updating the storeUploadedDocument function in Bank.js
// This is a partial update - the rest of the file remains the same

const handleDocumentUpload = async () => {
  if (!documentType || !documentFile) {
    showNotificationMessage("Please select document type and file")
    return
  }

  const user = auth.currentUser
  if (!user) {
    showNotificationMessage("You must be logged in to upload documents")
    return
  }

  // In a real app, you would upload the file to storage
  // For this example, we'll just store the metadata
  const newDocument = {
    type: documentType,
    name: documentFile.name,
    size: documentFile.size,
    uploadDate: new Date().toISOString().split("T")[0],
    status: "Pending Verification",
    isVerified: 0, // Add this field with default 0 (not verified)
  }

  try {
    // Store document in Firebase
    await storeUploadedDocument(user.uid, newDocument)

    // Add to local state
    setUploadedDocuments([...uploadedDocuments, newDocument])

    // Update application status if needed
    const updatedApplications = applications.map((app) => {
      const updatedDocuments = app.documents.map((doc) => {
        if (doc.name.toLowerCase().includes(documentType.toLowerCase())) {
          return { ...doc, status: "Pending" }
        }
        return doc
      })

      // Check if all documents are at least pending
      const allDocumentsUploaded = updatedDocuments.every(
        (doc) => doc.status === "Pending" || doc.status === "Verified",
      )

      if (allDocumentsUploaded) {
        return {
          ...app,
          status: "Documents Uploaded, Verification Pending",
          nextStep: "Documents under review",
          progress: 25,
        }
      }

      return { ...app, documents: updatedDocuments }
    })

    setApplications(updatedApplications)

    // Close modal and show success message
    setShowUploadModal(false)
    setDocumentType("")
    setDocumentFile(null)
    showNotificationMessage("Document uploaded successfully!")
  } catch (error) {
    console.error("Error uploading document:", error)
    showNotificationMessage("Error uploading document. Please try again.")
  }
}

  const openBankWebsite = (bankName) => {
    let url = ""

    switch (bankName) {
      case "SBI":
        url = "https://www.onlinesbi.sbi"
        break
      case "HDFC Bank":
        url = "https://www.hdfcbank.com"
        break
      case "ICICI Bank":
        url = "https://www.icicibank.com"
        break
      case "Axis Bank":
        url = "https://www.axisbank.com"
        break
      case "Bank of Baroda":
        url = "https://www.bankofbaroda.in"
        break
      case "Kotak Mahindra Bank":
        url = "https://www.kotak.com"
        break
      default:
        url = "https://www.google.com/search?q=" + encodeURIComponent(bankName)
    }

    window.open(url, "_blank")
  }

  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="star-icon filled" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="star-icon half-filled" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star-icon empty" />)
    }

    return <div className="star-rating">{stars}</div>
  }

  // Generate investment growth data for charts
  const generateInvestmentData = () => {
    const amount = Number.parseInt(investmentAmount) || 10000
    const years = investmentTenure === "short" ? 1 : investmentTenure === "medium" ? 3 : 5
    const rate =
      investmentType === "fd" ? 0.0725 : investmentType === "rd" ? 0.071 : investmentType === "savings" ? 0.045 : 0.071

    const data = []
    let currentAmount = amount

    for (let i = 0; i <= years; i++) {
      data.push({
        year: `Year ${i}`,
        amount: Math.round(currentAmount),
        interest: i === 0 ? 0 : Math.round(currentAmount - (i === 1 ? amount : data[i - 1].amount)),
      })
      currentAmount = currentAmount * (1 + rate)
    }

    return data
  }

  // Generate pie chart data
  const generatePieData = () => {
    const amount = Number.parseInt(investmentAmount) || 10000
    const years = investmentTenure === "short" ? 1 : investmentTenure === "medium" ? 3 : 5
    const rate =
      investmentType === "fd" ? 0.0725 : investmentType === "rd" ? 0.071 : investmentType === "savings" ? 0.045 : 0.071

    const finalAmount = amount * Math.pow(1 + rate, years)
    const interestEarned = finalAmount - amount

    return [
      { name: "Principal", value: amount },
      { name: "Interest", value: Math.round(interestEarned) },
    ]
  }

  // Colors for charts
  const COLORS = ["#00C48C", "#6A0DAD", "#FF9800", "#2196F3"]

  return (
    <div
      className={`${darkMode ? "dark-mode" : ""} full-width-mod`}
      style={{ margin: "0", width: "100%", padding: "0" }}
    >
      <section className="bank-hero">
        <div className="bank-hero-content">
          <h1>Smart Bank and Loans</h1>
          <p>Find the perfect loan and investment options tailored to your financial needs</p>
        </div>
      </section>

      {/* Notification */}
      {showNotification && (
        <div className="notification-toast">
          <div className="notification-content">
            <AlertCircle size={20} />
            <span>{notificationMessage}</span>
          </div>
          <button className="notification-close" onClick={() => setShowNotification(false)}>
            ×
          </button>
        </div>
      )}

      <section className="bank-tabs">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "loans" ? "active" : ""}`}
            onClick={() => handleTabChange("loans")}
          >
            <i className="fas fa-hand-holding-usd"></i> Loan Recommendations
          </button>
          <button
            className={`tab-button ${activeTab === "investments" ? "active" : ""}`}
            onClick={() => handleTabChange("investments")}
          >
            <i className="fas fa-chart-line"></i> Investment Options
          </button>
          <button
            className={`tab-button ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => handleTabChange("applications")}
          >
            <i className="fas fa-clipboard-list"></i> Loan Applications
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "loans" && (
            <div className="loans-tab">
              {!showRecommendation ? (
                <div className="recommendation-form">
                  <h2>Find Your Perfect Loan</h2>
                  <p>Enter your details to get personalized loan recommendations</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>CIBIL Score</label>
                      <input
                        type="number"
                        placeholder="Enter your CIBIL score (300-900)"
                        min="300"
                        max="900"
                        value={cibilScore}
                        onChange={(e) => setCibilScore(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Loan Type</label>
                      <select value={loanType} onChange={(e) => setLoanType(e.target.value)}>
                        <option value="">Select loan type</option>
                        <option value="home">Home Loan</option>
                        <option value="personal">Personal Loan</option>
                        <option value="car">Car Loan</option>
                        <option value="education">Education Loan</option>
                        <option value="business">Business Loan</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Loan Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="Enter amount in rupees"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Tenure (Years)</label>
                      <input
                        type="number"
                        placeholder="Enter loan tenure"
                        min="1"
                        max="30"
                        value={tenure}
                        onChange={(e) => setTenure(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Monthly Income (₹)</label>
                      <input
                        type="number"
                        placeholder="Enter your monthly income"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Occupation</label>
                      <select value={occupation} onChange={(e) => setOccupation(e.target.value)}>
                        <option value="">Select occupation</option>
                        <option value="salaried">Salaried</option>
                        <option value="self-employed">Self-employed</option>
                        <option value="business">Business Owner</option>
                        <option value="professional">Professional</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>

                  <button className="recommend-button" onClick={handleLoanRecommendation}>
                    Get Recommendations <ArrowRight className="button-icon" />
                  </button>
                </div>
              ) : (
                <div className="recommendation-results">
                  <div className="results-header">
                    <h2>
                      Recommended Banks for Your{" "}
                      {loanType === "home"
                        ? "Home"
                        : loanType === "personal"
                          ? "Personal"
                          : loanType === "car"
                            ? "Car"
                            : loanType === "education"
                              ? "Education"
                              : "Business"}{" "}
                      Loan
                    </h2>
                    <p>Based on your CIBIL score of {cibilScore} and loan requirements</p>
                    <button className="back-button" onClick={() => setShowRecommendation(false)}>
                      <ChevronLeft size={18} /> Back to Form
                    </button>
                  </div>

                  {selectedBanksToCompare.length > 0 && (
                    <div className="compare-bar">
                      <div className="compare-info">
                        <span>{selectedBanksToCompare.length} banks selected</span>
                        <div className="selected-banks">
                          {selectedBanksToCompare.map((bank, idx) => (
                            <div key={idx} className="selected-bank">
                              <img src={bank.logo || "/placeholder.svg"} alt={bank.name} />
                              <span>{bank.name}</span>
                              <button onClick={() => toggleBankSelection(bank)}>×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        className="compare-now-button"
                        onClick={handleCompare}
                        disabled={selectedBanksToCompare.length < 2}
                      >
                        Compare Now
                      </button>
                    </div>
                  )}

                  <div className="bank-cards">
                    {recommendedBanks.map((bank, index) => (
                      <div
                        key={index}
                        className={`bank-card ${index === 0 ? "best-match" : ""} ${selectedBanksToCompare.some((b) => b.name === bank.name) ? "selected-for-compare" : ""}`}
                      >
                        {index === 0 && <div className="best-match-badge">Best Match</div>}
                        <div className="bank-card-header">
                          <div className="bank-logo">
                            <img src={bank.logo || "/placeholder.svg"} alt={`${bank.name} logo`} />
                          </div>
                          <div className="bank-name">
                            <h3>{bank.name}</h3>
                            {renderStarRating(bank.rating)}
                          </div>
                        </div>
                        <div className="bank-details">
                          <div className="detail-item">
                            <span className="detail-label">Interest Rate</span>
                            <span className="detail-value">{bank.interestRate}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Max Loan Amount</span>
                            <span className="detail-value">{bank.maxLoanAmount}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Processing Fee</span>
                            <span className="detail-value">{bank.processingFee}</span>
                          </div>
                          <div className="detail-item features">
                            <span className="detail-label">Special Features</span>
                            <span className="detail-value">{bank.specialFeatures}</span>
                          </div>
                        </div>
                        <div className="bank-card-footer">
                          <button
                            className="apply-button"
                            onClick={() => {
                              document.getElementById("loan-application-section").scrollIntoView({ behavior: "smooth" })
                            }}
                          >
                            Apply Now
                          </button>
                          <button
                            className={`compare-button ${selectedBanksToCompare.some((b) => b.name === bank.name) ? "selected" : ""}`}
                            onClick={() => toggleBankSelection(bank)}
                          >
                            {selectedBanksToCompare.some((b) => b.name === bank.name) ? "Selected" : "Compare"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div id="loan-application-section" className="loan-application-section" ref={applicationFormRef}>
                    <h3>Ready to Apply?</h3>
                    <p>Fill out the application form below to get started with your loan process</p>

                    {!formSubmitted ? (
                      <form className="loan-application-form" onSubmit={handleLoanApplication}>
                        <div className="form-section">
                          <h4>Personal Information</h4>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Full Name</label>
                              <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Email Address</label>
                              <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className={formErrors.email ? "error" : ""}
                              />
                              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Phone Number</label>
                              <input
                                type="tel"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className={formErrors.phone ? "error" : ""}
                              />
                              {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                            </div>
                            <div className="form-group">
                              <label>Residential Address</label>
                              <input
                                type="text"
                                name="address"
                                placeholder="Enter your address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-section">
                          <h4>Identity & Financial Information</h4>
                          <div className="form-row">
                            <div className="form-group">
                              <label>PAN Card Number</label>
                              <input
                                type="text"
                                name="panCard"
                                placeholder="Enter PAN card number (e.g., ABCDE1234F)"
                                value={formData.panCard}
                                onChange={handleInputChange}
                                required
                                className={formErrors.panCard ? "error" : ""}
                              />
                              {formErrors.panCard && <span className="error-message">{formErrors.panCard}</span>}
                            </div>
                            <div className="form-group">
                              <label>Aadhar Card Number</label>
                              <input
                                type="text"
                                name="aadharCard"
                                placeholder="Enter Aadhar card number (12 digits)"
                                value={formData.aadharCard}
                                onChange={handleInputChange}
                                required
                                maxLength={12}
                                className={formErrors.aadharCard ? "error" : ""}
                              />
                              {formErrors.aadharCard && <span className="error-message">{formErrors.aadharCard}</span>}
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Employment Type</label>
                              <select
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="">Select employment type</option>
                                <option value="salaried">Salaried</option>
                                <option value="self-employed">Self-employed</option>
                                <option value="business">Business Owner</option>
                                <option value="professional">Professional</option>
                                <option value="retired">Retired</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Monthly Income (₹)</label>
                              <input
                                type="number"
                                name="monthlyIncome"
                                placeholder="Enter monthly income"
                                value={formData.monthlyIncome}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Existing EMI Obligations (₹)</label>
                              <input
                                type="number"
                                name="existingEmi"
                                placeholder="Enter existing EMI amount (if any)"
                                value={formData.existingEmi}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="form-group">
                              <label>Loan Purpose</label>
                              <input
                                type="text"
                                name="loanPurpose"
                                placeholder="Briefly describe loan purpose"
                                value={formData.loanPurpose}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="submit-button">
                            Submit Application
                          </button>
                          <button type="button" className="cancel-button" onClick={() => setShowRecommendation(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="application-success">
                        <div className="success-icon">
                          <CheckCircle size={80} />
                        </div>
                        <h3>Application Submitted Successfully!</h3>
                        <p>
                          Your loan application has been received. You can track the status in the Applications tab.
                        </p>
                        <button className="view-applications-button" onClick={() => setActiveTab("applications")}>
                          View Applications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "investments" && (
            <div className="investments-tab">
              {!showInvestmentRecommendation ? (
                <div className="investment-form">
                  <h2>Discover the Best Investment Options</h2>
                  <p>Enter your investment preferences to get personalized recommendations</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Investment Type</label>
                      <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)}>
                        <option value="">Select investment type</option>
                        <option value="fd">Fixed Deposit</option>
                        <option value="rd">Recurring Deposit</option>
                        <option value="savings">Savings Account</option>
                        <option value="ppf">Public Provident Fund (PPF)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Investment Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="Enter amount in rupees"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Investment Tenure</label>
                      <select value={investmentTenure} onChange={(e) => setInvestmentTenure(e.target.value)}>
                        <option value="">Select tenure</option>
                        <option value="short">Short Term (&lt; 1 year)</option>
                        <option value="medium">Medium Term (1-3 years)</option>
                        <option value="long">Long Term (&gt; 3 years)</option>
                      </select>
                    </div>
                  </div>

                  <button className="recommend-button" onClick={handleInvestmentRecommendation}>
                    Get Recommendations <ArrowRight className="button-icon" />
                  </button>
                </div>
              ) : (
                <div className="investment-results">
                  <div className="results-header">
                    <h2>
                      Recommended{" "}
                      {investmentType === "fd"
                        ? "Fixed Deposit"
                        : investmentType === "rd"
                          ? "Recurring Deposit"
                          : investmentType === "savings"
                            ? "Savings Account"
                            : "PPF"}{" "}
                      Options
                    </h2>
                    <p>Based on your investment preferences</p>
                    <button className="back-button" onClick={() => setShowInvestmentRecommendation(false)}>
                      <ChevronLeft size={18} /> Back to Form
                    </button>
                  </div>

                  <div className="bank-cards">
                    {recommendedInvestments.map((investment, index) => (
                      <div key={index} className={`bank-card ${index === 0 ? "best-match" : ""}`}>
                        {index === 0 && <div className="best-match-badge">Best Match</div>}
                        <div className="bank-card-header">
                          <div className="bank-logo">
                            <img src={investment.logo || "/placeholder.svg"} alt={`${investment.name} logo`} />
                          </div>
                          <div className="bank-name">
                            <h3>{investment.name}</h3>
                            {renderStarRating(investment.rating)}
                          </div>
                        </div>
                        <div className="bank-details">
                          <div className="detail-item">
                            <span className="detail-label">Interest Rate</span>
                            <span className="detail-value">{investment.interestRate}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Min Investment</span>
                            <span className="detail-value">{investment.minInvestment}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Tenure</span>
                            <span className="detail-value">{investment.tenure}</span>
                          </div>
                          <div className="detail-item features">
                            <span className="detail-label">Special Features</span>
                            <span className="detail-value">{investment.specialFeatures}</span>
                          </div>
                        </div>
                        <div className="bank-card-footer">
                          <button className="apply-button">Invest Now</button>
                          <button className="compare-button">Compare</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="investment-calculator" ref={investmentCalculatorRef}>
                    <h3>Investment Calculator</h3>
                    <p>See how your investment can grow over time</p>

                    <div className="calculator-widget">
                      <div className="calculator-charts">
                        <div className="chart-container">
                          <h4>Investment Growth Over Time</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                              data={generateInvestmentData()}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#00C48C" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#00C48C" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="year" />
                              <YAxis />
                              <CartesianGrid strokeDasharray="3 3" />
                              <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Amount"]} />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#00C48C"
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                                name="Total Value"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="chart-container">
                          <h4>Principal vs Interest</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={generatePieData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {generatePieData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="calculator-results">
                        <div className="result-item">
                          <span className="result-label">Principal Amount</span>
                          <span className="result-value">
                            ₹{Number.parseInt(investmentAmount || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Interest Rate</span>
                          <span className="result-value">
                            {investmentType === "fd"
                              ? "7.25%"
                              : investmentType === "rd"
                                ? "7.10%"
                                : investmentType === "savings"
                                  ? "4.50%"
                                  : "7.10%"}
                          </span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Investment Period</span>
                          <span className="result-value">
                            {investmentTenure === "short"
                              ? "1 year"
                              : investmentTenure === "medium"
                                ? "3 years"
                                : "5 years"}
                          </span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Interest Earned</span>
                          <span className="result-value">
                            ₹
                            {(
                              Number.parseInt(investmentAmount || 0) *
                              (investmentType === "fd"
                                ? 0.0725
                                : investmentType === "rd"
                                  ? 0.071
                                  : investmentType === "savings"
                                    ? 0.045
                                    : 0.071) *
                              (investmentTenure === "short" ? 1 : investmentTenure === "medium" ? 3 : 5)
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="result-item total">
                          <span className="result-label">Maturity Value</span>
                          <span className="result-value">
                            ₹
                            {(
                              Number.parseInt(investmentAmount || 0) *
                              (1 +
                                (investmentType === "fd"
                                  ? 0.0725
                                  : investmentType === "rd"
                                    ? 0.071
                                    : investmentType === "savings"
                                      ? 0.045
                                      : 0.071) *
                                  (investmentTenure === "short" ? 1 : investmentTenure === "medium" ? 3 : 5))
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="applications-tab">
              <h2>Your Loan Applications</h2>
              <p>Track the status of your loan applications</p>

              {applications.length > 0 ? (
                <div className="application-cards">
                  {applications.map((app, index) => (
                    <div key={index} className="application-card">
                      <div className="application-header">
                        <div className="application-id">
                          <span className="label">Application ID</span>
                          <span className="value">{app.id}</span>
                        </div>
                        <div className="application-status" style={{ backgroundColor: app.color }}>
                          {app.status}
                        </div>
                      </div>
                      <div className="application-details">
                        <div className="detail-column">
                          <div className="detail-item">
                            <span className="detail-label">Bank</span>
                            <span className="detail-value">{app.bank}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Loan Type</span>
                            <span className="detail-value">{app.type}</span>
                          </div>
                        </div>
                        <div className="detail-column">
                          <div className="detail-item">
                            <span className="detail-label">Amount</span>
                            <span className="detail-value">{app.amount}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Applied On</span>
                            <span className="detail-value">{app.appliedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="application-progress">
                        <div className="progress-label">Application Progress</div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${app.progress}%`, backgroundColor: app.color }}
                          ></div>
                        </div>
                        <div className="progress-percentage">{app.progress}%</div>
                      </div>
                      <div className="application-next-step">
                        <span className="next-step-label">Next Step:</span>
                        <span className="next-step-value">{app.nextStep}</span>
                      </div>
                      <div className="application-actions">
                        <button
                          className="action-button view"
                          style={{ backgroundColor: "#6A0DAD", color: "white" }}
                          onClick={() => viewApplicationDetails(app)}
                        >
                          <Eye size={16} /> View Details
                        </button>
                        <button
                          className="action-button documents"
                          style={{ backgroundColor: "#FF9800", color: "white" }}
                          onClick={() => setShowUploadModal(true)}
                        >
                          <Upload size={16} /> Upload Documents
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-applications">
                  <div className="no-data-icon">
                    <FolderOpen size={80} />
                  </div>
                  <h3>No Applications Found</h3>
                  <p>You haven't applied for any loans yet. Start by getting loan recommendations.</p>
                  <button className="start-button" onClick={() => setActiveTab("loans")}>
                    Get Loan Recommendations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="modal-overlay">
          <div className="compare-modal">
            <div className="modal-header">
              <h3>Compare Banks</h3>
              <button className="close-modal" onClick={() => setShowCompareModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="compare-table-container">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>Features</th>
                      {selectedBanksToCompare.map((bank, idx) => (
                        <th key={idx}>
                          <div className="bank-header">
                            <img src={bank.logo || "/placeholder.svg"} alt={bank.name} />
                            <span>{bank.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="highlight-row">
                      <td>Interest Rate</td>
                      {selectedBanksToCompare.map((bank, idx) => (
                        <td key={idx}>{bank.interestRate}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Maximum Loan Amount</td>
                      {selectedBanksToCompare.map((bank, idx) => (
                        <td key={idx}>{bank.maxLoanAmount}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Processing Fee</td>
                      {selectedBanksToCompare.map((bank, idx) => (
                        <td key={idx}>{bank.processingFee}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Special Features</td>
                      {selectedBanksToCompare.map((bank, idx) => (
                        <td key={idx}>{bank.specialFeatures}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Rating</td>
                      {selectedBanksToCompare.map((bank, idx) => (
                        <td key={idx}>{renderStarRating(bank.rating)}</td>
                      ))}
                    </tr>
                    <tr className="action-row">
                      <td>Action</td>
                      {selectedBanksToCompare.map((bank, idx) => (
                        <td key={idx}>
                          <button
                            className="apply-button"
                            onClick={() => {
                              setShowCompareModal(false)
                              document.getElementById("loan-application-section").scrollIntoView({ behavior: "smooth" })
                            }}
                          >
                            Apply Now
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="comparison-chart">
                <h4>Interest Rate Comparison</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={selectedBanksToCompare.map((bank) => ({
                      name: bank.name,
                      interestRate: Number.parseFloat(bank.interestRate.replace("%", "")),
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Interest Rate"]} />
                    <Legend />
                    <Bar dataKey="interestRate" name="Interest Rate (%)" fill="#00C48C" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="close-modal" onClick={() => setShowDetailsModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="application-summary">
                <div className="summary-header">
                  <div>
                    <h4>{selectedApplication.type} Application</h4>
                    <p>ID: {selectedApplication.id}</p>
                  </div>
                  <div className="application-status" style={{ backgroundColor: selectedApplication.color }}>
                    {selectedApplication.status}
                  </div>
                </div>

                <div className="summary-details">
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">Bank</span>
                      <span className="summary-value">{selectedApplication.bank}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Amount</span>
                      <span className="summary-value">{selectedApplication.amount}</span>
                    </div>
                  </div>
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">Applied On</span>
                      <span className="summary-value">{selectedApplication.appliedDate}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Progress</span>
                      <span className="summary-value">{selectedApplication.progress}% Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="application-timeline">
                <h4>Application Timeline</h4>
                <div className="timeline">
                  {selectedApplication.timeline.map((item, idx) => (
                    <div key={idx} className={`timeline-item ${item.status.toLowerCase()}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-date">{item.date}</div>
                        <div className="timeline-event">{item.event}</div>
                        <div className="timeline-status">{item.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="application-documents">
                <h4>Document Status</h4>
                <div className="documents-list">
                  {selectedApplication.documents.map((doc, idx) => (
                    <div key={idx} className={`document-item ${doc.status.toLowerCase()}`}>
                      <div className="document-icon">
                        <FileText size={24} />
                      </div>
                      <div className="document-details">
                        <div className="document-name">{doc.name}</div>
                        <div className="document-date">Submitted on {doc.date}</div>
                      </div>
                      <div className={`document-status ${doc.status.toLowerCase()}`}>{doc.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button className="contact-button" onClick={() => openBankWebsite(selectedApplication.bank)}>
                  <ExternalLink size={16} style={{ marginRight: "8px" }} /> Contact Bank
                </button>
                <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>Upload Documents</h3>
              <button className="close-modal" onClick={() => setShowUploadModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-section">
                <h4>Required Documents</h4>
                <p>Please upload the following documents to proceed with your loan application.</p>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
                  >
                    <option value="">Select document type</option>
                    <option value="Identity Proof">Identity Proof (Aadhar/PAN/Voter ID)</option>
                    <option value="Income Proof">Income Proof (Salary Slips/ITR)</option>
                    <option value="Address Proof">Address Proof (Utility Bill/Passport)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>Upload File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
                  />
                  <p style={{ fontSize: "12px", color: "#718096" }}>Accepted formats: PDF, JPG, PNG (Max size: 5MB)</p>
                </div>

                <div className="form-actions" style={{ marginTop: "30px" }}>
                  <button
                    className="submit-button"
                    onClick={handleDocumentUpload}
                    style={{ backgroundColor: "#FF9800" }}
                  >
                    <Upload size={16} style={{ marginRight: "8px" }} /> Upload Document
                  </button>
                  <button className="cancel-button" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>

              <div className="application-documents" style={{ marginTop: "30px" }}>
                <h4>Uploaded Documents</h4>
                {uploadedDocuments.length > 0 ? (
                  <div className="documents-list">
                    {uploadedDocuments.map((doc, idx) => (
                      <div key={idx} className="document-item">
                        <div className="document-icon">
                          <FileText size={24} />
                        </div>
                        <div className="document-details">
                          <div className="document-name">{doc.name}</div>
                          <div className="document-date">Uploaded on {doc.uploadDate}</div>
                        </div>
                        <div className={`document-status ${doc.status.toLowerCase().replace(" ", "-")}`}>
                          {doc.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No documents uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bank


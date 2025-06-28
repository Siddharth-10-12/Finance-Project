"use client"

import { useState, useEffect, useRef } from "react"
import Tesseract from "tesseract.js"
import * as pdfjsLib from "pdfjs-dist"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Upload,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Shield,
  PieChart,
  BarChart2,
  Activity,
  ChevronDown,
  Zap,
  Award,
  Briefcase,
  Clock,
  Home,
  CreditCard,
  BookOpen,
  Building,
} from "lucide-react"
import "./TaxProfile.css"
import {
  sendConfirmationEmail,
  verifyAadhar,
  fetchUserData,
  storeDocumentData,
  storeTaxOptimizationData,
  storeTaxProfileData,
  fetchTaxProfileData,
  auth,
} from "./firebase"

import TaxSavingSuggestions from "./taxsaving.js"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.5,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 },
  },
  tap: { scale: 0.95 },
}

const TaxProfile = () => {
  const [documentType, setDocumentType] = useState("")
  const [extractedText, setExtractedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState({})
  const [aadharNumber, setAadharNumber] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")

  // Tax profile data
  const [annualIncome, setAnnualIncome] = useState(0)
  const [insurancePremium, setInsurancePremium] = useState(0)
  const [bankBalance, setBankBalance] = useState(0)
  const [taxPaid, setTaxPaid] = useState(0)
  const [rentPaid, setRentPaid] = useState(0)
  const [educationLoanInterest, setEducationLoanInterest] = useState(0)

  const [age, setAge] = useState(0)
  const [riskLevel, setRiskLevel] = useState("low")
  const [taxCalculation, setTaxCalculation] = useState(0)
  const [taxSavingOpportunities, setTaxSavingOpportunities] = useState([])
  const [investmentRecommendations, setInvestmentRecommendations] = useState([])
  const [simulationStrategy, setSimulationStrategy] = useState("")
  const [userData, setUserData] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showTaxCalculationAnimation, setShowTaxCalculationAnimation] = useState(false)
  const [showTaxSavingSuggestions, setShowTaxSavingSuggestions] = useState(false)
  const [taxProfileData, setTaxProfileData] = useState(null)

  // Refs for scroll animations
  const sectionRefs = {
    document: useRef(null),
    aadhar: useRef(null),
    tax: useRef(null),
    opportunities: useRef(null),
    investments: useRef(null),
    strategy: useRef(null),
  }

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        const data = await fetchUserData(auth.currentUser.uid)
        setUserData(data)

        // Fetch tax profile data if it exists
        const taxProfile = await fetchTaxProfileData(auth.currentUser.uid)
        if (taxProfile) {
          setTaxProfileData(taxProfile)
          setAnnualIncome(taxProfile.annual_income || 0)
          setInsurancePremium(taxProfile.insurance_premium || 0)
          setBankBalance(taxProfile.bank_balance || 0)
          setTaxPaid(taxProfile.tax_paid || 0)
          setRentPaid(taxProfile.rent_paid || 0)
          setEducationLoanInterest(taxProfile.education_loan_interest || 0)
          setAge(taxProfile.age || 0)
        }
      }
    }
    fetchData()

    // Initialize intersection observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section")
            setActiveSection(sectionId)
          }
        })
      },
      { threshold: 0.3 },
    )

    // Observe all section refs
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  // Simulated upload progress
  useEffect(() => {
    if (isLoading && uploadProgress < 100) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 100 ? 100 : newProgress
        })
      }, 300)

      return () => clearInterval(interval)
    }

    if (uploadProgress === 100) {
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    }
  }, [isLoading, uploadProgress])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) {
      alert("Please upload a file.")
      return
    }

    console.log("Uploaded file:", file)
    setUploadProgress(5) // Start progress

    if (file.type === "application/pdf") {
      extractTextFromPDF(file)
    } else if (file.type.startsWith("image/")) {
      extractTextFromImage(file)
    } else {
      alert("Please upload a valid image or PDF file.")
      setUploadProgress(0)
    }
  }

  const extractTextFromPDF = async (file) => {
    setIsLoading(true)
    try {
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise
      console.log("PDF loaded successfully")

      const page = await pdf.getPage(1) // Extract first page
      console.log("Page loaded successfully")

      const viewport = page.getViewport({ scale: 2.0 }) // Increase scale for better quality
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({ canvasContext: context, viewport }).promise
      console.log("Page rendered successfully")

      const image = canvas.toDataURL("image/png")
      console.log("Image generated:", image)

      // Display the rendered image for debugging
      const imgElement = document.createElement("img")
      imgElement.src = image
      document.body.appendChild(imgElement)

      extractTextFromImage(image) // Pass the image to Tesseract.js
    } catch (error) {
      console.error("Error processing PDF:", error)
      alert("Failed to process PDF. Please try again with a different file.")
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const extractTextFromImage = async (file) => {
    setIsLoading(true)
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(
        file,
        "eng", // Language
        {
          logger: (info) => {
            console.log(info)
            if (info.status === "recognizing text") {
              setUploadProgress(50 + info.progress * 50) // Map progress from 50% to 100%
            }
          },
        },
      )
      console.log("Text extracted:", text)
      setExtractedText(text)
      parseText(text) // Parse the extracted text
      setUploadProgress(100)

      // Show success animation
      setTimeout(() => {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }, 500)
    } catch (error) {
      console.error("Error extracting text:", error)
      alert("Failed to extract text. Please try again with a different file.")
      setUploadProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const parseText = (text) => {
    let data = {}
    switch (documentType) {
      case "Form 16":
        data = parseForm16(text)
        // Update annual income and tax paid from Form 16
        if (data.income && !isNaN(data.income)) {
          setAnnualIncome(Number(data.income))
        }
        if (data.tax && !isNaN(data.tax)) {
          setTaxPaid(Number(data.tax))
        }
        break
      case "Insurance Policy":
        data = parseInsurancePolicy(text)
        // Update insurance premium from policy
        if (data.premiumAmount && !isNaN(data.premiumAmount)) {
          setInsurancePremium(Number(data.premiumAmount))
        }
        break
      case "Bank Statement":
        data = parseBankStatement(text)
        // Update bank balance from statement
        if (data.balance && !isNaN(data.balance)) {
          setBankBalance(Number(data.balance))
        }
        break
      case "PAN Card":
        data = parsePanCard(text)
        break
      default:
        data = { error: "Unsupported document type" }
    }
    setParsedData(data)
    storeDocumentData(auth.currentUser.uid, documentType, data)
  }

  const parseForm16 = (text) => {
    const panRegex = /Permanent Account Number[\s:]*([A-Z]{5}\d{4}[A-Z])/i
    const incomeRegex = /Total Income[\s:]*([\d,]+)/i
    const taxRegex = /Total Tax[\s:]*([\d,]+)/i

    const pan = text.match(panRegex)?.[1] || "Not found"
    const income = text.match(incomeRegex)?.[1]?.replace(/,/g, "") || "Not found"
    const tax = text.match(taxRegex)?.[1]?.replace(/,/g, "") || "Not found"

    return { pan, income, tax }
  }

  const parseInsurancePolicy = (text) => {
    const policyRegex = /Policy Number[\s:]*(\w+)/i
    const premiumRegex = /Premium Amount[\s:]*([\d,]+)/i

    const policyNumber = text.match(policyRegex)?.[1] || "Not found"
    const premiumAmount = text.match(premiumRegex)?.[1]?.replace(/,/g, "") || "Not found"

    return { policyNumber, premiumAmount }
  }

  const parseBankStatement = (text) => {
    const accountRegex = /Account Number[\s:]*(\d+)/i
    const balanceRegex = /Closing Balance[\s:]*([\d,]+)/i

    const accountNumber = text.match(accountRegex)?.[1] || "Not found"
    const balance = text.match(balanceRegex)?.[1]?.replace(/,/g, "") || "Not found"

    return { accountNumber, balance }
  }

  const parsePanCard = (text) => {
    const panRegex = /Permanent Account Number[\s:]*([A-Z]{5}\d{4}[A-Z])/i
    const nameRegex = /Name[\s:]*([A-Z\s]+)/i

    const pan = text.match(panRegex)?.[1] || "Not found"
    const name = text.match(nameRegex)?.[1] || "Not found"

    return { pan, name }
  }

  const handleAadharVerification = async () => {
    await sendConfirmationEmail(aadharNumber)
    alert("Confirmation code sent to your email.")
  }

  const handleConfirmationCode = async () => {
    const isVerified = await verifyAadhar(aadharNumber, confirmationCode)
    if (isVerified) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      alert("Aadhar verified successfully.")
      setUserData({ ...userData, isAadharVerified: true })
    } else {
      alert("Invalid confirmation code.")
    }
  }

  const saveTaxProfileData = async () => {
    if (!auth.currentUser) {
      alert("Please log in to save your tax profile data.")
      return
    }

    const profileData = {
      annual_income: annualIncome,
      insurance_premium: insurancePremium,
      bank_balance: bankBalance,
      tax_paid: taxPaid,
      rent_paid: rentPaid,
      education_loan_interest: educationLoanInterest,
      age: age,
      risk_level: riskLevel,
      timestamp: new Date(),
    }

    try {
      await storeTaxProfileData(auth.currentUser.uid, profileData)
      setTaxProfileData(profileData)
      alert("Tax profile data saved successfully!")

      // Show confetti animation
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error("Error saving tax profile data:", error)
      alert("Failed to save tax profile data. Please try again.")
    }
  }

  const calculateTax = () => {
    // Show calculation animation
    setShowTaxCalculationAnimation(true)

    setTimeout(() => {
      // Indian tax calculation based on the new tax regime (simplified)
      let tax = 0
      const taxableIncome = annualIncome - calculateDeductions()

      // New tax regime slabs (FY 2023-24)
      if (taxableIncome <= 300000) {
        tax = 0
      } else if (taxableIncome <= 600000) {
        tax = (taxableIncome - 300000) * 0.05
      } else if (taxableIncome <= 900000) {
        tax = 15000 + (taxableIncome - 600000) * 0.1
      } else if (taxableIncome <= 1200000) {
        tax = 45000 + (taxableIncome - 900000) * 0.15
      } else if (taxableIncome <= 1500000) {
        tax = 90000 + (taxableIncome - 1200000) * 0.2
      } else {
        tax = 150000 + (taxableIncome - 1500000) * 0.3
      }

      // Add 4% health and education cess
      tax = tax + tax * 0.04

      setTaxCalculation(Math.round(tax))

      // Store tax optimization data
      storeTaxOptimizationData(auth.currentUser.uid, {
        annualIncome,
        taxableIncome,
        taxCalculation: Math.round(tax),
        taxSavingOpportunities,
        investmentRecommendations,
        simulationStrategy,
      })

      setShowTaxCalculationAnimation(false)
    }, 2000)
  }

  const calculateDeductions = () => {
    // Calculate standard deduction
    const standardDeduction = 50000

    // Calculate deductions based on user inputs
    let totalDeductions = standardDeduction

    // Section 80C deductions (max 150000)
    const section80C = Math.min(150000, insurancePremium)

    // Section 80D deductions for health insurance (max 25000)
    const section80D = Math.min(25000, insurancePremium * 0.5)

    // HRA exemption (simplified calculation)
    const hraExemption = rentPaid > 0 ? Math.min(rentPaid, annualIncome * 0.1) : 0

    // Education loan interest deduction (Section 80E)
    const section80E = educationLoanInterest

    totalDeductions += section80C + section80D + hraExemption + section80E

    return totalDeductions
  }

  const suggestTaxSavingOpportunities = () => {
    // Show tax saving suggestions component
    setShowTaxSavingSuggestions(true)

    // Create financial data object for the TaxSavingSuggestions component
    const financialData = {
      annual_income: annualIncome,
      insurance_premium: insurancePremium,
      bank_balance: bankBalance,
      tax_paid: taxPaid,
      rent_paid: rentPaid,
      education_loan_interest: educationLoanInterest,
    }

    // Generate basic opportunities list
    const opportunities = [
      {
        title: "ELSS Mutual Funds",
        description:
          "Invest in Equity Linked Saving Schemes under Section 80C for tax benefits with potential for higher returns.",
        section: "Section 80C",
        recommended: true,
      },
      {
        title: "Health Insurance Premium",
        description: "Increase your health insurance coverage for additional tax benefits under Section 80D.",
        section: "Section 80D",
        recommended: insurancePremium < 25000,
      },
      {
        title: "National Pension Scheme (NPS)",
        description: "Contribute to NPS for additional ₹50,000 tax benefit under Section 80CCD(1B).",
        section: "Section 80CCD(1B)",
        recommended: true,
      },
      {
        title: "House Rent Allowance",
        description: "Claim HRA exemption if you're paying rent for accommodation.",
        section: "HRA Exemption",
        recommended: rentPaid > 0,
      },
      {
        title: "Tax-Saving Fixed Deposits",
        description: "Invest in 5-year tax-saving FDs for stable returns with tax benefits.",
        section: "Section 80C",
        recommended: bankBalance < 0.3 * annualIncome,
      },
      {
        title: "Education Loan Interest",
        description: "Claim deduction for education loan interest under Section 80E.",
        section: "Section 80E",
        recommended: educationLoanInterest > 0,
      },
    ]

    // Filter to only show recommended opportunities
    const filteredOpportunities = opportunities
      .filter((opp) => opp.recommended)
      .map((opp) => opp.title + ": " + opp.description)

    setTaxSavingOpportunities(filteredOpportunities)
  }

  const suggestInvestments = () => {
    // Determine investment allocation based on age, income, and risk preference
    const ageBasedFactor = Math.max(0, Math.min(1, (60 - age) / 40)) // Higher for younger people
    const incomeBasedFactor = Math.min(1, annualIncome / 1500000) // Higher for higher income

    // Customize recommendations based on user profile
    const recommendations = {
      low: [
        {
          name: "Fixed Deposits",
          description: "Secure returns with minimal risk",
          icon: <Shield size={20} />,
          allocation: 40 + 10 * (1 - ageBasedFactor), // More FDs for older people
        },
        {
          name: "Debt Mutual Funds",
          description: "Stable income with moderate liquidity",
          icon: <TrendingUp size={20} />,
          allocation: 30 + 5 * (1 - incomeBasedFactor), // More debt for lower income
        },
        {
          name: "Government Bonds",
          description: "Backed by government guarantee",
          icon: <Award size={20} />,
          allocation: 20 + 5 * (1 - ageBasedFactor), // More bonds for older people
        },
        {
          name: "PPF",
          description: "Public Provident Fund with tax benefits",
          icon: <Building size={20} />,
          allocation: 10 + 5 * incomeBasedFactor, // More PPF for higher income
        },
      ],
      medium: [
        {
          name: "Hybrid Mutual Funds",
          description: "Balanced exposure to equity and debt",
          icon: <PieChart size={20} />,
          allocation: 35 + 5 * ageBasedFactor, // More hybrid funds for younger people
        },
        {
          name: "Index Funds",
          description: "Track market indices with lower costs",
          icon: <BarChart2 size={20} />,
          allocation: 25 + 10 * incomeBasedFactor, // More index funds for higher income
        },
        {
          name: "Corporate Bonds",
          description: "Higher yields than government securities",
          icon: <Briefcase size={20} />,
          allocation: 20 - 5 * ageBasedFactor, // Less corporate bonds for younger people
        },
        {
          name: "Blue Chip Stocks",
          description: "Established companies with stable performance",
          icon: <CreditCard size={20} />,
          allocation: 20 + 5 * ageBasedFactor, // More blue chips for younger people
        },
      ],
      high: [
        {
          name: "Equity Mutual Funds",
          description: "Long-term capital appreciation potential",
          icon: <TrendingUp size={20} />,
          allocation: 40 + 10 * ageBasedFactor, // More equity for younger people
        },
        {
          name: "Mid & Small Cap Stocks",
          description: "Higher growth potential with increased volatility",
          icon: <Activity size={20} />,
          allocation: 25 + 5 * ageBasedFactor, // More small caps for younger people
        },
        {
          name: "International Funds",
          description: "Global diversification opportunities",
          icon: <Globe size={20} />,
          allocation: 20 + 5 * incomeBasedFactor, // More international exposure for higher income
        },
        {
          name: "Sectoral Funds",
          description: "Focused investments in specific sectors",
          icon: <BookOpen size={20} />,
          allocation: 15 - 5 * (1 - incomeBasedFactor), // Less sectoral funds for lower income
        },
      ],
    }

    // Normalize allocations to ensure they sum to 100%
    const normalizeAllocations = (recs) => {
      const total = recs.reduce((sum, rec) => sum + rec.allocation, 0)
      return recs.map((rec) => ({
        ...rec,
        allocation: Math.round((rec.allocation / total) * 100),
      }))
    }

    const normalizedRecommendations = normalizeAllocations(recommendations[riskLevel])
    setInvestmentRecommendations(normalizedRecommendations)
  }

  const simulateStrategy = () => {
    if (investmentRecommendations.length === 0) {
      alert("Please generate investment recommendations first.")
      return
    }

    // Calculate potential returns based on risk level and age
    const riskReturnRate = {
      low: 0.06, // 6% average annual return
      medium: 0.1, // 10% average annual return
      high: 0.14, // 14% average annual return
    }

    // Adjust return rate based on age (younger can take more risk)
    const ageAdjustment = Math.max(0, Math.min(0.02, (60 - age) / 300)) // Up to 2% additional return for younger investors
    const baseReturnRate = riskReturnRate[riskLevel] + ageAdjustment

    // Calculate monthly investment amount (assumed to be 20% of annual income divided by 12)
    const monthlyInvestment = (annualIncome * 0.2) / 12

    // Calculate potential wealth after 5, 10, and 20 years
    const calculateFutureValue = (monthlyAmount, ratePerYear, years) => {
      const monthlyRate = ratePerYear / 12
      return monthlyAmount * ((Math.pow(1 + monthlyRate, years * 12) - 1) / monthlyRate)
    }

    const year5Value = calculateFutureValue(monthlyInvestment, baseReturnRate, 5)
    const year10Value = calculateFutureValue(monthlyInvestment, baseReturnRate, 10)
    const year20Value = calculateFutureValue(monthlyInvestment, baseReturnRate, 20)

    // Format the strategy text
    const strategy = `Based on your annual income of ₹${annualIncome.toLocaleString("en-IN")}, age of ${age}, and ${riskLevel} risk profile, we recommend investing approximately ₹${Math.round(monthlyInvestment).toLocaleString("en-IN")} monthly in a diversified portfolio.

With an estimated annual return of ${(baseReturnRate * 100).toFixed(1)}%, your investments could grow to:
• ₹${Math.round(year5Value).toLocaleString("en-IN")} in 5 years
• ₹${Math.round(year10Value).toLocaleString("en-IN")} in 10 years
• ₹${Math.round(year20Value).toLocaleString("en-IN")} in 20 years

Your optimal portfolio allocation:
${investmentRecommendations.map((rec) => `• ${rec.name}: ${rec.allocation}%`).join("\n")}`

    setSimulationStrategy(strategy)
  }

  // Get document icon based on type
  const getDocumentIcon = () => {
    switch (documentType) {
      case "Form 16":
        return <FileText className="icon form-icon" />
      case "Insurance Policy":
        return <Shield className="icon insurance-icon" />
      case "Bank Statement":
        return <DollarSign className="icon bank-icon" />
      case "PAN Card":
        return <Briefcase className="icon pan-icon" />
      default:
        return <FileText className="icon" />
    }
  }

  // Get risk level icon and color
  const getRiskDetails = () => {
    switch (riskLevel) {
      case "low":
        return {
          icon: <Shield className="risk-icon low-risk" />,
          color: "var(--low-risk-color)",
          label: "Low Risk",
        }
      case "medium":
        return {
          icon: <PieChart className="risk-icon medium-risk" />,
          color: "var(--medium-risk-color)",
          label: "Medium Risk",
        }
      case "high":
        return {
          icon: <Activity className="risk-icon high-risk" />,
          color: "var(--high-risk-color)",
          label: "High Risk",
        }
      default:
        return {
          icon: <Shield className="risk-icon" />,
          color: "var(--low-risk-color)",
          label: "Low Risk",
        }
    }
  }

  // If tax saving suggestions are shown, render that component
  if (showTaxSavingSuggestions) {
    return (
      <TaxSavingSuggestions
        financialData={{
          annual_income: annualIncome,
          insurance_premium: insurancePremium,
          bank_balance: bankBalance,
          tax_paid: taxPaid,
          rent_paid: rentPaid,
          education_loan_interest: educationLoanInterest,
        }}
        onBack={() => setShowTaxSavingSuggestions(false)}
      />
    )
  }

  return (
    <motion.div className="tax-profile" initial="hidden" animate="visible" variants={containerVariants}>
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              }}
            />
          ))}
        </div>
      )}

      <motion.div className="header-section" variants={itemVariants}>
        <h1>Tax Profile & Optimization</h1>
        <div className="header-underline"></div>
        <p className="header-subtitle">Upload documents, verify identity, and optimize your tax strategy</p>
      </motion.div>

      <motion.div
        className={`section ${activeSection === "document" ? "active-section" : ""}`}
        ref={sectionRefs.document}
        data-section="document"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-icon">
            <FileText size={24} />
          </div>
          <h2>Document Upload & Data Extraction</h2>
        </div>

        <div className="section-content">
          <div className="form-group">
            <label>Select Document Type</label>
            <div className="select-wrapper">
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                <option value="">Select Document Type</option>
                <option value="Form 16">Form 16</option>
                <option value="Insurance Policy">Insurance Policy</option>
                <option value="Bank Statement">Bank Statement</option>
                <option value="PAN Card">PAN Card</option>
              </select>
              <ChevronDown className="select-icon" size={18} />
            </div>
          </div>

          <AnimatePresence>
            {documentType && (
              <motion.div
                className="document-upload"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="document-type-indicator">
                  {getDocumentIcon()}
                  <span>{documentType}</span>
                </div>

                <div className="upload-container">
                  <label className="file-upload-label">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <div className="upload-icon-container">
                      <Upload size={24} />
                    </div>
                    <span>Upload {documentType}</span>
                  </label>
                </div>

                {isLoading && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <div className="progress-text">
                      {uploadProgress < 100 ? "Processing..." : "Complete!"}
                      <span className="progress-percentage">{Math.round(uploadProgress)}%</span>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {extractedText && (
                    <motion.div
                      className="result-container"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="extracted-text">
                        <h4>Extracted Text:</h4>
                        <div className="text-content">
                          <pre>{extractedText}</pre>
                        </div>
                      </div>

                      {Object.keys(parsedData).length > 0 && (
                        <motion.div
                          className="parsed-data"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4>Parsed Data:</h4>
                          <ul className="data-list">
                            {Object.entries(parsedData).map(([key, value], index) => (
                              <motion.li
                                key={key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <span className="data-key">{key}:</span>
                                <span className="data-value">{value}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        className={`section ${activeSection === "aadhar" ? "active-section" : ""}`}
        ref={sectionRefs.aadhar}
        data-section="aadhar"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-icon">
            <CheckCircle size={24} />
          </div>
          <h2>Verify Aadhar</h2>
        </div>

        <div className="section-content">
          <div className="aadhar-verification">
            <div className="form-group">
              <label>Aadhar Number</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhar Number"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  maxLength={12}
                />
                <div className="input-icon">
                  <Briefcase size={18} />
                </div>
              </div>
            </div>

            <motion.button
              className="action-button verify-button"
              onClick={handleAadharVerification}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Zap size={18} />
              <span>Send Confirmation Code</span>
            </motion.button>

            <AnimatePresence>
              {aadharNumber.length > 0 && (
                <motion.div
                  className="confirmation-code-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="form-group">
                    <label>Confirmation Code</label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        placeholder="Enter Code Sent to Your Email"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                      />
                      <div className="input-icon">
                        <Shield size={18} />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    className="action-button confirm-button"
                    onClick={handleConfirmationCode}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <CheckCircle size={18} />
                    <span>Verify Code</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {userData?.isAadharVerified && (
              <motion.div
                className="verification-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <CheckCircle size={24} />
                <span>Verified</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className={`section ${activeSection === "tax" ? "active-section" : ""}`}
        ref={sectionRefs.tax}
        data-section="tax"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-icon">
            <DollarSign size={24} />
          </div>
          <h2>Tax Profile Information</h2>
        </div>

        <div className="section-content">
          <div className="tax-calculation-form">
            <div className="form-row">
              <div className="form-group">
                <label>Annual Income (₹)</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    placeholder="Enter your annual income"
                    value={annualIncome || ""}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  />
                  <div className="input-icon">
                    <DollarSign size={18} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Insurance Premium (₹)</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    placeholder="Enter insurance premium paid"
                    value={insurancePremium || ""}
                    onChange={(e) => setInsurancePremium(Number(e.target.value))}
                  />
                  <div className="input-icon">
                    <Shield size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bank Balance (₹)</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    placeholder="Enter your bank balance"
                    value={bankBalance || ""}
                    onChange={(e) => setBankBalance(Number(e.target.value))}
                  />
                  <div className="input-icon">
                    <Building size={18} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Tax Already Paid (₹)</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    placeholder="Enter tax already paid"
                    value={taxPaid || ""}
                    onChange={(e) => setTaxPaid(Number(e.target.value))}
                  />
                  <div className="input-icon">
                    <CreditCard size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rent Paid (₹)</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    placeholder="Enter annual rent paid"
                    value={rentPaid || ""}
                    onChange={(e) => setRentPaid(Number(e.target.value))}
                  />
                  <div className="input-icon">
                    <Home size={18} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Education Loan Interest (₹)</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    placeholder="Enter education loan interest"
                    value={educationLoanInterest || ""}
                    onChange={(e) => setEducationLoanInterest(Number(e.target.value))}
                  />
                  <div className="input-icon">
                    <BookOpen size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    placeholder="Enter your age"
                    value={age || ""}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min="0"
                    max="120"
                  />
                  <div className="input-icon">
                    <Clock size={18} />
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              className="action-button calculate-button"
              onClick={saveTaxProfileData}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <CheckCircle size={18} />
              <span>Save Tax Profile</span>
            </motion.button>

            <motion.button
              className="action-button calculate-button"
              onClick={calculateTax}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={showTaxCalculationAnimation}
              style={{ marginTop: "15px" }}
            >
              {showTaxCalculationAnimation ? (
                <div className="calculation-animation">
                  <div className="calculation-dot"></div>
                  <div className="calculation-dot"></div>
                  <div className="calculation-dot"></div>
                </div>
              ) : (
                <>
                  <BarChart2 size={18} />
                  <span>Calculate Tax</span>
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {taxCalculation > 0 && !showTaxCalculationAnimation && (
                <motion.div
                  className="tax-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="result-card">
                    <div className="result-header">
                      <DollarSign size={24} />
                      <h3>Tax Calculation Result</h3>
                    </div>
                    <div className="result-amount">
                      <span className="currency">₹</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={taxCalculation}
                          className="amount"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {taxCalculation.toLocaleString("en-IN")}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="tax-breakdown">
                      <div className="breakdown-item">
                        <span>Income:</span>
                        <span>₹{annualIncome.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Deductions:</span>
                        <span>₹{calculateDeductions().toLocaleString("en-IN")}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Taxable Income:</span>
                        <span>₹{(annualIncome - calculateDeductions()).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Tax Rate:</span>
                        <span>{((taxCalculation / annualIncome) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div
        className={`section ${activeSection === "opportunities" ? "active-section" : ""}`}
        ref={sectionRefs.opportunities}
        data-section="opportunities"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-icon">
            <Zap size={24} />
          </div>
          <h2>Tax-Saving Opportunities</h2>
        </div>

        <div className="section-content">
          <motion.button
            className="action-button opportunities-button"
            onClick={suggestTaxSavingOpportunities}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Shield size={18} />
            <span>Suggest Opportunities</span>
          </motion.button>

          <AnimatePresence>
            {taxSavingOpportunities.length > 0 && (
              <motion.div
                className="opportunities-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ul>
                  {taxSavingOpportunities.map((opportunity, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="opportunity-item"
                    >
                      <Zap className="opportunity-icon" size={18} />
                      <span>{opportunity}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        className={`section ${activeSection === "investments" ? "active-section" : ""}`}
        ref={sectionRefs.investments}
        data-section="investments"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-icon">
            <TrendingUp size={24} />
          </div>
          <h2>Investment Recommendations</h2>
        </div>

        <div className="section-content">
          <div className="risk-selector">
            <label>Select Risk Level</label>
            <div className="risk-options">
              <motion.button
                className={`risk-option ${riskLevel === "low" ? "active" : ""}`}
                onClick={() => setRiskLevel("low")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield size={20} />
                <span>Low Risk</span>
              </motion.button>

              <motion.button
                className={`risk-option ${riskLevel === "medium" ? "active" : ""}`}
                onClick={() => setRiskLevel("medium")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PieChart size={20} />
                <span>Medium Risk</span>
              </motion.button>

              <motion.button
                className={`risk-option ${riskLevel === "high" ? "active" : ""}`}
                onClick={() => setRiskLevel("high")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Activity size={20} />
                <span>High Risk</span>
              </motion.button>
            </div>
          </div>

          <motion.button
            className="action-button recommendations-button"
            onClick={suggestInvestments}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <TrendingUp size={18} />
            <span>Get Recommendations</span>
          </motion.button>

          <AnimatePresence>
            {investmentRecommendations.length > 0 && (
              <motion.div
                className="recommendations-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="risk-indicator" style={{ backgroundColor: getRiskDetails().color }}>
                  {getRiskDetails().icon}
                  <span>{getRiskDetails().label} Portfolio</span>
                </div>

                <div className="recommendations-list">
                  {investmentRecommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      className="recommendation-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="recommendation-icon">{recommendation.icon}</div>
                      <div className="recommendation-content">
                        <h4>
                          {recommendation.name} ({recommendation.allocation}%)
                        </h4>
                        <p>{recommendation.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        className={`section ${activeSection === "strategy" ? "active-section" : ""}`}
        ref={sectionRefs.strategy}
        data-section="strategy"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-icon">
            <Activity size={24} />
          </div>
          <h2>Simulate Strategy</h2>
        </div>

        <div className="section-content">
          <motion.button
            className="action-button simulate-button"
            onClick={simulateStrategy}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={investmentRecommendations.length === 0}
          >
            <PieChart size={18} />
            <span>Simulate Strategy</span>
          </motion.button>

          <AnimatePresence>
            {simulationStrategy && (
              <motion.div
                className="strategy-result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="strategy-card">
                  <div className="strategy-header">
                    <Activity size={24} />
                    <h3>Your Personalized Strategy</h3>
                  </div>
                  <div className="strategy-text">
                    {simulationStrategy.split("\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="strategy-visualization">
                    <div className="chart-placeholder">
                      {investmentRecommendations.length > 0 && (
                        <>
                          <div
                            className="chart-bar"
                            style={{
                              height: `${Math.min(90, 30 + annualIncome / 20000)}%`,
                              backgroundColor: "var(--primary-color)",
                            }}
                          >
                            <span className="chart-label">Year 5</span>
                          </div>
                          <div
                            className="chart-bar"
                            style={{
                              height: `${Math.min(90, 40 + annualIncome / 15000)}%`,
                              backgroundColor: "var(--secondary-color)",
                            }}
                          >
                            <span className="chart-label">Year 10</span>
                          </div>
                          <div
                            className="chart-bar"
                            style={{
                              height: `${Math.min(90, 50 + annualIncome / 10000)}%`,
                              backgroundColor: "var(--accent-color)",
                            }}
                          >
                            <span className="chart-label">Year 20</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="portfolio-allocation">
                      <h4>Suggested Allocation</h4>
                      <div className="allocation-chart">
                        {investmentRecommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="allocation-segment"
                            style={{
                              width: `${rec.allocation}%`,
                              backgroundColor:
                                index === 0
                                  ? "var(--primary-color)"
                                  : index === 1
                                    ? "var(--secondary-color)"
                                    : index === 2
                                      ? "var(--accent-color)"
                                      : "var(--warning-color)",
                            }}
                          >
                            <span className="allocation-percentage">{rec.allocation}%</span>
                            <span className="allocation-label">{rec.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Define the Globe component since it was used but not imported
const Globe = ({ size, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  )
}

export default TaxProfile


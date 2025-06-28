// This file serves as a bridge between the Python bank recommendation model and our React frontend
// It simulates the functionality of the bankrec.py model in JavaScript

// Bank logos for different banks
const bankLogos = {
    SBI: "https://1000logos.net/wp-content/uploads/2018/03/SBI-Logo.png",
    HDFC: "https://1000logos.net/wp-content/uploads/2021/06/HDFC-Bank-emblem.png",
    ICIC: "https://1000logos.net/wp-content/uploads/2021/05/ICICI-Bank-logo.png",
    PNB: "https://www.pnbindia.in/images/logo.png",
    "Axis Bank": "https://1000logos.net/wp-content/uploads/2021/05/Axis-Bank-logo.png",
    IDFC: "https://www.idfcfirstbank.com/content/dam/IDFCFirstBank/images/icons/logo-main.svg",
    "Bank of Baroda": "https://1000logos.net/wp-content/uploads/2021/06/Bank-of-Baroda-logo.png",
    "Kotak Mahindra Bank": "https://1000logos.net/wp-content/uploads/2021/06/Kotak-Mahindra-Bank-logo.png",
    "Yes Bank": "https://1000logos.net/wp-content/uploads/2021/06/Yes-Bank-logo.png",
    "Union Bank of India": "https://www.unionbankofindia.co.in/english/images/logo-new.png",
    "Bajaj Finserv": "https://www.bajajfinserv.in/BFL_Logo_Color.png",
    "Tata Capital": "https://www.tatacapital.com/content/dam/tata-capital/images/logo.png",
    "Fullerton India": "https://www.fullertonindia.com/images/logo.png",
    "HDFC Credila": "https://www.hdfccredila.com/assets/images/logo.png",
    "LIC Housing Finance": "https://www.lichousing.com/static/images/logo.png",
    "PNB Housing Finance": "https://www.pnbhousing.com/wp-content/uploads/2020/03/PNB-Housing-Logo.png",
    Citibank: "https://1000logos.net/wp-content/uploads/2016/10/Citibank-Logo.png",
    "Standard Chartered": "https://1000logos.net/wp-content/uploads/2021/05/Standard-Chartered-logo.png",
    "Deutsche Bank": "https://1000logos.net/wp-content/uploads/2021/05/Deutsche-Bank-logo.png",
    "DBS Bank": "https://1000logos.net/wp-content/uploads/2021/05/DBS-Bank-logo.png",
  }
  
  // Bank offsets to simulate the Python model's behavior
  const bankOffsets = {
    SBI: -0.5,
    HDFC: -0.3,
    ICIC: 0.0,
    PNB: 0.2,
    "Axis Bank": 0.3,
    IDFC: 0.5,
  }
  
  // Function to calculate interest rate based on customer details
  const calculateInterestRate = (customerDetails, bank) => {
    const { cibil_score, loan_amount, tenure } = customerDetails
  
    // Base calculation similar to the Python model
    let interestRate = 15 - (cibil_score - 300) * 0.005 + (loan_amount / 2500000) * 2 + -tenure * 0.1
  
    // Apply bank-specific offset
    if (bankOffsets[bank]) {
      interestRate += bankOffsets[bank]
    }
  
    // Add some randomness to simulate the model's variability
    interestRate += (Math.random() - 0.5) * 0.5
  
    return interestRate.toFixed(2)
  }
  
  // Function to get bank recommendations based on customer details
  export const recommendBank = async (customerDetails) => {
    // List of banks to consider
    const banks = ["SBI", "HDFC", "ICIC", "PNB", "Axis Bank", "IDFC"]
  
    // Calculate interest rates for each bank
    const predictions = {}
    banks.forEach((bank) => {
      predictions[bank] = calculateInterestRate(customerDetails, bank)
    })
  
    // Sort banks by interest rate (lowest first)
    const sortedBanks = Object.keys(predictions).sort((a, b) => predictions[a] - predictions[b])
  
    // Create bank recommendation objects
    const recommendations = sortedBanks.map((bank, index) => {
      // Determine max loan amount based on customer details and bank
      let maxLoanAmount
      if (customerDetails.cibil_score >= 750) {
        maxLoanAmount =
          bank === "SBI" ? "₹7.5 Crore" : bank === "HDFC" ? "₹5 Crore" : bank === "ICIC" ? "₹4 Crore" : "₹3 Crore"
      } else if (customerDetails.cibil_score >= 650) {
        maxLoanAmount =
          bank === "SBI" ? "₹3 Crore" : bank === "HDFC" ? "₹2.5 Crore" : bank === "ICIC" ? "₹2 Crore" : "₹1.5 Crore"
      } else {
        maxLoanAmount =
          bank === "SBI" ? "₹1 Crore" : bank === "HDFC" ? "₹75 Lakh" : bank === "ICIC" ? "₹50 Lakh" : "₹25 Lakh"
      }
  
      // Determine processing fee
      const processingFee =
        customerDetails.cibil_score >= 750 ? "0.50%" : customerDetails.cibil_score >= 650 ? "0.75%" : "1.00%"
  
      // Special features based on loan type
      let specialFeatures
      switch (customerDetails.loan_type) {
        case "home":
          specialFeatures =
            bank === "SBI"
              ? "No prepayment charges, Special rates for women"
              : bank === "HDFC"
                ? "Quick approval, Flexible repayment options"
                : bank === "ICIC"
                  ? "Doorstep service, Digital approval process"
                  : "Competitive rates, Minimal documentation"
          break
        case "personal":
          specialFeatures =
            bank === "SBI"
              ? "Low interest rates, Minimal documentation"
              : bank === "HDFC"
                ? "Pre-approved offers, Flexible tenure"
                : bank === "ICIC"
                  ? "Quick disbursal, No collateral required"
                  : "Easy application process, Fast approval"
          break
        case "car":
          specialFeatures =
            bank === "SBI"
              ? "Special rates for electric vehicles, No foreclosure charges"
              : bank === "HDFC"
                ? "Up to 100% financing, Quick approval"
                : bank === "ICIC"
                  ? "Attractive interest rates, Minimal documentation"
                  : "Flexible repayment options, Quick processing"
          break
        case "education":
          specialFeatures =
            bank === "SBI"
              ? "Covers 100% tuition fees, Moratorium period"
              : bank === "HDFC"
                ? "Special rates for premier institutions, Extended repayment period"
                : bank === "ICIC"
                  ? "Global education coverage, Flexible repayment"
                  : "Competitive rates, Minimal documentation"
          break
        case "business":
          specialFeatures =
            bank === "SBI"
              ? "Collateral-free loans up to ₹50 lakh, Quick approval"
              : bank === "HDFC"
                ? "Flexible repayment options, Minimal documentation"
                : bank === "ICIC"
                  ? "Unsecured business loans, Quick disbursal"
                  : "Competitive rates, Minimal documentation"
          break
        default:
          specialFeatures = "Competitive rates, Minimal documentation"
      }
  
      // Calculate rating (higher for lower interest rates)
      const rating = 5 - (predictions[bank] - 8) / 2
      const clampedRating = Math.min(5, Math.max(3.5, rating))
  
      // Get the proper bank name for display
      const displayName = bank === "HDFC" ? "HDFC Bank" : bank === "ICIC" ? "ICICI Bank" : bank
  
      // Return the bank recommendation object
      return {
        name: displayName,
        interestRate: predictions[bank] + "%",
        maxLoanAmount: maxLoanAmount,
        processingFee: processingFee,
        specialFeatures: specialFeatures,
        logo: bankLogos[bank] || "/placeholder.svg",
        rating: Number.parseFloat(clampedRating.toFixed(1)),
      }
    })
  
    return recommendations
  }
  
  
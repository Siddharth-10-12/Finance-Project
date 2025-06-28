"use client"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, DollarSign, Home, BookOpen, PieChart, TrendingUp, Award, Briefcase } from "lucide-react"
import "./TaxProfile.css"

const TaxSavingSuggestions = ({ financialData, onBack }) => {
  // Calculate suggestions based on the financial data
  const calculateSuggestions = (data) => {
    return {
      suggest_ELSS: 1, // Always suggest ELSS
      suggest_80D: data.insurance_premium < 25000 ? 1 : 0,
      suggest_NPS: 1, // Always suggest NPS
      suggest_HRA: data.rent_paid > 0 ? 1 : 0,
      suggest_FD: data.bank_balance < 0.3 * data.annual_income ? 1 : 0,
      suggest_80E: data.education_loan_interest > 0 ? 1 : 0,
      suggest_PPF: data.annual_income > 500000 ? 1 : 0,
      suggest_SSY: 1, // Always suggest Sukanya Samriddhi Yojana for those with daughters
      suggest_ULIP: data.annual_income > 1000000 ? 1 : 0,
      suggest_NSC: data.annual_income > 300000 ? 1 : 0,
    }
  }

  const suggestions = calculateSuggestions(financialData)

  // Get explanation for each suggestion
  const getExplanation = (suggestionKey) => {
    const explanations = {
      suggest_ELSS: {
        title: "Equity Linked Savings Scheme (ELSS)",
        description:
          "Invest in ELSS funds for tax benefits under Section 80C with a 3-year lock-in period. These funds invest primarily in equity and have the potential for higher returns compared to other tax-saving instruments.",
        section: "Section 80C",
        icon: <TrendingUp size={24} className="opportunity-icon" />,
        maxDeduction: "₹1,50,000",
        expectedReturn: "10-12% p.a.",
        lockInPeriod: "3 years",
        riskLevel: "Moderate to High",
      },
      suggest_80D: {
        title: "Health Insurance Premium",
        description:
          "Increase your health insurance coverage for additional tax benefits under Section 80D. You can claim up to ₹25,000 for self and family, and an additional ₹25,000 for parents above 60 years.",
        section: "Section 80D",
        icon: <Shield size={24} className="opportunity-icon" />,
        maxDeduction: "₹25,000 (self & family) + ₹25,000 (parents)",
        expectedReturn: "N/A (Insurance protection)",
        lockInPeriod: "1 year",
        riskLevel: "N/A",
      },
      suggest_NPS: {
        title: "National Pension Scheme (NPS)",
        description:
          "Contribute to NPS for additional ₹50,000 tax benefit under Section 80CCD(1B), over and above the ₹1.5 lakh limit under Section 80C. NPS offers market-linked returns and helps build a retirement corpus.",
        section: "Section 80CCD(1B)",
        icon: <Award size={24} className="opportunity-icon" />,
        maxDeduction: "₹50,000 (additional)",
        expectedReturn: "8-10% p.a.",
        lockInPeriod: "Until retirement",
        riskLevel: "Low to Moderate",
      },
      suggest_HRA: {
        title: "House Rent Allowance",
        description:
          "Claim HRA exemption if you're paying rent for accommodation. The exemption is the minimum of: actual HRA received, 50% of salary (metro cities) or 40% (non-metro), or rent paid minus 10% of salary.",
        section: "HRA Exemption",
        icon: <Home size={24} className="opportunity-icon" />,
        maxDeduction: "Based on formula",
        expectedReturn: "N/A (Tax saving)",
        lockInPeriod: "N/A",
        riskLevel: "N/A",
      },
      suggest_FD: {
        title: "Tax-Saving Fixed Deposit",
        description:
          "Invest in 5-year tax-saving FDs if your bank balance is low relative to income. These offer guaranteed returns with tax benefits under Section 80C, suitable for conservative investors.",
        section: "Section 80C",
        icon: <DollarSign size={24} className="opportunity-icon" />,
        maxDeduction: "₹1,50,000 (combined with other 80C investments)",
        expectedReturn: "5-6% p.a.",
        lockInPeriod: "5 years",
        riskLevel: "Low",
      },
      suggest_80E: {
        title: "Education Loan Interest",
        description:
          "Claim deduction on education loan interest payments under Section 80E. There is no upper limit on the amount of interest that can be claimed, and the deduction is available for a maximum of 8 years.",
        section: "Section 80E",
        icon: <BookOpen size={24} className="opportunity-icon" />,
        maxDeduction: "No limit on interest amount",
        expectedReturn: "N/A (Tax saving)",
        lockInPeriod: "N/A",
        riskLevel: "N/A",
      },
      suggest_PPF: {
        title: "Public Provident Fund (PPF)",
        description:
          "Invest in PPF for long-term wealth creation with tax benefits under Section 80C. PPF offers guaranteed returns with EEE (Exempt-Exempt-Exempt) tax status, making it one of the most tax-efficient instruments.",
        section: "Section 80C",
        icon: <Briefcase size={24} className="opportunity-icon" />,
        maxDeduction: "₹1,50,000 (combined with other 80C investments)",
        expectedReturn: "7-7.5% p.a.",
        lockInPeriod: "15 years",
        riskLevel: "Low",
      },
      suggest_SSY: {
        title: "Sukanya Samriddhi Yojana (SSY)",
        description:
          "For parents with a girl child under 10 years, SSY offers high interest rates with tax benefits under Section 80C. The account matures when the girl turns 21, and partial withdrawals are allowed for education after she turns 18.",
        section: "Section 80C",
        icon: <Shield size={24} className="opportunity-icon" />,
        maxDeduction: "₹1,50,000 (combined with other 80C investments)",
        expectedReturn: "7.6% p.a.",
        lockInPeriod: "21 years",
        riskLevel: "Low",
      },
      suggest_ULIP: {
        title: "Unit Linked Insurance Plan (ULIP)",
        description:
          "ULIPs offer dual benefits of insurance and investment with tax benefits under Section 80C. Modern ULIPs have lower charges and better transparency, making them suitable for long-term goals.",
        section: "Section 80C",
        icon: <PieChart size={24} className="opportunity-icon" />,
        maxDeduction: "₹1,50,000 (combined with other 80C investments)",
        expectedReturn: "8-12% p.a.",
        lockInPeriod: "5 years",
        riskLevel: "Moderate to High",
      },
      suggest_NSC: {
        title: "National Savings Certificate (NSC)",
        description:
          "NSCs are government-backed savings bonds that offer guaranteed returns with tax benefits under Section 80C. Interest accrued is reinvested and deemed to be reinvested, also qualifying for deduction.",
        section: "Section 80C",
        icon: <Award size={24} className="opportunity-icon" />,
        maxDeduction: "₹1,50,000 (combined with other 80C investments)",
        expectedReturn: "6.8% p.a.",
        lockInPeriod: "5 years",
        riskLevel: "Low",
      },
    }
    return explanations[suggestionKey] || {}
  }

  // Calculate potential tax savings
  const calculatePotentialSavings = () => {
    let totalDeductions = 0
    let taxRate = 0

    // Determine tax rate based on income
    if (financialData.annual_income > 1500000) {
      taxRate = 0.3
    } else if (financialData.annual_income > 1200000) {
      taxRate = 0.2
    } else if (financialData.annual_income > 900000) {
      taxRate = 0.15
    } else if (financialData.annual_income > 600000) {
      taxRate = 0.1
    } else if (financialData.annual_income > 300000) {
      taxRate = 0.05
    }

    // Calculate potential deductions
    if (
      suggestions.suggest_ELSS ||
      suggestions.suggest_FD ||
      suggestions.suggest_PPF ||
      suggestions.suggest_SSY ||
      suggestions.suggest_NSC
    ) {
      totalDeductions += 150000 // Max Section 80C limit
    }

    if (suggestions.suggest_80D) {
      totalDeductions += 25000 // Basic health insurance deduction
    }

    if (suggestions.suggest_NPS) {
      totalDeductions += 50000 // Additional NPS deduction
    }

    if (suggestions.suggest_80E) {
      totalDeductions += financialData.education_loan_interest // Full education loan interest
    }

    if (suggestions.suggest_HRA) {
      totalDeductions += Math.min(financialData.rent_paid, financialData.annual_income * 0.1) // Simplified HRA calculation
    }

    // Calculate tax savings
    return Math.round(totalDeductions * taxRate)
  }

  const potentialSavings = calculatePotentialSavings()

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

  return (
    <motion.div className="tax-profile" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="header-section" variants={itemVariants}>
        <h1>Tax Saving Opportunities</h1>
        <div className="header-underline"></div>
        <p className="header-subtitle">
          Personalized recommendations based on your financial profile to maximize tax savings
        </p>
      </motion.div>

      <motion.div className="section active-section" variants={itemVariants}>
        <div className="section-header">
          <div className="section-icon">
            <DollarSign size={24} />
          </div>
          <h2>Potential Tax Savings</h2>
        </div>
        <div className="section-content">
          <div className="result-card">
            <div className="result-header">
              <DollarSign size={24} />
              <h3>Estimated Annual Tax Savings</h3>
            </div>
            <div className="result-amount">
              <span className="currency">₹</span>
              <motion.span
                className="amount"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {potentialSavings.toLocaleString("en-IN")}
              </motion.span>
            </div>
            <div className="tax-breakdown">
              <div className="breakdown-item">
                <span>Annual Income:</span>
                <span>₹{financialData.annual_income.toLocaleString("en-IN")}</span>
              </div>
              <div className="breakdown-item">
                <span>Current Tax Paid:</span>
                <span>₹{financialData.tax_paid.toLocaleString("en-IN")}</span>
              </div>
              <div className="breakdown-item">
                <span>Potential Savings:</span>
                <span>₹{potentialSavings.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="section active-section" variants={itemVariants}>
        <div className="section-header">
          <div className="section-icon">
            <Shield size={24} />
          </div>
          <h2>Recommended Tax Saving Options</h2>
        </div>
        <div className="section-content">
          <div className="opportunities-list">
            {Object.entries(suggestions)
              .filter(([_, value]) => value === 1)
              .map(([key, _], index) => {
                const explanation = getExplanation(key)
                return (
                  <motion.div
                    key={key}
                    className="opportunity-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="opportunity-icon-container">{explanation.icon}</div>
                    <div className="opportunity-content">
                      <h3>{explanation.title}</h3>
                      <p>{explanation.description}</p>
                      <div className="opportunity-details">
                        <div className="detail-item">
                          <span className="detail-label">Section:</span>
                          <span className="detail-value">{explanation.section}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Max Deduction:</span>
                          <span className="detail-value">{explanation.maxDeduction}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Expected Return:</span>
                          <span className="detail-value">{explanation.expectedReturn}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Lock-in Period:</span>
                          <span className="detail-value">{explanation.lockInPeriod}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Risk Level:</span>
                          <span className="detail-value">{explanation.riskLevel}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </div>
      </motion.div>

      <motion.div className="section" variants={itemVariants}>
        <div className="section-header">
          <div className="section-icon">
            <PieChart size={24} />
          </div>
          <h2>Tax Saving Strategy</h2>
        </div>
        <div className="section-content">
          <div className="strategy-result">
            <div className="strategy-card">
              <div className="strategy-header">
                <h3>Optimal Tax Saving Plan</h3>
              </div>
              <div className="strategy-text">
                <p>
                  Based on your financial data, we recommend focusing on these tax-saving instruments to minimize your
                  tax liability while building wealth for the future.
                </p>
                <p>
                  <strong>Priority 1:</strong> Maximize Section 80C benefits (₹1,50,000) through a mix of ELSS, PPF, and
                  tax-saving FDs.
                </p>
                <p>
                  <strong>Priority 2:</strong> Utilize additional deductions like NPS (Section 80CCD) and health
                  insurance (Section 80D).
                </p>
                <p>
                  <strong>Priority 3:</strong> Claim all eligible deductions for housing, education loan interest, and
                  medical expenses.
                </p>
              </div>
              <div className="strategy-visualization">
                <div className="portfolio-allocation">
                  <h4>Suggested Allocation</h4>
                  <div className="allocation-chart">
                    {Object.entries(suggestions)
                      .filter(([_, value]) => value === 1)
                      .map(([key, _], index) => {
                        const explanation = getExplanation(key)
                        const totalSuggestions = Object.values(suggestions).filter((v) => v === 1).length
                        const hue = (index * 360) / totalSuggestions
                        return (
                          <div
                            key={key}
                            className="allocation-segment"
                            style={{
                              width: `${100 / totalSuggestions}%`,
                              backgroundColor: `hsl(${hue}, 70%, 60%)`,
                            }}
                          >
                            <span className="allocation-percentage">{Math.round(100 / totalSuggestions)}%</span>
                            <span className="allocation-label">{explanation.title.split(" ")[0]}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="section" variants={itemVariants}>
        <div className="section-header">
          <div className="section-icon">
            <BookOpen size={24} />
          </div>
          <h2>How These Suggestions Were Calculated</h2>
        </div>
        <div className="section-content">
          <div className="result-container">
            <div className="parsed-data">
              <h4>Decision Rules Applied:</h4>
              <ul className="data-list">
                <li>
                  <span className="data-key">ELSS (Section 80C):</span>
                  <span className="data-value">Always recommended for tax savings with growth potential</span>
                </li>
                <li>
                  <span className="data-key">Health Insurance (Section 80D):</span>
                  <span className="data-value">Recommended when premium &lt; ₹25,000</span>
                </li>
                <li>
                  <span className="data-key">NPS (Section 80CCD(1B)):</span>
                  <span className="data-value">Always recommended for additional ₹50,000 deduction</span>
                </li>
                <li>
                  <span className="data-key">HRA Exemption:</span>
                  <span className="data-value">Recommended when rent paid &gt; 0</span>
                </li>
                <li>
                  <span className="data-key">Tax-Saving FD (Section 80C):</span>
                  <span className="data-value">Recommended when bank balance &lt; 30% of annual income</span>
                </li>
                <li>
                  <span className="data-key">Education Loan (Section 80E):</span>
                  <span className="data-value">Recommended when education loan interest &gt; 0</span>
                </li>
                <li>
                  <span className="data-key">PPF (Section 80C):</span>
                  <span className="data-value">Recommended when annual income &gt; ₹5,00,000</span>
                </li>
                <li>
                  <span className="data-key">ULIP (Section 80C):</span>
                  <span className="data-value">Recommended when annual income &gt; ₹10,00,000</span>
                </li>
              </ul>
            </div>
          </div>
          <motion.button
            className="action-button back-button"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginTop: "20px" }}
          >
            <ArrowLeft size={18} />
            <span>Back to Tax Profile</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TaxSavingSuggestions


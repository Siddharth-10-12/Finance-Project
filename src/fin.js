import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./fin.css";
import ExCa from "./Functions/ExCa";
import PiPl from "./Functions/PiPl";
import EmFu from "./Functions/EmFu";
import Report from "./Report/Report";

const Fin = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("75000");
  const [monthlyExpenses, setMonthlyExpenses] = useState("45000");
  const [savingsDuration, setSavingsDuration] = useState("12");
  const [currentSavings, setCurrentSavings] = useState("200000");
  const [debtCommitments, setDebtCommitments] = useState("10000");
  const [insuranceCoverage, setInsuranceCoverage] = useState("500000");
  const [insuranceActive, setInsuranceActive] = useState("Mutual Funds, Fixed Deposits");
  const [emergencyFundGoal, setEmergencyFundGoal] = useState("100000");

  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [activeComponent, setActiveComponent] = useState(null);
  const navigate = useNavigate();

  const formDataString = `Monthly Income: ${monthlyIncome}, Monthly Expenses: ${monthlyExpenses}, Savings Duration: ${savingsDuration}, Current Savings: ${currentSavings}, Total Debt Commitments: ${debtCommitments}, Insurance Coverage: ${insuranceCoverage}, Insurances Currently Active: ${insuranceActive}, Emergency Fund Goal: ${emergencyFundGoal}`;

  const handleSubmit = () => {
    if (
      !monthlyIncome || !monthlyExpenses || !savingsDuration || 
      !currentSavings || !debtCommitments || !insuranceCoverage || 
      !insuranceActive || !emergencyFundGoal
    ) {
      alert("Please Fill all the Fields Before Submitting.");
      return;
    }

    console.log("Form Submitted!", formDataString);
    setIsSubmitted(true);
  };

  const handleResubmit = () => {
    setIsSubmitted(false);
    setActiveComponent(null);
  };

  const handleHomeClick = () => {
    navigate("/Home");
  };

  return activeComponent === "Repo" ? (
    <Report onBack={() => setActiveComponent(null)} />
  ) : (
    <div className="fin-background">
      <div className="fin-container">
        <nav className="fin-navbar">
          <div className="navbar-content">
            <button className="fin-home-button" onClick={handleHomeClick}>
              Home
            </button>
          </div>
          <div className="navbar-buttons">
            <button className="fin-report-button" onClick={() => setActiveComponent("Repo")}>
              Reports
            </button>
          </div>
        </nav>

        <div className="fin-card">
          {isSubmitted ? (
            activeComponent === "ExCa" ? (
              <ExCa onBack={() => setActiveComponent(null)} data={formDataString} />
            ) : activeComponent === "PiPl" ? (
              <PiPl onBack={() => setActiveComponent(null)} data={formDataString} />
            ) : activeComponent === "EmFu" ? (
              <EmFu onBack={() => setActiveComponent(null)} data={formDataString} />
            ) : (
              <>
                <h1 className="fin-title">AI Generated Report</h1>
                <div className="fin-button-group">
                  <button className="fin-custom-button" onClick={() => setActiveComponent("ExCa")}>
                    Expense Categorization
                  </button>
                  <button className="fin-custom-button" onClick={() => setActiveComponent("PiPl")}>
                    Personalized Insurance Planning
                  </button>
                  <button className="fin-custom-button" onClick={() => setActiveComponent("EmFu")}>
                    Emergency Fund Recommendations
                  </button>
                </div>
                <button className="fin-submit-button" onClick={handleResubmit}>
                  Re-submit Details
                </button>
              </>
            )
          ) : (
            <>
              <h1 className="fin-title">AI Financial Management Recommendation System</h1>
              <div className="fin-form-grid">
                <input type="text" className="fin-form-input" placeholder="Enter Monthly Income" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
                <input type="text" className="fin-form-input" placeholder="Enter Monthly Essential Expenses" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} />
                <input type="text" className="fin-form-input" placeholder="Enter Target Savings Duration (in Years)" value={savingsDuration} onChange={(e) => setSavingsDuration(e.target.value)} />
                <input type="text" className="fin-form-input" placeholder="Enter Current Savings Amount" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} />
                <input type="text" className="fin-form-input" placeholder="Enter Debt or Loan Commitments" value={debtCommitments} onChange={(e) => setDebtCommitments(e.target.value)} />
                <input type="text" className="fin-form-input" placeholder="Enter Insurance Coverage (if any)" value={insuranceCoverage} onChange={(e) => setInsuranceCoverage(e.target.value)} />
                <input type="text" className="fin-form-input" placeholder="Enter Currently Active Insurances" value={insuranceActive} onChange={(e) => setInsuranceActive(e.target.value)} />
                <input type="text" className="fin-form-input" placeholder="Enter Emergency Fund Goal" value={emergencyFundGoal} onChange={(e) => setEmergencyFundGoal(e.target.value)} />
              </div>
              <button className="fin-submit-button" onClick={handleSubmit}>
                Submit Details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export default Fin;
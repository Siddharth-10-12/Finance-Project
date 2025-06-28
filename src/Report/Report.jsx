
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Report.css";

const Report = ({ onBack }) => {
  const [reports, setReports] = useState([]);
  const [expandedReport, setExpandedReport] = useState(null); // Track which report is expanded

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ai_responses"));
        const reportData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp) // Convert Firestore Timestamp
            };
          })
          .filter(report => report.response !== "Error: Unable to fetch response.")
          .sort((a, b) => b.timestamp - a.timestamp);

        setReports(reportData);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const formatText = (text) => {
    return text
      .replace(/\\(.?)\\*/g, "<strong>$1</strong><br/>") 
      .replace(/\*/g, "•") 
      .replace(/\n/g, "<br/>"); 
  };

  const toggleReport = (id) => {
    setExpandedReport(expandedReport === id ? null : id); // Toggle open/close
  };

  return (
    <div className="pw-app-container-repo">
      <nav className="pw-navbar">
        <div className="pw-navbar-content">
          <button className="pw-home-button">Home</button>
        </div>
        <button className="pw-report-button">Reports</button>
      </nav>

      <div className="pw-repo-container card">
        <div className="pw-show">
          <h5 className="pw-gradient-text-repo">Reports</h5>
        </div>

        <div className="pw-reports-container">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className={`pw-report-item ${expandedReport === report.id ? "pw-expanded" : ""}`} onClick={() => toggleReport(report.id)}>
                <div className="pw-report-header">
                  <p><b>Functionality:</b> {report.functionality}</p>
                  <p><b>Timestamp:</b> {report.timestamp.toLocaleString()}</p>
                </div>

                {expandedReport === report.id && (
                  <div className="pw-report-details">
                    <br/><p><strong>Response:</strong></p>
                    <p dangerouslySetInnerHTML={{ __html: formatText(report.response) }} /><br/>
                  </div>
                )}
              </div>

            ))
          ) : (
            <p style={{ color: "white", fontSize: "1.5rem" }}>No reports found.</p>
          )}
        </div>

        <div className="pw-button-container">
          <button className="pw-submit-button-repo" onClick={onBack}>
            Return to Main
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;


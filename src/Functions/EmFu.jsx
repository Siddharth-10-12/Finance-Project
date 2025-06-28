import React, { useState, useEffect } from "react";
import { db, collection, addDoc } from "../firebase";
import { askGemini } from "../api/gemini";  
import "./EmFu.css";

const formatResponse = (response) => {
  if (!response) return ""; 
  return response
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: black;">$1</strong>') 
    .replace(/\*/g, '•'); 
};

const EmFu = ({ onBack, data}) => {
  const [response, setResponse] = useState("Fetching response...");
  const [loading, setLoading] = useState(false);

  const predefinedQuestion = `Given ${data}, how should I allocate my savings over the next 12 months to build my emergency fund while also managing debt commitments of ₹10,000? Please suggest an optimal savings strategy.`; 

  const fetchAIResponse = async () => {
    setLoading(true);
    setResponse("Generating AI response...");

    try {
      const aiResponse = await askGemini(predefinedQuestion);            
      if (aiResponse) {
        setResponse(aiResponse);
        await saveResponseToFirestore("Emergency Fund Recommendation", aiResponse);
      } else {
        setResponse("No response received from AI.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setResponse("Error fetching response. Please try again.");
    }

    setLoading(false);
  };

  const saveResponseToFirestore = async (functionality, responseText) => {
    try {
      await addDoc(collection(db, "ai_responses"), {
        functionality,
        response: responseText,
        timestamp: new Date(),
      });
    console.log("Response saved to Firestore.");
    } catch (error) {
      console.error("Error saving response to Firestore:", error);
    }
  };

  useEffect(() => {
    fetchAIResponse();
  }, []);

  return (
    <div className="emfu-container">
      <h1 className="gradient-text-emfu">Emergency Fund Recommendation</h1>

      <div className="emfu-response-box">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          response &&
          response.split("\n").map((point, index) => (
            <p className="text" key={index} dangerouslySetInnerHTML={{ __html: formatResponse(point) }} />
          ))
        )}
      </div>

      <div className="button-container">
        <button className="submit-button-emfu" onClick={onBack}>
          Back to Report
        </button>
        <button className="submit-button-emfu" onClick={fetchAIResponse} disabled={loading}>
          {loading ? "Regenerating..." : "Regenerate Response"}
        </button>
      </div>
    </div>
  );
};

export default EmFu;

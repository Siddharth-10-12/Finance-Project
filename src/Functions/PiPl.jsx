import React, { useState, useEffect } from "react";
import { db, collection, addDoc } from "../firebase";
import { askGemini } from "../api/gemini"; 
import "./PiPl.css";

const formatResponse = (response) => {
  return response
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: black;">$1</strong>') 
    .replace(/(^|\s)\*(?=\s|$)/g, '$1•'); 
};

const PiPl = ({ onBack, data}) => {
  const [response, setResponse] = useState("Fetching response...");
  const [loading, setLoading] = useState(false);

  const predefinedQuestion = `Given ${data}, suggest the most suitable insurance plans (health, life, or others). Also, recommend how much I should allocate from my budget towards insurance while maintaining financial stability.`;

  const fetchAIResponse = async () => {
    setLoading(true);
    setResponse("Generating AI response...");

    try {
      const aiResponse = await askGemini(predefinedQuestion);      
      if (aiResponse) {
        setResponse(aiResponse);
        await saveResponseToFirestore("Personalalized Insurance Planning", aiResponse);
      } else {
        setResponse("No response received from AI.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setResponse("Failed to fetch AI response.");
    } finally {
      setLoading(false);
    }
  };

  const saveResponseToFirestore = async (functionality, responseText) => {
    try {
      await addDoc(collection(db, "ai_responses"), {
        functionality,
        response: responseText,
        timestamp: new Date(),
      });
      console.log("Response Saved to Firestore.");
    } catch (error) {
      console.error("Error Saving Response to Firestore:", error);
    }
  };

  useEffect(() => {
    fetchAIResponse();
  }, []);

  return (
    <div className="pipl-container">
      <h1 className="gradient-text-pipl">Personalized Insurance Planning</h1>
      <div className="pipl-response-box">
        {loading && <div className="loading-spinner">Loading...</div>}

        {!loading && (
          <div className="response-text">
            {response.split("\n").map((paragraph, index) => (
              <p key={index} dangerouslySetInnerHTML={{ __html: formatResponse(paragraph) }} />
            ))}
          </div>
        )}
      </div>


      <div className="button-container">
        <button className="submit-button-pipl" onClick={onBack}>
          Back to Report
        </button>
        <button className="submit-button-pipl" onClick={fetchAIResponse} disabled={loading}>
          {loading ? "Regenerating..." : "Regenerate Response"}
        </button>
      </div>
    </div>
  );
};

export default PiPl;

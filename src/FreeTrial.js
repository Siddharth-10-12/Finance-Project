import React from "react";
import { useNavigate } from "react-router-dom";
import "./FreeTrial.css"; // Import the new CSS file

const FreeTrial = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login"); // Navigate to the login page
  };

  const handleSignUp = () => {
    navigate("/signup"); // Navigate to the signup page
  };

  return (
    <div className="free-trial-page">
      <div className="free-trial-content">
        <h2>Sign up or Log in to enjoy the full experience</h2>
        <p>Please choose an option to continue.</p>
        <div className="free-trial-buttons">
          <button className="btn btn-primary" onClick={handleSignIn}>
            Sign In
          </button>
          <button className="btn btn-secondary" onClick={handleSignUp}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeTrial;
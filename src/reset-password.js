import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { confirmPasswordReset } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get("oobCode");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("Extracted oobCode:", oobCode); // Debugging step
    if (!oobCode) {
      setMessage("Invalid or expired reset link.");
    }
  }, [oobCode]);

  const handleResetPassword = async () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }
    
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Password reset successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/Login");
      }, 3000);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Reset Password</h2>
      {oobCode ? (
        <>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <br />
          <button onClick={handleResetPassword}>Reset Password</button>
        </>
      ) : (
        <p>Invalid or expired reset link.</p>
      )}
      <p>{message}</p>
    </div>
  );
};

export default ResetPassword;

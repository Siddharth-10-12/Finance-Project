import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { storeUserInFirestore } from "./firebase";
import "./Signup.css"; // Import the new CSS file

const quotes = [
  "“An investment in knowledge pays the best interest.” – Benjamin Franklin",
  "“Do not save what is left after spending, but spend what is left after saving.” – Warren Buffett",
  "“Financial freedom is available to those who learn about it and work for it.” – Robert Kiyosaki",
  "“Money grows on the tree of persistence.” – Japanese Proverb",
];

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = async () => {
    try {
      const userCreds = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCreds.user;

      // Store user in Firestore with name
      await storeUserInFirestore(user, name);

      // Set success message
      setSuccess("Account created successfully!");
      setError(null);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login", { state: { userName: name } }); // Redirect to login page
      }, 2000); // 2 seconds delay
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSuccess(null);
    }
  };

  return (
    <div className="signup-container">
      <div className="floating-money">💵</div>
      <div className="floating-money">💰</div>
      <div className="floating-money">💸</div>
      <div className="floating-bank">🏦</div>
      <div className="floating-stock">📈</div>
      <div className="rising-coins">🪙</div>
      <div className="rising-coins">🪙</div>
      <div className="rising-coins">🪙</div>

      <div className="signup-box">
        <div className="money-shape"></div>
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-quote">{quotes[quoteIndex]}</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="input-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="signup-input"
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signup-input"
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
          />
        </div>

        <button onClick={handleSignUp} className="login-button">Create Account</button>

        <p className="login-link">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="google-login-button">Sign In</button>
        </p>
      </div>

      <footer className="signup-footer">
        <p>© 2025 SmartFinance. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignUp;
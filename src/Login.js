import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { fetchUserData } from "./firebase";
import './Login.css';

const quotes = [
  "“An investment in knowledge pays the best interest.” – Benjamin Franklin",
  "“Do not save what is left after spending, but spend what is left after saving.” – Warren Buffett",
  "“Financial freedom is available to those who learn about it and work for it.” – Robert Kiyosaki",
  "“Money grows on the tree of persistence.” – Japanese Proverb",
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleEmailSignIn = async () => {
    try {
      const userCreds = await signInWithEmailAndPassword(auth, email, password);
      const user = userCreds.user;

      // Fetch user data from Firestore
      const userData = await fetchUserData(user.uid);
      if (userData) {
        setSuccess("Login successful!");
        setError(null);
        navigate("/home", { state: { userName: userData.name } });
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Try again or reset it.");
      } else {
        setError("Login failed. Please check your details and try again.");
      }
      setSuccess(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Fetch user data from Firestore
      const userData = await fetchUserData(user.uid);
      if (userData) {
        setSuccess("Login successful!");
        setError(null);
        navigate("/home", { state: { userName: userData.name } });
      }
    } catch (error) {
      setError("Unable to sign in with Google at the moment. Please try again.");
      setSuccess(null);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:3000/reset-password",
        handleCodeInApp: true,
      });
      setSuccess("Password reset email sent! Check your inbox.");
      setError(null);
    } catch (error) {
      setError("Error: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="floating-money">💵</div>
      <div className="floating-money">💰</div>
      <div className="floating-money">💸</div>
      <div className="floating-bank">🏦</div>
      <div className="floating-stock">📈</div>
      <div className="rising-coins">🪙</div>
      <div className="rising-coins">🪙</div>
      <div className="rising-coins">🪙</div>

      <div className="login-box">
        <div className="money-shape"></div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-quote">{quotes[quoteIndex]}</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="input-group">
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
        </div>

        <button onClick={handleEmailSignIn} className="login-button">Sign In</button>
        <button onClick={handleGoogleSignIn} className="google-login-button">Sign in with Google</button>

        {error && (error.includes("password") || error.includes("Login failed")) && (
          <p className="forgot-password">
            <button onClick={handleResetPassword} className="forgot-password-button">Forgot Password?</button>
          </p>
        )}

        <p className="signup-link">
          New user?{" "}
          <button onClick={() => navigate("/signup")} className="google-login-button">Sign Up</button>
        </p>
      </div>

      <footer className="login-footer">
        <p>© 2025 SmartFinance. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
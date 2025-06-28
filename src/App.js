import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import "./fonts.css";
import ResetPassword from "./reset-password";
import Home from "./Home";
import Sub from "./Sub";
import Home2 from "./Home2";
import FreeTrial from "./FreeTrial";
import Fin from "./fin";
import Exp from "./Exp";
import Bank from "./Bank";
// import Imp from "./Imp";
// import TaxProfile from "./TaxProfile";
import Admin from "./Admin"
import Kyc from "./kyc";

// import Report from "./Report";
import TaxProfile from "./TaxProfile"; // Import TaxProfile instead of FileUpload
// import Reports from "./Report"; // Import the Reports component
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Sub" element={<Sub />} />
        <Route path="/" element={<Home2 />} />
        <Route path="/free" element={<FreeTrial />} />
        <Route path="/fin" element={<Fin />} />
        <Route path="/exp" element={<Exp />} />
        <Route path="/tax-profile" element={<TaxProfile />} />
        <Route path="/bank" element={<Bank />} /> 
        <Route path="/admin" element={<Admin />} />
        <Route path="/kyc" element={<Kyc />} />
        {/* <Route path="/imp" element={<Imp />} /> */}
        
        {/* <Route path="/tax-profile" element={<TaxProfile />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> Add the Reports route */}
      </Routes>
    </Router>
  );
}

export default App;
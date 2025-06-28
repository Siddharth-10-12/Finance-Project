import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome to the Dashboard</h2>
      <button onClick={() => navigate("/")}>Logout</button>
    </div>
  );
};

export default Dashboard;

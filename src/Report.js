import { Pie, Line } from "react-chartjs-2";

const Reports = () => {
  const categoryData = {
    labels: ["Food", "Transport", "Bills", "Entertainment"],
    datasets: [
      {
        label: "Spending by Category",
        data: [300, 100, 200, 150],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const expenseData = {
    labels: ["January", "February", "March", "April"],
    datasets: [
      {
        label: "Monthly Expenses",
        data: [500, 700, 450, 600],
        borderColor: "#36A2EB",
        fill: false,
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Reports</h1>

      {/* Pie Chart: Spending by Category */}
      <div className="my-4">
        <h5>Spending by Category</h5>
        <Pie data={categoryData} />
      </div>

      {/* Line Chart: Monthly Expenses Over Time */}
      <div className="my-4">
        <h5>Monthly Expenses</h5>
        <Line data={expenseData} />
      </div>

      {/* Export Buttons */}
      {/* <button className="btn btn-secondary me-2" onClick={exportCSV}>
        Export CSV
      </button>
      <button className="btn btn-secondary" onClick={exportPDF}>
        Export PDF
      </button> */}

      {/* Link to go back to the main dashboard (optional) */}
      <a href="/home" className="btn btn-primary mt-3 d-block">
        Back to Dashboard
      </a>
    </div>
  );
};

export default Reports;
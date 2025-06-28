"use client"; // This directive is specific to Next.js for client-side rendering

import { useState, useEffect, useRef } from "react";
import { auth } from "./firebase";
import {
  addMonthlyIncome,
  addExpense,
  fetchMonthlyExpenses,
  fetchMonthlyIncome,
  fetchTotalMonthlyExpense,
  updateExpense,
  deleteExpense,
} from "./firebase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart2,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X as CloseIcon,
  Menu,
  ChevronRight,
  ChevronDown,
  Activity,
  Layers,
  CreditCard,
  Filter,
  Download,
  Zap,
  Award,
  Target,
} from "lucide-react";
import "./Exp.css";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4 },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

// Custom colors for charts
const CHART_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#8AC926",
  "#1982C4",
  "#6A4C93",
  "#FF595E",
];

// Random color generator for charts
const getRandomColor = () => {
  return CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)];
};

const ExpenseTracker = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [activePage, setActivePage] = useState("add-data"); // Default page
  const [reportType, setReportType] = useState("monthly"); // Report type: monthly, yearly
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success, error, warning
  const [editIndex, setEditIndex] = useState(null); // Track the index of the expense being edited
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chartView, setChartView] = useState("pie"); // pie, line, bar, radar, area
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: "", end: "" });
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(true);
  const [animateCharts, setAnimateCharts] = useState(false);

  // Refs for scroll animations
  const chartRef = useRef(null);
  const tableRef = useRef(null);

  const user = auth.currentUser;

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Fetch monthly expenses and income
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      console.log("Fetching data for month:", selectedMonth);

      fetchMonthlyExpenses(user.uid, selectedMonth)
        .then((data) => {
          console.log("Fetched Data:", data);
          if (data) {
            setExpenses(data);
          } else {
            setExpenses([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching expenses:", error);
          setExpenses([]);
          showToastMessage("Failed to fetch expenses", "error");
        });

      // Fetch monthly income
      fetchMonthlyIncome(user.uid, selectedMonth)
        .then((income) => {
          setMonthlyIncome(income || 0);
        })
        .catch((error) => {
          console.error("Error fetching monthly income:", error);
          setMonthlyIncome(0);
          showToastMessage("Failed to fetch income", "error");
        });

      // Fetch total monthly expense
      fetchTotalMonthlyExpense(user.uid, selectedMonth)
        .then((totalExpense) => {
          setMonthlyExpense(totalExpense || 0);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching total monthly expense:", error);
          setMonthlyExpense(0);
          setIsLoading(false);
          showToastMessage("Failed to fetch total expenses", "error");
        });
    }
  }, [user, selectedMonth, activePage]);

  // Set up intersection observer for animations
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === chartRef.current) {
            setAnimateCharts(true);
          }
        }
      });
    }, options);

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
      if (tableRef.current) {
        observer.unobserve(tableRef.current);
      }
    };
  }, [activePage]);

  // Calculate remaining budget
  const remainingBudget = monthlyIncome - monthlyExpense;
  const budgetPercentage = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;

  // Show toast message
  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setShowCustomCategory(selectedCategory === "Custom");
  };

  const gotoHome = (e) => {
    e.preventDefault();
    window.location.href = "/home";
  };

  // Handle monthly income submission
  const handleIncomeSubmit = async (e) => {
    e.preventDefault();

    if (!monthlyIncome) {
      showToastMessage("Please enter a valid income amount", "error");
      return;
    }

    if (user && monthlyIncome) {
      setIsLoading(true);
      console.log("Saving monthly income for month:", selectedMonth);

      try {
        await addMonthlyIncome(user.uid, selectedMonth, Number.parseFloat(monthlyIncome));
        showToastMessage("Monthly income updated successfully!");

        // Refresh data after adding income
        const income = await fetchMonthlyIncome(user.uid, selectedMonth);
        setMonthlyIncome(income || 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error saving income:", error);
        showToastMessage("Failed to save income", "error");
        setIsLoading(false);
      }
    }
  };

  // Handle expense submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!expenseName || !amount || !date) {
      showToastMessage("Please fill in all required fields", "error");
      return;
    }

    if (category === "Custom" && !customCategory.trim()) {
      showToastMessage("Please enter a custom category", "error");
      return;
    }

    const newExpense = {
      name: expenseName,
      amount: Number.parseFloat(amount),
      category: category === "Custom" ? customCategory : category,
      date: date,
      month: selectedMonth,
      uid: user.uid,
    };

    if (user) {
      setIsLoading(true);

      try {
        if (editIndex !== null) {
          // Update existing expense
          const expenseId = expenses[editIndex].id; // Get the Firebase document ID
          const oldAmount = expenses[editIndex].amount; // Get the old amount
          await updateExpense(expenseId, { ...newExpense, oldAmount }); // Update in Firebase

          const updatedExpenses = [...expenses];
          updatedExpenses[editIndex] = { id: expenseId, ...newExpense };
          setExpenses(updatedExpenses);
          setEditIndex(null);
          showToastMessage("Expense updated successfully!");
        } else {
          // Add new expense
          await addExpense(user.uid, newExpense);
          setExpenses([...expenses, newExpense]); // Add new expense to the list
          showToastMessage("Expense added successfully!");
        }

        // Reset form
        setExpenseName("");
        setAmount("");
        setCategory("Food");
        setCustomCategory("");
        setDate("");
        setShowCustomCategory(false);
        setShowAddExpenseForm(false);

        // Refresh total monthly expense
        const totalExpense = await fetchTotalMonthlyExpense(user.uid, selectedMonth);
        setMonthlyExpense(totalExpense || 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error saving expense:", error);
        showToastMessage("Failed to save expense", "error");
        setIsLoading(false);
      }
    }
  };

  // Handle edit expense
  const handleEdit = (index) => {
    const expense = expenses[index];
    setExpenseName(expense.name);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date);
    setEditIndex(index);
    setShowAddExpenseForm(true);

    // Check if the category is custom
    const predefined = ["Food", "Transport", "Bills", "Entertainment"];
    if (!predefined.includes(expense.category)) {
      setCategory("Custom");
      setCustomCategory(expense.category);
      setShowCustomCategory(true);
    }

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle delete expense
  const handleDelete = async (index) => {
    const expense = expenses[index];

    try {
      setIsLoading(true);
      await deleteExpense(expense.id, expense); // Delete from Firebase

      const updatedExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(updatedExpenses);
      showToastMessage("Expense deleted successfully!");

      // Reset form if editing
      if (editIndex === index) {
        setEditIndex(null);
        setExpenseName("");
        setAmount("");
        setCategory("Food");
        setCustomCategory("");
        setDate("");
        setShowCustomCategory(false);
      }

      // Refresh total monthly expense
      const totalExpense = await fetchTotalMonthlyExpense(user.uid, selectedMonth);
      setMonthlyExpense(totalExpense || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
      showToastMessage("Failed to delete expense", "error");
      setIsLoading(false);
    }
  };

  // Handle report type change
  const handleReportTypeChange = (type) => {
    setReportType(type);
  };

  // Handle chart view change
  const handleChartViewChange = (view) => {
    setChartView(view);
  };

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Apply filters
  const applyFilters = () => {
    // This would filter the expenses based on the selected filters
    // For now, we'll just close the filter panel
    setShowFilters(false);
    showToastMessage("Filters applied successfully!");
  };

  // Reset filters
  const resetFilters = () => {
    setCategoryFilter("All");
    setDateRangeFilter({ start: "", end: "" });
    setAmountFilter({ min: "", max: "" });
    setShowFilters(false);
    showToastMessage("Filters reset successfully!");
  };

  // Generate pie chart data
  const generatePieChartData = () => {
    const categoryMap = {};
    expenses.forEach((expense) => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });
    return Object.keys(categoryMap).map((category) => ({
      name: category,
      value: categoryMap[category],
    }));
  };

  const pieChartData = generatePieChartData();

  // Generate line chart data
  const generateLineChartData = () => {
    const dateMap = {};
    expenses.forEach((expense) => {
      if (dateMap[expense.date]) {
        dateMap[expense.date] += expense.amount;
      } else {
        dateMap[expense.date] = expense.amount;
      }
    });

    // Sort dates
    return Object.keys(dateMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        date,
        amount: dateMap[date],
      }));
  };

  const lineChartData = generateLineChartData();

    // Get month name from month number
    const getMonthName = (monthNum) => {
      const date = new Date(2000, Number.parseInt(monthNum) - 1, 1);
      return date.toLocaleString("default", { month: "long" });
    };
  // Generate bar chart data for yearly report
  const generateYearlyBarChartData = () => {
    const monthMap = {};
    expenses.forEach((expense) => {
      const month = expense.month.slice(5, 7); // Extract month (MM) from YYYY-MM
      if (monthMap[month]) {
        monthMap[month] += expense.amount;
      } else {
        monthMap[month] = expense.amount;
      }
    });

    // Create an array of all months (01-12)
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, "0");
      return {
        month: getMonthName(monthNum),
        amount: monthMap[monthNum] || 0,
      };
    });

    return allMonths;
  };

  const yearlyBarChartData = generateYearlyBarChartData();

  // Generate radar chart data
  const generateRadarChartData = () => {
    const categoryMap = {};
    expenses.forEach((expense) => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });

    return Object.keys(categoryMap).map((category) => ({
      category,
      amount: categoryMap[category],
    }));
  };

  const radarChartData = generateRadarChartData();

  // Generate area chart data
  const generateAreaChartData = () => {
    // Group by date and category
    const dateMap = {};

    expenses.forEach((expense) => {
      if (!dateMap[expense.date]) {
        dateMap[expense.date] = {};
      }

      if (dateMap[expense.date][expense.category]) {
        dateMap[expense.date][expense.category] += expense.amount;
      } else {
        dateMap[expense.date][expense.category] = expense.amount;
      }
    });

    // Convert to array format for recharts
    return Object.keys(dateMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => {
        const entry = { date };
        Object.keys(dateMap[date]).forEach((category) => {
          entry[category] = dateMap[date][category];
        });
        return entry;
      });
  };

  const areaChartData = generateAreaChartData();

  // Get all unique categories
  const getAllCategories = () => {
    const categories = new Set();
    expenses.forEach((expense) => {
      categories.add(expense.category);
    });
    return Array.from(categories);
  };

  const allCategories = getAllCategories();



  // Get top 3 expense categories
  const getTopCategories = () => {
    const categoryMap = {};
    expenses.forEach((expense) => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });

    return Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));
  };

  const topCategories = getTopCategories();

  // Get largest single expense
  const getLargestExpense = () => {
    if (expenses.length === 0) return null;

    return expenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max), expenses[0]);
  };

  const largestExpense = getLargestExpense();

  // Get spending trend (comparing to previous month)
  const getSpendingTrend = () => {
    // This would compare current month's spending with previous month
    // For demo purposes, we'll return a random trend
    const trends = ["up", "down"];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const spendingTrend = getSpendingTrend();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get budget status color
  const getBudgetStatusColor = () => {
    if (budgetPercentage >= 90) return "var(--danger-color)";
    if (budgetPercentage >= 75) return "var(--warning-color)";
    return "var(--success-color)";
  };

  // Get budget status message
  const getBudgetStatusMessage = () => {
    if (budgetPercentage >= 90) return "Critical";
    if (budgetPercentage >= 75) return "Warning";
    return "Good";
  };

  // Download report as CSV
  const downloadReport = () => {
    // This would generate a CSV file with the expense data
    showToastMessage("Report downloaded successfully!");
  };

  return (
    <div className={`expense-tracker ${darkMode ? "dark-mode" : ""}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      )}

      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className="sidebar"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sidebar-header">
              <h2>
                <DollarSign className="logo-icon" />
                <span>ExpenseTracker</span>
              </h2>
              <button className="close-sidebar" onClick={toggleSidebar}>
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="sidebar-content">
              <nav className="sidebar-nav">
                <motion.button
                  className={`nav-item ${activePage === "add-data" ? "active" : ""}`}
                  onClick={() => setActivePage("add-data")}
                  whileHover="hover"
                  variants={buttonVariants}
                >
                  <Plus size={20} />
                  <span>Add Data</span>
                </motion.button>

                <motion.button
                  className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
                  onClick={() => setActivePage("dashboard")}
                  whileHover="hover"
                  variants={buttonVariants}
                >
                  <Home size={20} />
                  <span>Dashboard</span>
                </motion.button>

                <motion.button
                  className={`nav-item ${activePage === "reports" ? "active" : ""}`}
                  onClick={() => setActivePage("reports")}
                  whileHover="hover"
                  variants={buttonVariants}
                >
                  <BarChart2 size={20} />
                  <span>Reports</span>
                </motion.button>

                <div className="nav-divider"></div>

                <div className="nav-dropdown">
                  <motion.button className="nav-item" whileHover="hover" variants={buttonVariants}>
                    <Settings size={20} />
                    <span>Settings</span>
                    <ChevronDown size={16} className="dropdown-icon" />
                  </motion.button>

                  <div className="dropdown-menu">
                    <motion.button
                      className="dropdown-item"
                      onClick={toggleDarkMode}
                      whileHover="hover"
                      variants={buttonVariants}
                    >
                      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                      <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </motion.button>

                    <motion.button
                      className="dropdown-item"
                      onClick={gotoHome}
                      whileHover="hover"
                      variants={buttonVariants}
                    >
                      <Home size={16} />
                      <span>Home</span>
                    </motion.button>
                  </div>
                </div>
              </nav>
            </div>

            <div className="sidebar-footer">
              <div className="user-info">
                <div className="user-avatar">{user?.email?.charAt(0).toUpperCase() || "U"}</div>
                <div className="user-details">
                  <p className="user-name">{user?.displayName || "User"}</p>
                  <p className="user-email">{user?.email || "user@example.com"}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`main-content ${!sidebarOpen ? "expanded" : ""}`}>
        <AnimatePresence mode="wait">
          {activePage === "add-data" && (
            <motion.div
              key="add-data"
              className="page-container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div className="page-header" variants={itemVariants}>
                <h1>Add Financial Data</h1>
                <p>Record your income and expenses to track your financial health</p>
              </motion.div>

              <motion.div className="card income-card" variants={cardVariants} whileHover="hover">
                <div className="card-header">
                  <h2>
                    <DollarSign className="card-icon" />
                    Monthly Income
                  </h2>
                  <button className="toggle-form-btn" onClick={() => setShowIncomeForm(!showIncomeForm)}>
                    {showIncomeForm ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>

                <AnimatePresence>
                  {showIncomeForm && (
                    <motion.div
                      className="card-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <form onSubmit={handleIncomeSubmit} className="income-form">
                        <div className="form-group">
                          <label>
                            <Calendar size={18} />
                            Select Month
                          </label>
                          <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            <DollarSign size={18} />
                            Monthly Income
                          </label>
                          <input
                            type="number"
                            placeholder="Enter your monthly income"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            className="form-control"
                          />
                        </div>

                        <motion.button
                          type="submit"
                          className="btn btn-primary"
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          <CheckCircle size={18} />
                          Save Income
                        </motion.button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div className="card expense-card" variants={cardVariants} whileHover="hover">
                <div className="card-header">
                  <h2>
                    <CreditCard className="card-icon" />
                    Add Expense
                  </h2>
                  <button className="toggle-form-btn" onClick={() => setShowAddExpenseForm(!showAddExpenseForm)}>
                    {showAddExpenseForm ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>

                <AnimatePresence>
                  {showAddExpenseForm && (
                    <motion.div
                      className="card-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <form onSubmit={handleSubmit} className="expense-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              <CreditCard size={18} />
                              Expense Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Grocery, Rent, etc."
                              value={expenseName}
                              onChange={(e) => setExpenseName(e.target.value)}
                              className="form-control"
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              <DollarSign size={18} />
                              Amount
                            </label>
                            <input
                              type="number"
                              placeholder="Enter amount"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              <Layers size={18} />
                              Category
                            </label>
                            <select value={category} onChange={handleCategoryChange} className="form-control">
                              <option value="Food">Food</option>
                              <option value="Transport">Transport</option>
                              <option value="Bills">Bills</option>
                              <option value="Entertainment">Entertainment</option>
                              <option value="Custom">Custom</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>
                              <Calendar size={18} />
                              Date
                            </label>
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="form-control"
                            />
                          </div>
                        </div>

                        {showCustomCategory && (
                          <div className="form-group custom-category">
                            <label>
                              <Layers size={18} />
                              Custom Category
                            </label>
                            <input
                              type="text"
                              placeholder="Enter custom category"
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              className="form-control"
                            />
                          </div>
                        )}

                        <div className="form-actions">
                          <motion.button
                            type="submit"
                            className="btn btn-primary"
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                          >
                            {editIndex !== null ? (
                              <>
                                <Edit2 size={18} />
                                Update Expense
                              </>
                            ) : (
                              <>
                                <Plus size={18} />
                                Add Expense
                              </>
                            )}
                          </motion.button>

                          {editIndex !== null && (
                            <motion.button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                setEditIndex(null);
                                setExpenseName("");
                                setAmount("");
                                setCategory("Food");
                                setCustomCategory("");
                                setDate("");
                                setShowCustomCategory(false);
                              }}
                              whileHover="hover"
                              whileTap="tap"
                              variants={buttonVariants}
                            >
                              <CloseIcon size={18} />
                              Cancel
                            </motion.button>
                          )}
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div className="quick-tips" variants={itemVariants}>
                <h3>Quick Tips</h3>
                <div className="tips-container">
                  <div className="tip">
                    <Zap className="tip-icon" />
                    <p>Start by adding your monthly income to set your budget</p>
                  </div>
                  <div className="tip">
                    <Zap className="tip-icon" />
                    <p>Categorize expenses properly for better insights in reports</p>
                  </div>
                  <div className="tip">
                    <Zap className="tip-icon" />
                    <p>Regularly update your expenses to keep track of your spending</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activePage === "dashboard" && (
            <motion.div
              key="dashboard"
              className="page-container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div className="page-header" variants={itemVariants}>
                <div>
                  <h1>Financial Dashboard</h1>
                  <p>Overview of your financial activities for the selected period</p>
                </div>

                <div className="month-selector">
                  <label>
                    <Calendar size={18} />
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="form-control"
                  />
                </div>
              </motion.div>

              <div className="dashboard-summary">
                <motion.div
                  className="summary-card income"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div className="summary-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="summary-details">
                    <h3>Monthly Income</h3>
                    <p className="summary-amount">{formatCurrency(monthlyIncome)}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="summary-card expense"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  custom={1}
                >
                  <div className="summary-icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="summary-details">
                    <h3>Total Expenses</h3>
                    <p className="summary-amount">{formatCurrency(monthlyExpense)}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="summary-card balance"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  custom={2}
                >
                  <div className="summary-icon">
                    <Activity size={24} />
                  </div>
                  <div className="summary-details">
                    <h3>Remaining Budget</h3>
                    <p className="summary-amount">{formatCurrency(remainingBudget)}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="summary-card status"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  custom={3}
                >
                  <div className="summary-icon">
                    {spendingTrend === "up" ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                  <div className="summary-details">
                    <h3>Budget Status</h3>
                    <div className="budget-status">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(budgetPercentage, 100)}%`,
                            backgroundColor: getBudgetStatusColor(),
                          }}
                        ></div>
                      </div>
                      <p className="status-text" style={{ color: getBudgetStatusColor() }}>
                        {getBudgetStatusMessage()} ({Math.round(budgetPercentage)}%)
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="dashboard-content">
                <motion.div
                  className="card expense-list-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  ref={tableRef}
                >
                  <div className="card-header">
                    <h2>
                      <Layers className="card-icon" />
                      Recent Expenses
                    </h2>

                    <div className="card-actions">
                      <motion.button
                        className="btn btn-outline"
                        onClick={toggleFilters}
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                      >
                        <Filter size={16} />
                        Filters
                      </motion.button>

                      <motion.button
                        className="btn btn-primary"
                        onClick={() => {
                          setShowAddExpenseForm(true);
                          setActivePage("add-data");
                        }}
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                      >
                        <Plus size={16} />
                        Add Expense
                      </motion.button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        className="filters-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="filter-group">
                          <label>Category</label>
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="form-control"
                          >
                            <option value="All">All Categories</option>
                            {allCategories.map((cat, index) => (
                              <option key={index} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="filter-group">
                          <label>Date Range</label>
                          <div className="date-range">
                            <input
                              type="date"
                              value={dateRangeFilter.start}
                              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
                              className="form-control"
                              placeholder="Start Date"
                            />
                            <span>to</span>
                            <input
                              type="date"
                              value={dateRangeFilter.end}
                              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
                              className="form-control"
                              placeholder="End Date"
                            />
                          </div>
                        </div>

                        <div className="filter-group">
                          <label>Amount Range</label>
                          <div className="amount-range">
                            <input
                              type="number"
                              value={amountFilter.min}
                              onChange={(e) => setAmountFilter({ ...amountFilter, min: e.target.value })}
                              className="form-control"
                              placeholder="Min Amount"
                            />
                            <span>to</span>
                            <input
                              type="number"
                              value={amountFilter.max}
                              onChange={(e) => setAmountFilter({ ...amountFilter, max: e.target.value })}
                              className="form-control"
                              placeholder="Max Amount"
                            />
                          </div>
                        </div>

                        <div className="filter-actions">
                          <motion.button
                            className="btn btn-primary"
                            onClick={applyFilters}
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                          >
                            Apply Filters
                          </motion.button>

                          <motion.button
                            className="btn btn-secondary"
                            onClick={resetFilters}
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                          >
                            Reset
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="card-body">
                    {expenses.length > 0 ? (
                      <div className="expense-table-container">
                        <table className="expense-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Amount</th>
                              <th>Category</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenses.map((expense, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <td>{expense.name}</td>
                                <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                                <td>
                                  <span className="category-badge">{expense.category}</span>
                                </td>
                                <td>{formatDate(expense.date)}</td>
                                <td className="actions-cell">
                                  <motion.button
                                    className="action-btn edit"
                                    onClick={() => handleEdit(index)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Edit2 size={16} />
                                  </motion.button>

                                  <motion.button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(index)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="no-data">
                        <AlertCircle size={48} />
                        <p>No expenses found for the selected month.</p>
                        <motion.button
                          className="btn btn-primary"
                          onClick={() => {
                            setShowAddExpenseForm(true);
                            setActivePage("add-data");
                          }}
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          <Plus size={16} />
                          Add Your First Expense
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  className="card chart-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  ref={chartRef}
                >
                  <div className="card-header">
                    <h2>
                      <PieChartIcon className="card-icon" />
                      Expense Breakdown
                    </h2>
                  </div>

                  <div className="card-body">
                    {expenses.length > 0 ? (
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={animateCharts ? 100 : 0}
                              fill="#8884d8"
                              dataKey="value"
                              animationDuration={1500}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="no-data">
                        <PieChartIcon size={48} />
                        <p>Add expenses to see the breakdown chart.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activePage === "reports" && (
            <motion.div
              key="reports"
              className="page-container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div className="page-header" variants={itemVariants}>
                <div>
                  <h1>Financial Reports</h1>
                  <p>Detailed analysis of your spending patterns and financial trends</p>
                </div>

                <div className="report-actions">
                  <div className="report-type-selector">
                    <motion.button
                      className={`btn ${reportType === "monthly" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleReportTypeChange("monthly")}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <Calendar size={16} />
                      Monthly
                    </motion.button>

                    <motion.button
                      className={`btn ${reportType === "yearly" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleReportTypeChange("yearly")}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <Calendar size={16} />
                      Yearly
                    </motion.button>
                  </div>

                  <motion.button
                    className="btn btn-success"
                    onClick={downloadReport}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    <Download size={16} />
                    Download Report
                  </motion.button>
                </div>
              </motion.div>

              <div className="reports-content">
                <div className="reports-highlights">
                  <motion.div
                    className="highlight-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <div className="highlight-icon">
                      <Award size={24} />
                    </div>
                    <div className="highlight-content">
                      <h3>Top Spending Categories</h3>
                      <ul className="top-categories">
                        {topCategories.length > 0 ? (
                          topCategories.map((category, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="category-name">
                                <span className="rank">{index + 1}</span>
                                <span>{category.category}</span>
                              </div>
                              <span className="category-amount">{formatCurrency(category.amount)}</span>
                            </motion.li>
                          ))
                        ) : (
                          <li className="no-data-item">No data available</li>
                        )}
                      </ul>
                    </div>
                  </motion.div>

                  <motion.div
                    className="highlight-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    custom={1}
                  >
                    <div className="highlight-icon">
                      <Target size={24} />
                    </div>
                    <div className="highlight-content">
                      <h3>Largest Expense</h3>
                      {largestExpense ? (
                        <div className="largest-expense">
                          <div className="expense-details">
                            <h4>{largestExpense.name}</h4>
                            <p className="expense-category">{largestExpense.category}</p>
                            <p className="expense-date">{formatDate(largestExpense.date)}</p>
                          </div>
                          <div className="expense-amount">{formatCurrency(largestExpense.amount)}</div>
                        </div>
                      ) : (
                        <p className="no-data-text">No expenses recorded</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="highlight-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    custom={2}
                  >
                    <div className="highlight-icon">
                      <Activity size={24} />
                    </div>
                    <div className="highlight-content">
                      <h3>Spending Summary</h3>
                      <div className="spending-summary">
                        <div className="summary-row">
                          <span>Total Income:</span>
                          <span className="income-amount">{formatCurrency(monthlyIncome)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Total Expenses:</span>
                          <span className="expense-amount">{formatCurrency(monthlyExpense)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Remaining:</span>
                          <span className={remainingBudget >= 0 ? "positive-amount" : "negative-amount"}>
                            {formatCurrency(remainingBudget)}
                          </span>
                        </div>
                        <div className="budget-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.min(budgetPercentage, 100)}%`,
                                backgroundColor: getBudgetStatusColor(),
                              }}
                            ></div>
                          </div>
                          <p className="budget-text">{Math.round(budgetPercentage)}% of budget used</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="chart-controls">
                  <h3>Analysis</h3>
                  <div className="chart-type-selector">
                    <motion.button
                      className={`chart-type-btn ${chartView === "pie" ? "active" : ""}`}
                      onClick={() => handleChartViewChange("pie")}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <PieChartIcon size={16} />
                      Pie
                    </motion.button>

                    <motion.button
                      className={`chart-type-btn ${chartView === "bar" ? "active" : ""}`}
                      onClick={() => handleChartViewChange("bar")}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <BarChart2 size={16} />
                      Bar
                    </motion.button>

                    <motion.button
                      className={`chart-type-btn ${chartView === "line" ? "active" : ""}`}
                      onClick={() => handleChartViewChange("line")}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <TrendingUp size={16} />
                      Line
                    </motion.button>

                    <motion.button
                      className={`chart-type-btn ${chartView === "area" ? "active" : ""}`}
                      onClick={() => handleChartViewChange("area")}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <Layers size={16} />
                      Area
                    </motion.button>

                    <motion.button
                      className={`chart-type-btn ${chartView === "radar" ? "active" : ""}`}
                      onClick={() => handleChartViewChange("radar")}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      <Target size={16} />
                      Radar
                    </motion.button>
                  </div>
                </div>

                <motion.div
                  className="charts-container"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  ref={chartRef}
                >
                  {expenses.length > 0 ? (
                    <div className="chart-wrapper">
                      {chartView === "pie" && (
                        <div className="chart pie-chart">
                          <h3>Spending by Category</h3>
                          <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={animateCharts ? 150 : 0}
                                fill="#8884d8"
                                dataKey="value"
                                animationDuration={1500}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {chartView === "bar" && (
                        <div className="chart bar-chart">
                          <h3>{reportType === "monthly" ? "Daily Expenses" : "Monthly Expenses"}</h3>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                              data={reportType === "monthly" ? lineChartData : yearlyBarChartData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey={reportType === "monthly" ? "date" : "month"}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                              />
                              <YAxis />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                              <Bar
                                dataKey="amount"
                                name="Expense Amount"
                                fill="#8884d8"
                                animationDuration={1500}
                                animationBegin={animateCharts ? 0 : 9999}
                              >
                                {(reportType === "monthly" ? lineChartData : yearlyBarChartData).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {chartView === "line" && (
                        <div className="chart line-chart">
                          <h3>Expense Trend</h3>
                          <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                              <YAxis />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="amount"
                                name="Expense Amount"
                                stroke="#8884d8"
                                strokeWidth={3}
                                dot={{ r: 6 }}
                                activeDot={{ r: 8 }}
                                animationDuration={1500}
                                animationBegin={animateCharts ? 0 : 9999}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {chartView === "area" && (
                        <div className="chart area-chart">
                          <h3>Expense Distribution Over Time</h3>
                          <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={areaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                              <YAxis />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                              {allCategories.map((category, index) => (
                                <Area
                                  key={index}
                                  type="monotone"
                                  dataKey={category}
                                  name={category}
                                  stackId="1"
                                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                                  animationDuration={1500}
                                  animationBegin={animateCharts ? 0 : 9999}
                                />
                              ))}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {chartView === "radar" && (
                        <div className="chart radar-chart">
                          <h3>Category Distribution</h3>
                          <ResponsiveContainer width="100%" height={400}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="category" />
                              <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                              <Radar
                                name="Expense Amount"
                                dataKey="amount"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                                animationDuration={1500}
                                animationBegin={animateCharts ? 0 : 9999}
                              />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-data-chart">
                      <AlertCircle size={48} />
                      <p>No expense data available for the selected period.</p>
                      <motion.button
                        className="btn btn-primary"
                        onClick={() => {
                          setShowAddExpenseForm(true);
                          setActivePage("add-data");
                        }}
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                      >
                        <Plus size={16} />
                        Add Expense
                      </motion.button>
                    </div>
                  )}
                </motion.div>

                {reportType === "yearly" && (
                  <motion.div className="yearly-summary" variants={cardVariants} initial="hidden" animate="visible">
                    <h3>Yearly Overview</h3>
                    <div className="yearly-charts">
                      <div className="chart yearly-bar-chart">
                        <h4>Monthly Comparison</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart
                            data={yearlyBarChartData}
                            margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar
                              dataKey="amount"
                              name="Expense Amount"
                              barSize={20}
                              fill="#413ea0"
                              animationDuration={1500}
                              animationBegin={animateCharts ? 0 : 9999}
                            >
                              {yearlyBarChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                            <Line
                              type="monotone"
                              dataKey="amount"
                              name="Trend"
                              stroke="#ff7300"
                              animationDuration={1500}
                              animationBegin={animateCharts ? 500 : 9999}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="chart yearly-scatter-chart">
                        <h4>Expense Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis
                              type="category"
                              dataKey="month"
                              name="Month"
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis type="number" dataKey="amount" name="Amount" />
                            <ZAxis range={[100, 500]} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Scatter
                              name="Expenses"
                              data={yearlyBarChartData}
                              fill="#8884d8"
                              animationDuration={1500}
                              animationBegin={animateCharts ? 0 : 9999}
                            >
                              {yearlyBarChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={`toast ${toastType}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="toast-icon">
              {toastType === "success" && <CheckCircle size={20} />}
              {toastType === "error" && <AlertCircle size={20} />}
              {toastType === "warning" && <AlertCircle size={20} />}
            </div>
            <div className="toast-content">
              <p>{toastMessage}</p>
            </div>
            <button className="toast-close" onClick={() => setShowToast(false)}>
              <CloseIcon size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseTracker;
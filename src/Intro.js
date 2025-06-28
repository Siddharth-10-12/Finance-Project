import React from "react";
import {
  BarChart3,
  Calculator,
  CreditCard,
  Facebook,
  Goal,
  LinkedinIcon,
  PieChart,
  Settings,
  Twitter,
  TrendingUp,
  Wallet,
  LineChart,
  DollarSign,
} from "lucide-react";

function Intro() {
  const IconComponents = [TrendingUp, Wallet, LineChart, DollarSign];

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <header className="position-relative min-vh-100 d-flex align-items-center justify-content-center overflow-hidden bg-primary">
        {/* Animated background elements */}
        <div className="position-absolute inset-0 overflow-hidden">
          <div className="position-absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => {
              const IconComponent =
                IconComponents[Math.floor(Math.random() * IconComponents.length)];
              return (
                <div
                  key={i}
                  className="position-absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${10 + Math.random() * 10}s linear infinite`,
                    animationDelay: `${-Math.random() * 10}s`,
                  }}
                >
                  <IconComponent
                    size={20 + Math.floor(Math.random() * 40)}
                    className="text-white opacity-30"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Main hero content */}
        <div className="position-relative container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 text-white">
              <div className="d-inline-block mb-4">
                <span className="badge bg-indigo-500 bg-opacity-20 text-indigo-200 border border-indigo-400 rounded-pill">
                  <span className="animate-pulse me-2">●</span>
                  Smart Financial Platform
                </span>
              </div>
              <h1 className="display-4 fw-bold mb-4">
                Master Your Money,
                <br />
                Shape Your Future
              </h1>
              <p className="lead mb-4">
                Experience the next generation of financial management. Powered by AI, driven by your success.
              </p>
              <div className="d-flex gap-3">
                <button className="btn btn-light btn-lg px-5 py-3">
                  Start Free Trial
                </button>
                <button className="btn btn-outline-light btn-lg px-5 py-3">
                  Watch Demo
                </button>
              </div>
              <div className="mt-5 pt-4 border-top border-white border-opacity-10">
                <div className="row">
                  <div className="col">
                    <div className="display-6 fw-bold">50K+</div>
                    <div className="text-indigo-200">Active Users</div>
                  </div>
                  <div className="col">
                    <div className="display-6 fw-bold">$2.5M</div>
                    <div className="text-indigo-200">Managed Daily</div>
                  </div>
                  <div className="col">
                    <div className="display-6 fw-bold">98%</div>
                    <div className="text-indigo-200">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 position-relative">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-4 border border-white border-opacity-10 shadow-lg">
                <div className="position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <div className="text-muted">Total Balance</div>
                      <div className="h2 fw-bold text-white">$84,250.00</div>
                    </div>
                    <div className="d-flex gap-2">
                      {[Wallet, BarChart3, Settings].map((Icon, i) => (
                        <button
                          key={i}
                          className="btn btn-outline-light btn-sm"
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-4">
                    <div className="position-relative h-100">
                      {/* Simulated chart bars */}
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="position-absolute bottom-0 bg-indigo-400 rounded-top"
                          style={{
                            left: `${i * 8.33}%`,
                            width: "6%",
                            height: `${30 + Math.random() * 70}%`,
                            opacity: 0.5 + Math.random() * 0.5,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col">
                      <div className="bg-white bg-opacity-10 rounded-lg p-3">
                        <div className="text-muted">Income</div>
                        <div className="h4 fw-bold text-white">+$12,400</div>
                        <div className="text-success">+8.2%</div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="bg-white bg-opacity-10 rounded-lg p-3">
                        <div className="text-muted">Expenses</div>
                        <div className="h4 fw-bold text-white">-$4,850</div>
                        <div className="text-danger">-2.4%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center mb-5">Empower Your Financial Journey</h2>
          <div className="row g-4">
            {[
              { icon: <PieChart className="w-8 h-8" />, title: 'Expense Tracking', description: 'Monitor your spending habits in real-time' },
              { icon: <Goal className="w-8 h-8" />, title: 'Goal Setting', description: 'Set and achieve your financial milestones' },
              { icon: <Calculator className="w-8 h-8" />, title: 'Tax Optimization', description: 'Maximize your tax savings effortlessly' },
              { icon: <CreditCard className="w-8 h-8" />, title: 'Loan Management', description: 'Manage all your loans in one place' },
            ].map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="text-primary mb-3">{feature.icon}</div>
                    <h3 className="card-title">{feature.title}</h3>
                    <p className="card-text">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <h5>Company</h5>
              <ul className="list-unstyled">
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("About Us clicked")}>
                    About Us
                  </button>
                </li>
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Careers clicked")}>
                    Careers
                  </button>
                </li>
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Contact clicked")}>
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <h5>Legal</h5>
              <ul className="list-unstyled">
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Privacy Policy clicked")}>
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Terms of Service clicked")}>
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Security clicked")}>
                    Security
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <h5>Resources</h5>
              <ul className="list-unstyled">
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Blog clicked")}>
                    Blog
                  </button>
                </li>
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Help Center clicked")}>
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="btn btn-link text-white text-decoration-none p-0" onClick={() => alert("Documentation clicked")}>
                    Documentation
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <h5>Connect</h5>
              <div className="d-flex gap-3">
                <button className="btn btn-link text-white p-0" onClick={() => alert("Facebook clicked")}>
                  <Facebook className="w-6 h-6" />
                </button>
                <button className="btn btn-link text-white p-0" onClick={() => alert("Twitter clicked")}>
                  <Twitter className="w-6 h-6" />
                </button>
                <button className="btn btn-link text-white p-0" onClick={() => alert("LinkedIn clicked")}>
                  <LinkedinIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p>&copy; {new Date().getFullYear()} Smart Financial Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Intro;
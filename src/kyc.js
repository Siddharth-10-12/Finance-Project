"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Accordion, Table } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import "./kyc.css"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const KycpApplication = () => {
  const [applicationData, setApplicationData] = useState({
    applicationId: "KYC-2023-78945",
    status: "Open",
    createdDate: "2023-04-15",
    lastUpdated: "2023-04-25",
    applicantName: "John Smith",
    applicantEmail: "john.smith@example.com",
    applicantPhone: "+1 (555) 123-4567",
    completionPercentage: 65,
    riskScore: "Medium",
    verificationSteps: [
      { id: 1, name: "Identity Verification", status: "Completed", date: "2023-04-16" },
      { id: 2, name: "Address Verification", status: "Completed", date: "2023-04-18" },
      { id: 3, name: "Document Verification", status: "In Progress", date: null },
      { id: 4, name: "Background Check", status: "Pending", date: null },
      { id: 5, name: "Risk Assessment", status: "Pending", date: null },
    ],
    documents: [
      { id: 1, name: "Passport", status: "Verified", uploadDate: "2023-04-16" },
      { id: 2, name: "Utility Bill", status: "Verified", uploadDate: "2023-04-18" },
      { id: 3, name: "Bank Statement", status: "Under Review", uploadDate: "2023-04-20" },
      { id: 4, name: "Tax ID", status: "Not Uploaded", uploadDate: null },
    ],
    notes: [
      { id: 1, text: "Initial application received", date: "2023-04-15", author: "System" },
      { id: 2, text: "Identity documents verified successfully", date: "2023-04-16", author: "KYC Agent" },
      { id: 3, text: "Address verification completed", date: "2023-04-18", author: "KYC Agent" },
      { id: 4, text: "Requested additional information for bank statement", date: "2023-04-22", author: "KYC Agent" },
    ],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [activeAnimation, setActiveAnimation] = useState(false)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false)
      setActiveAnimation(true)
    }, 1500)

    // Trigger animations periodically
    const animationInterval = setInterval(() => {
      setActiveAnimation((prev) => !prev)
    }, 10000)

    return () => clearInterval(animationInterval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "primary"
      case "In Progress":
        return "info"
      case "Completed":
        return "success"
      case "Verified":
        return "success"
      case "Under Review":
        return "warning"
      case "Pending":
        return "secondary"
      case "Not Uploaded":
        return "danger"
      default:
        return "secondary"
    }
  }

  const pieChartData = {
    labels: ["Completed", "In Progress", "Pending"],
    datasets: [
      {
        data: [2, 1, 2],
        backgroundColor: ["rgba(75, 192, 192, 0.8)", "rgba(255, 206, 86, 0.8)", "rgba(201, 203, 207, 0.8)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(201, 203, 207, 1)"],
        borderWidth: 1,
      },
    ],
  }

  const barChartData = {
    labels: ["Identity", "Address", "Documents", "Background", "Risk"],
    datasets: [
      {
        label: "Verification Progress",
        data: [100, 100, 60, 0, 0],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(201, 203, 207, 0.8)",
          "rgba(201, 203, 207, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(201, 203, 207, 1)",
          "rgba(201, 203, 207, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="mt-3 loading-text">Loading KYCP Application...</h3>
      </div>
    )
  }

  return (
    <Container fluid className="kycp-container py-4">
      <div className={`floating-particles ${activeAnimation ? "active" : ""}`}></div>

      <Row className="header-section mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="logo-container me-3">
                <div className="logo-circle">
                  <span>KYC</span>
                </div>
              </div>
              <div>
                <h1 className="app-title">KYCP Application Dashboard</h1>
                <p className="text-muted">Manage and track customer verification process</p>
              </div>
            </div>
            <div>
              <Button variant="outline-primary" className="me-2 action-button">
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
              </Button>
              <Button variant="primary" className="action-button">
                <i className="bi bi-pencil-square me-1"></i> Edit Application
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="application-card animate-in">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Application Details</h2>
              <Badge bg={getStatusColor(applicationData.status)} className="status-badge">
                {applicationData.status}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Application ID:</span>
                    <span className="detail-value highlight-text">{applicationData.applicationId}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Created Date:</span>
                    <span className="detail-value">{applicationData.createdDate}</span>
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Applicant Name:</span>
                    <span className="detail-value">{applicationData.applicantName}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{applicationData.lastUpdated}</span>
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{applicationData.applicantEmail}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{applicationData.applicantPhone}</span>
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Risk Score:</span>
                    <span className={`detail-value risk-${applicationData.riskScore.toLowerCase()}`}>
                      {applicationData.riskScore}
                    </span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <span className="detail-label">Completion:</span>
                    <div className="progress-container">
                      <ProgressBar
                        now={applicationData.completionPercentage}
                        label={`${applicationData.completionPercentage}%`}
                        variant="success"
                        className="animated-progress"
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card animate-in-delayed">
            <Card.Header>
              <h2 className="mb-0">Verification Summary</h2>
            </Card.Header>
            <Card.Body>
              <div className="chart-container mb-3">
                <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div className="d-flex justify-content-around summary-stats">
                <div className="stat-item completed">
                  <div className="stat-value">2</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-item in-progress">
                  <div className="stat-value">1</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-item pending">
                  <div className="stat-value">2</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="verification-card animate-in">
            <Card.Header>
              <h2 className="mb-0">Verification Progress</h2>
            </Card.Header>
            <Card.Body>
              <div className="verification-timeline">
                {applicationData.verificationSteps.map((step, index) => (
                  <div key={step.id} className={`timeline-item ${step.status.replace(/\s+/g, "-").toLowerCase()}`}>
                    <div className="timeline-marker">
                      <div className="marker-circle"></div>
                      {index < applicationData.verificationSteps.length - 1 && <div className="marker-line"></div>}
                    </div>
                    <div className="timeline-content">
                      <h4>{step.name}</h4>
                      <Badge bg={getStatusColor(step.status)}>{step.status}</Badge>
                      {step.date && <div className="timeline-date">{step.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-container mt-4">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="documents-card animate-in">
            <Card.Header>
              <h2 className="mb-0">Documents</h2>
            </Card.Header>
            <Card.Body>
              <Table responsive className="document-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationData.documents.map((doc) => (
                    <tr key={doc.id} className={`document-row ${doc.status.replace(/\s+/g, "-").toLowerCase()}`}>
                      <td>{doc.name}</td>
                      <td>
                        <Badge bg={getStatusColor(doc.status)}>{doc.status}</Badge>
                      </td>
                      <td>{doc.uploadDate || "N/A"}</td>
                      <td>
                        {doc.status !== "Not Uploaded" ? (
                          <Button variant="outline-primary" size="sm" className="action-button-sm">
                            <i className="bi bi-eye-fill"></i> View
                          </Button>
                        ) : (
                          <Button variant="outline-success" size="sm" className="action-button-sm">
                            <i className="bi bi-upload"></i> Upload
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="notes-card animate-in-delayed">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Notes & Activity</h2>
              <Button variant="outline-primary" size="sm" className="action-button-sm">
                <i className="bi bi-plus-circle"></i> Add Note
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="notes-container">
                {applicationData.notes.map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <span className="note-author">{note.author}</span>
                      <span className="note-date">{note.date}</span>
                    </div>
                    <div className="note-text">{note.text}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="actions-card animate-in">
            <Card.Header>
              <h2 className="mb-0">Actions</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="action-box approve">
                    <div className="action-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h4>Approve Application</h4>
                    <p>Verify and approve this customer application</p>
                    <Button variant="success" className="w-100">
                      Approve
                    </Button>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="action-box request">
                    <div className="action-icon">
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <h4>Request Information</h4>
                    <p>Request additional information from applicant</p>
                    <Button variant="warning" className="w-100">
                      Request Info
                    </Button>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="action-box reject">
                    <div className="action-icon">
                      <i className="bi bi-x-circle-fill"></i>
                    </div>
                    <h4>Reject Application</h4>
                    <p>Reject this application with reason</p>
                    <Button variant="danger" className="w-100">
                      Reject
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Accordion className="faq-section animate-in">
            <Accordion.Item eventKey="0">
              <Accordion.Header>What is the KYCP process?</Accordion.Header>
              <Accordion.Body>
                The Know Your Customer Process (KYCP) is a mandatory process of identifying and verifying the identity
                of clients. This process helps ensure compliance with anti-money laundering (AML) and counter-terrorist
                financing (CTF) regulations.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>How long does verification typically take?</Accordion.Header>
              <Accordion.Body>
                Verification typically takes 1-3 business days once all required documents have been submitted. Complex
                cases or applications requiring additional verification may take longer.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>What documents are required for verification?</Accordion.Header>
              <Accordion.Body>
                Standard required documents include government-issued photo ID (passport, driver's license), proof of
                address (utility bill, bank statement), and sometimes additional documents depending on the account type
                and risk level.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      <footer className="mt-4 text-center">
        <p>
          © 2023 KYCP Application System | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
        </p>
      </footer>
    </Container>
  )
}

export default KycpApplication

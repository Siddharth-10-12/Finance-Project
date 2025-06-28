"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  auth, 
  fetchAllLoanApplications, 
  fetchAllUploadedDocuments, 
  verifyDocument, 
  updateLoanApplicationStatus,
  approveLoanApplication 
} from "./firebase"
import { CheckCircle, AlertCircle, FileText, Search, Filter, Eye, ChevronDown, ChevronUp, X, Download, User, Mail, Clock, DollarSign, Home, Car, Briefcase, BookOpen, Loader2, RefreshCw, LogOut } from 'lucide-react'
import "./admin.css"

const Admin = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterLoanType, setFilterLoanType] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [verificationNote, setVerificationNote] = useState("")
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser
    //   if (!user) {
    //     // Redirect to login if not authenticated
    //     navigate("/login")
    //     return
    //   }
    console.log("User:", user)

      try {
        await loadData()
      } catch (error) {
        console.error("Error checking admin status:", error)
        navigate("/")
      }
    }

    checkAdmin()
  }, [auth])

  const loadData = async () => {
    setLoading(true)
    try {
      const allApplications = await fetchAllLoanApplications()
      const allDocuments = await fetchAllUploadedDocuments()

      // Merge documents with applications for easier access
      const appsWithDocs = allApplications.map((app) => {
        const userDocs = allDocuments.filter((doc) => doc.uid === app.uid)
        return { ...app, documents: userDocs }
      })

      setApplications(appsWithDocs)
      setDocuments(allDocuments)
    } catch (error) {
      console.error("Error loading data:", error)
      showNotification("Failed to load data. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
  }

  const handleLoanTypeFilterChange = (e) => {
    setFilterLoanType(e.target.value)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
  }

  const viewDocument = (document) => {
    setSelectedDocument(document)
    setVerificationNote(document.verificationNote || "")
    setShowDocumentModal(true)
  }

  const handleVerifyDocument = async () => {
    if (!selectedDocument) return

    setActionLoading(true)
    try {
      await verifyDocument(selectedDocument.id, {
        status: "Verified",
        verifiedBy: auth.currentUser.email,
        verificationDate: new Date().toISOString(),
        verificationNote: verificationNote,
      })

      // Update local state
      const updatedDocuments = documents.map((doc) =>
        doc.id === selectedDocument.id ? { ...doc, status: "Verified", isVerified: 1, verificationNote } : doc
      )
      setDocuments(updatedDocuments)

      const updateAppDocStatus = async () =>{

      }


      // Update applications state
      const updatedApplications = applications.map((app) => {
        if (app.uid === selectedDocument.uid) {
          const updatedAppDocs = app.documents.map((doc) =>
            doc.id === selectedDocument.id ? { ...doc, status: "Verified", isVerified: 1, verificationNote } : doc
          )

          // Check if all documents are verified
          const allVerified = updatedAppDocs.every((doc) => doc.status === "Verified")
          const newStatus = allVerified ? "Documents Verified" : app.status
          const newProgress = allVerified ? 30 : app.progress

          return {
            ...app,
            documents: updatedAppDocs,
            status: newStatus,
            progress: newProgress,
          }
        }
        return app
      })

      setApplications(updatedApplications)

      // Close modal and show success message
      setShowDocumentModal(false)
      showNotification("Document verified successfully!", "success")
    } catch (error) {
      console.error("Error verifying document:", error)
      showNotification("Failed to verify document. Please try again.", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectDocument = async () => {
    if (!selectedDocument) return

    setActionLoading(true)
    try {
      await verifyDocument(selectedDocument.id, {
        status: "Rejected",
        verifiedBy: auth.currentUser.email,
        verificationDate: new Date().toISOString(),
        verificationNote: verificationNote,
      })

      // Update local state
      const updatedDocuments = documents.map((doc) =>
        doc.id === selectedDocument.id ? { ...doc, status: "Rejected", verificationNote } : doc
      )
      setDocuments(updatedDocuments)

      // Update applications state
      const updatedApplications = applications.map((app) => {
        if (app.uid === selectedDocument.uid) {
          const updatedAppDocs = app.documents.map((doc) =>
            doc.id === selectedDocument.id ? { ...doc, status: "Rejected", verificationNote } : doc
          )

          return {
            ...app,
            documents: updatedAppDocs,
            status: "Documents Rejected",
            progress: 10,
          }
        }
        return app
      })

      setApplications(updatedApplications)

      // Close modal and show success message
      setShowDocumentModal(false)
      showNotification("Document rejected successfully!", "success")
    } catch (error) {
      console.error("Error rejecting document:", error)
      showNotification("Failed to reject document. Please try again.", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveApplication = async () => {
    if (!selectedApplication) return

    setActionLoading(true)
    try {
      await approveLoanApplication(selectedApplication.id)

      // Update local state
      const updatedApplications = applications.map((app) =>
        app.id === selectedApplication.id
          ? {
              ...app,
              status: "Approved",
              isApproved: 1,
              progress: 100,
              nextStep: "Loan disbursed to customer",
              color: "#4CAF50" // Green for approved
            }
          : app
      )

      setApplications(updatedApplications)
      setShowDetailsModal(false)
      showNotification("Application approved successfully!", "success")
    } catch (error) {
      console.error("Error approving application:", error)
      showNotification("Failed to approve application. Please try again.", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectApplication = async () => {
    if (!selectedApplication) return

    setActionLoading(true)
    try {
      await updateLoanApplicationStatus(selectedApplication.id, {
        status: "Rejected",
        rejectedBy: auth.currentUser.email,
        rejectionDate: new Date().toISOString(),
        progress: 0,
        nextStep: "Application rejected",
        isApproved: 0
      })

      // Update local state
      const updatedApplications = applications.map((app) =>
        app.id === selectedApplication.id
          ? {
              ...app,
              status: "Rejected",
              progress: 0,
              nextStep: "Application rejected",
              color: "#F44336" // Red for rejected
            }
          : app
      )

      setApplications(updatedApplications)
      setShowDetailsModal(false)
      showNotification("Application rejected successfully!", "success")
    } catch (error) {
      console.error("Error rejecting application:", error)
      showNotification("Failed to reject application. Please try again.", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 5000)
  }

  // Filter and sort applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.bank?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === "all" || app.status?.toLowerCase().includes(filterStatus.toLowerCase())

    const matchesLoanType =
      filterLoanType === "all" || app.type?.toLowerCase().includes(filterLoanType.toLowerCase())

    return matchesSearch && matchesStatus && matchesLoanType
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let comparison = 0

    if (sortBy === "date") {
      comparison = new Date(a.appliedDate || 0) - new Date(b.appliedDate || 0)
    } else if (sortBy === "amount") {
      const amountA = Number.parseInt(a.amount?.replace(/[^\d]/g, "") || 0)
      const amountB = Number.parseInt(b.amount?.replace(/[^\d]/g, "") || 0)
      comparison = amountA - amountB
    } else if (sortBy === "status") {
      comparison = (a.status || "").localeCompare(b.status || "")
    } else if (sortBy === "email") {
      comparison = (a.email || "").localeCompare(b.email || "")
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const getLoanTypeIcon = (type) => {
    if (!type) return <DollarSign size={16} className="loan-type-icon" />
    
    switch (type.toLowerCase()) {
      case "home loan":
        return <Home size={16} className="loan-type-icon" />
      case "car loan":
        return <Car size={16} className="loan-type-icon" />
      case "business loan":
        return <Briefcase size={16} className="loan-type-icon" />
      case "education loan":
        return <BookOpen size={16} className="loan-type-icon" />
      default:
        return <DollarSign size={16} className="loan-type-icon" />
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-logo">
          <i className="fas fa-shield-alt"></i>
          <span>Loan Application Admin</span>
        </div>
        <div className="admin-actions">
          <button className="refresh-button" onClick={loadData} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />} Refresh
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-main">
          <div className="admin-panel">
            <div className="panel-header">
              <h2>Loan Applications</h2>
              <div className="panel-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by ID, email or bank..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="filter-box">
                  <Filter size={18} />
                  <select value={filterStatus} onChange={handleFilterChange}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="filter-box">
                  <Filter size={18} />
                  <select value={filterLoanType} onChange={handleLoanTypeFilterChange}>
                    <option value="all">All Loan Types</option>
                    <option value="home">Home Loan</option>
                    <option value="personal">Personal Loan</option>
                    <option value="car">Car Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="business">Business Loan</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : (
              <>
                <div className="applications-table">
                  <table>
                    {/* <thead> */}
                      <tr>
                        <th onClick={() => handleSort("id")}>
                          <div className="sortable-header">
                            Application ID
                            {sortBy === "id" && (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th onClick={() => handleSort("email")}>
                          <div className="sortable-header">
                            User Email
                            {sortBy === "email" && (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th>Bank</th>
                        <th>Loan Type</th>
                        <th onClick={() => handleSort("amount")}>
                          <div className="sortable-header">
                            Amount
                            {sortBy === "amount" && (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th onClick={() => handleSort("date")}>
                          <div className="sortable-header">
                            Applied Date
                            {sortBy === "date" && (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th onClick={() => handleSort("status")}>
                          <div className="sortable-header">
                            Status
                            {sortBy === "status" && (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th>Documents</th>
                        <th>Actions</th>
                      </tr>
                    {/* </thead> */}
                    <tbody>
                      {sortedApplications.length > 0 ? (
                        sortedApplications.map((app) => (
                          <tr key={app.id}>
                            <td>{app.id}</td>
                            <td className="email-cell">
                              <Mail size={14} /> {app.email}
                            </td>
                            <td>{app.bank}</td>
                            <td>
                              {getLoanTypeIcon(app.type)}
                              {app.type}
                            </td>
                            <td>{app.amount}</td>
                            <td>
                              <Clock size={14} /> {app.appliedDate}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${app.status?.toLowerCase().replace(/\s+/g, "-")}`}
                                style={{ backgroundColor: app.color }}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <div className="document-count">
                                <span className="verified">
                                  {app.documents?.filter((doc) => doc.status === "Verified").length || 0}
                                </span>
                                /<span className="total">{app.documents?.length || 0}</span>
                              </div>
                            </td>
                            <td>
                              <button
                                className="view-button"
                                onClick={() => viewApplicationDetails(app)}
                                disabled={actionLoading}
                              >
                                <Eye size={16} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="no-data">
                            No applications found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <button className="pagination-button" disabled>
                    Previous
                  </button>
                  <div className="pagination-pages">
                    <button className="pagination-page active">1</button>
                    <button className="pagination-page">2</button>
                    <button className="pagination-page">3</button>
                  </div>
                  <button className="pagination-button">Next</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="close-modal" onClick={() => setShowDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="application-summary">
                <div className="summary-header">
                  <div>
                    <h4>{selectedApplication.type} Application</h4>
                    <p>ID: {selectedApplication.id}</p>
                  </div>
                  <div className="application-status" style={{ backgroundColor: selectedApplication.color }}>
                    {selectedApplication.status}
                  </div>
                </div>

                <div className="summary-details">
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">
                        <User size={16} /> User Email
                      </span>
                      <span className="summary-value">{selectedApplication.userdetails.email}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">
                        <Briefcase size={16} /> Bank
                      </span>
                      <span className="summary-value">{selectedApplication.bank}</span>
                    </div>
                  </div>
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">
                        <DollarSign size={16} /> Amount
                      </span>
                      <span className="summary-value">{selectedApplication.amount}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">
                        <Clock size={16} /> Applied On
                      </span>
                      <span className="summary-value">{selectedApplication.appliedDate}</span>
                    </div>
                  </div>
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">Progress</span>
                      <span className="summary-value">{selectedApplication.progress}% Complete</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Next Step</span>
                      <span className="summary-value">{selectedApplication.nextStep}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="application-timeline">
                <h4>Application Timeline</h4>
                <div className="timeline">
                  {selectedApplication.timeline?.map((item, idx) => (
                    <div key={idx} className={`timeline-item ${item.status.toLowerCase()}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-date">{item.date}</div>
                        <div className="timeline-event">{item.event}</div>
                        <div className="timeline-status">{item.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="application-documents">
                <h4>Documents</h4>
                <div className="documents-list">
                  {selectedApplication.documents?.length > 0 ? (
                    selectedApplication.documents.map((doc, idx) => (
                      <div key={idx} className="document-item">
                        <div className="document-icon">
                          <FileText size={24} />
                        </div>
                        <div className="document-details">
                          <div className="document-name">{doc.name}</div>
                          <div className="document-info">
                            <span>Type: {doc.type}</span>
                            <span>Uploaded: {doc.uploadDate}</span>
                            {doc.verifiedBy && <span>Verified by: {doc.verifiedBy}</span>}
                          </div>
                        </div>
                        <div className={`document-status ${doc.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                          {doc.status}
                        </div>
                        <div className="document-actions">
                          <button className="view-document-button" onClick={() => viewDocument(doc)}>
                            <Eye size={16} /> View
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No documents uploaded yet</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="approve-button"
                  onClick={handleApproveApplication}
                  disabled={
                    !selectedApplication.documents?.every((doc) => doc.status === "Verified") ||
                    actionLoading ||
                    selectedApplication.status === "Approved"
                  }
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <CheckCircle size={16} style={{ marginRight: "8px" }} />
                  )}
                  {selectedApplication.status === "Approved" ? "Already Approved" : "Approve Application"}
                </button>
                <button
                  className="reject-button"
                  onClick={handleRejectApplication}
                  disabled={actionLoading || selectedApplication.status === "Rejected"}
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <AlertCircle size={16} style={{ marginRight: "8px" }} />
                  )}
                  {selectedApplication.status === "Rejected" ? "Already Rejected" : "Reject Application"}
                </button>
                <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Verification Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="modal-overlay">
          <div className="document-modal">
            <div className="modal-header">
              <h3>Document Verification</h3>
              <button className="close-modal" onClick={() => setShowDocumentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="document-info-panel">
                <div className="document-preview">
                  {/* In a real app, this would display the actual document */}
                  <div className="document-placeholder">
                    <FileText size={64} />
                    <p>{selectedDocument.name}</p>
                  </div>
                  <button className="download-button">
                    <Download size={16} style={{ marginRight: "8px" }} />
                    Download Document
                  </button>
                </div>

                <div className="document-details-panel">
                  <h4>Document Details</h4>

                  <div className="detail-item">
                    <span className="detail-label">Document Type</span>
                    <span className="detail-value">{selectedDocument.type}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">File Name</span>
                    <span className="detail-value">{selectedDocument.name}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Upload Date</span>
                    <span className="detail-value">{selectedDocument.uploadDate}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span
                      className={`detail-value status ${selectedDocument.status?.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {selectedDocument.status}
                    </span>
                  </div>

                  <div className="verification-form">
                    <h4>Verification</h4>
                    <div className="form-group">
                      <label>Verification Note</label>
                      <textarea
                        placeholder="Add notes about this document verification..."
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="verification-actions">
                      <button
                        className="verify-button"
                        onClick={handleVerifyDocument}
                        disabled={selectedDocument.status === "Verified" || actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 size={16} className="spin" />
                        ) : (
                          <CheckCircle size={16} style={{ marginRight: "8px" }} />
                        )}
                        {selectedDocument.status === "Verified" ? "Already Verified" : "Mark as Verified"}
                      </button>
                      <button
                        className="reject-button"
                        onClick={handleRejectDocument}
                        disabled={selectedDocument.status === "Rejected" || actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 size={16} className="spin" />
                        ) : (
                          <AlertCircle size={16} style={{ marginRight: "8px" }} />
                        )}
                        {selectedDocument.status === "Rejected" ? "Already Rejected" : "Reject Document"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={() => setNotification({ show: false, message: "", type: "" })}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default Admin
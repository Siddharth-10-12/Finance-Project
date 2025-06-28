import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth"
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

const firebaseConfig = {
  apiKey: "add-your-api-key-here",
  authDomain: "add-your-auth-domain-here",
  projectId: "add-your-project-id-here",
  storageBucket: "add-your-storage-bucket-here",
  messagingSenderId: "add-your-messaging-sender-id-here",
  appId: "add-your-app-id-here",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const provider = new GoogleAuthProvider()

// Store user in Firestore
const storeUserInFirestore = async (user, name) => {
  if (!user) return

  try {
    const userRef = doc(db, "users", user.uid)
    const userSnapshot = await getDoc(userRef)

    if (!userSnapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: name || "No Name",
        email: user.email,
        createdAt: serverTimestamp(),
        subscription: {
          active: false,
          plan: null,
          expiry: null,
          lastPayment: null,
          paymentMethod: null
        }
      })
    }
  } catch (error) {
    console.error("Error storing user:", error)
  }
}

// Fetch user data
const fetchUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid)
    const userSnapshot = await getDoc(userRef)

    return userSnapshot.exists() ? userSnapshot.data() : null
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

// Reset password
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error resetting password:", error)
  }
}

// Logout
const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Sign-out error:", error)
  }
}

// Add monthly income
const addMonthlyIncome = async (uid, month, income) => {
  try {
    const incomeRef = doc(db, "monthlyIncome", `${uid}_${month}`)
    await setDoc(incomeRef, {
      uid,
      month,
      income,
    })
  } catch (error) {
    console.error("Error adding monthly income:", error)
  }
}

// Fetch monthly income
const fetchMonthlyIncome = async (uid, month) => {
  try {
    const incomeDoc = await getDoc(doc(db, "monthlyIncome", `${uid}_${month}`))
    if (incomeDoc.exists()) {
      return incomeDoc.data().income
    } else {
      return 0
    }
  } catch (error) {
    console.error("Error fetching monthly income:", error)
    throw error
  }
}

// Add expense
const addExpense = async (uid, expense) => {
  try {
    const expenseRef = collection(db, "expenses")
    await addDoc(expenseRef, {
      uid,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      month: expense.month,
    })

    // Update monthly expense
    const monthlyExpenseRef = doc(db, "monthlyExpenses", `${uid}_${expense.month}`)
    const monthlyExpenseDoc = await getDoc(monthlyExpenseRef)

    if (monthlyExpenseDoc.exists()) {
      await updateDoc(monthlyExpenseRef, {
        totalExpense: (monthlyExpenseDoc.data().totalExpense || 0) + expense.amount,
      })
    } else {
      await setDoc(monthlyExpenseRef, {
        uid,
        month: expense.month,
        totalExpense: expense.amount,
      })
    }
  } catch (error) {
    console.error("Error adding expense:", error)
  }
}

// Fetch monthly expenses
const fetchMonthlyExpenses = async (uid, month) => {
  try {
    const expensesQuery = query(collection(db, "expenses"), where("uid", "==", uid), where("month", "==", month))
    const expensesSnapshot = await getDocs(expensesQuery)
    return expensesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching monthly expenses:", error)
    return []
  }
}

// Fetch total monthly expense
const fetchTotalMonthlyExpense = async (uid, month) => {
  try {
    const monthlyExpenseRef = doc(db, "monthlyExpenses", `${uid}_${month}`)
    const monthlyExpenseDoc = await getDoc(monthlyExpenseRef)

    if (monthlyExpenseDoc.exists()) {
      return monthlyExpenseDoc.data().totalExpense || 0
    } else {
      return 0
    }
  } catch (error) {
    console.error("Error fetching total monthly expense:", error)
    return 0
  }
}

// Update an existing expense
const updateExpense = async (expenseId, updatedExpense) => {
  try {
    const expenseRef = doc(db, "expenses", expenseId)
    await updateDoc(expenseRef, updatedExpense)

    // Update monthly expense
    const monthlyExpenseRef = doc(db, "monthlyExpenses", `${updatedExpense.uid}_${updatedExpense.month}`)
    const monthlyExpenseDoc = await getDoc(monthlyExpenseRef)

    if (monthlyExpenseDoc.exists()) {
      await updateDoc(monthlyExpenseRef, {
        totalExpense: (monthlyExpenseDoc.data().totalExpense || 0) - updatedExpense.oldAmount + updatedExpense.amount,
      })
    }
  } catch (error) {
    console.error("Error updating expense:", error)
  }
}

// Delete an expense
const deleteExpense = async (expenseId, expense) => {
  try {
    const expenseRef = doc(db, "expenses", expenseId)
    await deleteDoc(expenseRef)

    // Update monthly expense
    const monthlyExpenseRef = doc(db, "monthlyExpenses", `${expense.uid}_${expense.month}`)
    const monthlyExpenseDoc = await getDoc(monthlyExpenseRef)

    if (monthlyExpenseDoc.exists()) {
      await updateDoc(monthlyExpenseRef, {
        totalExpense: (monthlyExpenseDoc.data().totalExpense || 0) - expense.amount,
      })
    }
  } catch (error) {
    console.error("Error deleting expense:", error)
  }
}

// Add new functions for Aadhar and PAN verification
const sendConfirmationEmail = async (aadharNumber) => {
  return "123456" // Return a mock confirmation code
}

const verifyAadhar = async (aadharNumber, confirmationCode) => {
  return confirmationCode === "123456"
}

// Store document data
const storeDocumentData = async (uid, documentType, data) => {
  try {
    const documentRef = doc(db, "userDocuments", `${uid}_${documentType}`)
    await setDoc(documentRef, {
      uid,
      documentType,
      ...data,
    })
  } catch (error) {
    console.error("Error storing document data:", error)
  }
}

// Store tax optimization data
const storeTaxOptimizationData = async (uid, data) => {
  try {
    const taxOptimizationRef = doc(db, "taxOptimization", uid)
    await setDoc(taxOptimizationRef, {
      uid,
      ...data,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error storing tax optimization data:", error)
  }
}

// Store tax profile data
const storeTaxProfileData = async (uid, data) => {
  try {
    const taxProfileRef = doc(db, "taxProfiles", uid)
    await setDoc(taxProfileRef, {
      uid,
      ...data,
      timestamp: serverTimestamp(),
    })

    // Also store in history collection for tracking changes over time
    const historyRef = collection(db, "taxProfileHistory")
    await addDoc(historyRef, {
      uid,
      ...data,
      timestamp: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error storing tax profile data:", error)
    throw error
  }
}

// Fetch tax profile data
const fetchTaxProfileData = async (uid) => {
  try {
    const taxProfileRef = doc(db, "taxProfiles", uid)
    const taxProfileDoc = await getDoc(taxProfileRef)

    if (taxProfileDoc.exists()) {
      return taxProfileDoc.data()
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching tax profile data:", error)
    return null
  }
}

// Store loan recommendation details
const storeLoanRecommendation = async (uid, loanDetails) => {
  try {
    const loanRef = collection(db, "loanRecommendations")
    await addDoc(loanRef, {
      uid,
      ...loanDetails,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error storing loan recommendation:", error)
  }
}

// Fetch loan recommendations for a user
const fetchLoanRecommendations = async (uid) => {
  try {
    const loanQuery = query(collection(db, "loanRecommendations"), where("uid", "==", uid))
    const loanSnapshot = await getDocs(loanQuery)
    return loanSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching loan recommendations:", error)
    return []
  }
}

// Store loan application details
const storeLoanApplication = async (uid, applicationDetails) => {
  try {
    const applicationRef = collection(db, "loanApplications")
    // Add isApproved field with default value 0
    await addDoc(applicationRef, {
      uid,
      ...applicationDetails,
      isApproved: 0, // Default to 0 (not approved)
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error storing loan application:", error)
  }
}

// Fetch loan applications for a user
const fetchLoanApplications = async (uid) => {
  try {
    const applicationQuery = query(collection(db, "loanApplications"), where("uid", "==", uid))
    const applicationSnapshot = await getDocs(applicationQuery)
    return applicationSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching loan applications:", error)
    return []
  }
}

// Fetch all loan applications (for admin)
const fetchAllLoanApplications = async () => {
  try {
    // const applicationQuery = query(collection(db, "loanApplications"))
    // const applicationSnapshot = await getDocs(applicationQuery)
    // return applicationSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const applicationQuery = query(collection(db, "loanApplications"))
    const applicationSnapshot = await getDocs(applicationQuery)
    const temp = applicationSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    temp.forEach(async (docu) => {
      const userRef = doc(db, "users", docu.uid)
      const userDoc = await getDoc(userRef)
      docu.userdetails = userDoc.data()
    })
    console.log(temp[1])
    return temp

  } catch (error) {
    console.error("Error fetching all loan applications:", error)
    return []
  }
}

// Update loan application status
const updateLoanApplicationStatus = async (applicationId, updateData) => {
  try {
    const applicationRef = doc(db, "loanApplications", applicationId)
    await updateDoc(applicationRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating loan application status:", error)
    return false
  }
}

// Approve loan application
const approveLoanApplication = async (applicationId) => {
  try {
    const applicationRef = doc(db, "loanApplications", applicationId)
    await updateDoc(applicationRef, {
      isApproved: 1,
      status: "Approved",
      approvedAt: serverTimestamp(),
      progress: 100,
      color: "#4CAF50", // Green for approved
    })
    return true
  } catch (error) {
    console.error("Error approving loan application:", error)
    return false
  }
}

// Store investment recommendation details
const storeInvestmentRecommendation = async (uid, investmentDetails) => {
  try {
    const investmentRef = collection(db, "investmentRecommendations")
    await addDoc(investmentRef, {
      uid,
      ...investmentDetails,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error storing investment recommendation:", error)
  }
}

// Fetch investment recommendations for a user
const fetchInvestmentRecommendations = async (uid) => {
  try {
    const investmentQuery = query(collection(db, "investmentRecommendations"), where("uid", "==", uid))
    const investmentSnapshot = await getDocs(investmentQuery)
    return investmentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching investment recommendations:", error)
    return []
  }
}

// Store investment application details
const storeInvestmentApplication = async (uid, applicationDetails) => {
  try {
    const applicationRef = collection(db, "investmentApplications")
    await addDoc(applicationRef, {
      uid,
      ...applicationDetails,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error storing investment application:", error)
  }
}

// Fetch investment applications for a user
const fetchInvestmentApplications = async (uid) => {
  try {
    const applicationQuery = query(collection(db, "investmentApplications"), where("uid", "==", uid))
    const applicationSnapshot = await getDocs(applicationQuery)
    return applicationSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching investment applications:", error)
    return []
  }
}

// Store uploaded documents
const storeUploadedDocument = async (uid, documentDetails) => {
  try {
    // Create a new collection for loan documents
    const documentRef = collection(db, "loanDocuments")
    await addDoc(documentRef, {
      uid,
      ...documentDetails,
      isVerified: 0, // Default to 0 (not verified)
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error storing uploaded document:", error)
  }
}

// Fetch uploaded documents for a user
const fetchUploadedDocuments = async (uid) => {
  try {
    const documentQuery = query(collection(db, "loanDocuments"), where("uid", "==", uid))
    const documentSnapshot = await getDocs(documentQuery)
    return documentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching uploaded documents:", error)
    return []
  }
}

// Fetch all uploaded documents (for admin)
const fetchAllUploadedDocuments = async () => {
  try {
    const documentQuery = query(collection(db, "loanDocuments"))
    const documentSnapshot = await getDocs(documentQuery)
    return documentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching all uploaded documents:", error)
    return []
  }
}

// Verify document
const verifyDocument = async (documentId, verificationData) => {
  try {
    const documentRef = doc(db, "loanDocuments", documentId)
    await updateDoc(documentRef, {
      ...verificationData,
      isVerified: 1, // Set to 1 (verified)
      verifiedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error verifying document:", error)
    return false
  }
}

// Upload document file to Firebase Storage
const uploadDocumentFile = async (uid, file, documentType) => {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `documents/${uid}/${documentType}/${file.name}`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading document file:", error)
    throw error
  }
}

// Enhanced subscription management functions

// Check if user has an active subscription
const checkUserSubscription = async (uid) => {
  try {
    const userRef = doc(db, "users", uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      if (userData.subscription?.active) {
        // Check if subscription hasn't expired
        const expiryDate = new Date(userData.subscription.expiry)
        return expiryDate > new Date()
      }
    }
    return false
  } catch (error) {
    console.error("Error checking subscription:", error)
    return false
  }
}

// Store payment information and update subscription
const storePaymentInfo = async (uid, paymentDetails) => {
  try {
    // Add to payments collection
    const paymentRef = collection(db, "payments")
    const paymentDoc = await addDoc(paymentRef, {
      uid,
      plan: paymentDetails.plan,
      duration: paymentDetails.duration,
      amount: paymentDetails.amount,
      paymentMethod: paymentDetails.paymentMethod,
      status: "completed",
      createdAt: serverTimestamp()
    })

    // Calculate expiry date
    const expiryDate = new Date()
    if (paymentDetails.duration === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1)
    }

    // Update user's subscription status
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      "subscription.active": true,
      "subscription.plan": paymentDetails.plan,
      "subscription.expiry": expiryDate.toISOString(),
      "subscription.lastPayment": serverTimestamp(),
      "subscription.paymentMethod": paymentDetails.paymentMethod
    })

    return {
      success: true,
      paymentId: paymentDoc.id
    }
  } catch (error) {
    console.error("Error storing payment info:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user's subscription details
const getUserSubscription = async (uid) => {
  try {
    const userRef = doc(db, "users", uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists() && userDoc.data().subscription) {
      const subscription = userDoc.data().subscription
      return {
        active: subscription.active,
        plan: subscription.plan,
        expiry: subscription.expiry,
        lastPayment: subscription.lastPayment,
        paymentMethod: subscription.paymentMethod
      }
    }
    return null
  } catch (error) {
    console.error("Error getting subscription:", error)
    return null
  }
}

// Get user's payment history
const getPaymentHistory = async (uid) => {
  try {
    const paymentsQuery = query(
      collection(db, "payments"),
      where("uid", "==", uid),
      where("status", "==", "completed")
    )
    const paymentsSnapshot = await getDocs(paymentsQuery)
    return paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      plan: doc.data().plan,
      duration: doc.data().duration,
      amount: doc.data().amount,
      paymentMethod: doc.data().paymentMethod,
      date: doc.data().createdAt?.toDate() || null
    }))
  } catch (error) {
    console.error("Error fetching payment history:", error)
    return []
  }
}

// Cancel user subscription
const cancelSubscription = async (uid) => {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      "subscription.active": false
    })
    return true
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return false
  }
}


export {
  auth,
  db,
  storage,
  provider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  storeUserInFirestore,
  fetchUserData,
  resetPassword,
  logout,
  addMonthlyIncome,
  fetchMonthlyIncome,
  addExpense,
  fetchMonthlyExpenses,
  fetchTotalMonthlyExpense,
  updateExpense,
  deleteExpense,
  sendConfirmationEmail,
  verifyAadhar,
  storeDocumentData,
  storeTaxOptimizationData,
  storeTaxProfileData,
  fetchTaxProfileData,
  storeLoanRecommendation,
  fetchLoanRecommendations,
  storeLoanApplication,
  fetchLoanApplications,
  storeInvestmentRecommendation,
  fetchInvestmentRecommendations,
  storeInvestmentApplication,
  fetchInvestmentApplications,
  storeUploadedDocument,
  fetchUploadedDocuments,
  uploadDocumentFile,
  addDoc,
  collection,
  serverTimestamp,
  // Admin functions
  fetchAllLoanApplications,
  fetchAllUploadedDocuments,
  updateLoanApplicationStatus,
  approveLoanApplication,
  verifyDocument,
  // Subscription management functions
  checkUserSubscription,
  storePaymentInfo,
  getUserSubscription,
  getPaymentHistory,
  cancelSubscription
}
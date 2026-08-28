import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./pages/RoleProtectedRoute";
import Layout from "./components/Layout";

/* ================= PUBLIC ================= */
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Unauthorized from "./pages/Unauthorized";
import ResetPassword from "./pages/ResetPassword";

/* ================= DASHBOARD ================= */
import Dashboard from "./pages/Dashboard";

/* ================= APPLICATIONS ================= */
import Applications from "./pages/Applications";
import NewApplication from "./pages/NewApplication";
import ViewApplication from "./pages/ViewApplication";
import EditApplication from "./pages/EditApplication";
import PaymentReceipt from "./pages/PaymentReceipt";
/* ================= BENEFICIARIES ================= */
import Beneficiaries from "./pages/Beneficiaries";
import AddBeneficiary from "./pages/AddBeneficiary";
import EditBeneficiary from "./pages/EditBeneficiary";
import ViewBeneficiary from "./pages/ViewBeneficiary";

/* ================= PAYMENTS ================= */
import Payments from "./pages/Payments";
import AddPayment from "./pages/AddPayment";
import EditPayment from "./pages/EditPayment";
import ViewPayment from "./pages/ViewPayment";
import ImportPayments from "./pages/ImportPayments";

/* ================= SOFT LOANS ================= */
import SoftLoans from "./pages/SoftLoans/SoftLoans";
import SoftLoanDashboard from "./pages/SoftLoans/SoftLoanDashboard";
import AddSoftLoan from "./pages/SoftLoans/AddSoftLoan";
import EditSoftLoan from "./pages/SoftLoans/EditSoftLoan";
import ViewSoftLoan from "./pages/SoftLoans/ViewSoftLoan";
import AddInstallment from "./pages/SoftLoans/AddInstallment";
import EditInstallment from "./pages/SoftLoans/EditInstallment";
import LoanPDF from "./pages/SoftLoans/LoanPDF";

/* ================= DONORS ================= */
import Donors from "./pages/Donors";
import AddDonor from "./pages/AddDonor";
import EditDonor from "./pages/EditDonor";
import ViewDonor from "./pages/ViewDonor";
import DonorDashboard from "./pages/DonorDashboard";
import AddDonation from "./pages/AddDonation";
import EditDonation from "./pages/EditDonation";

/* ================= DOCUMENTS ================= */
import DocumentsPage from "./pages/DocumentsPage";
import UploadDocuments from "./pages/UploadDocuments";
import TrustDocuments from "./pages/TrustDocuments";
import BOTMinutes from "./pages/BOTMinutes";
import BankDocuments from "./pages/BankDocuments";
import OtherDocuments from "./pages/OtherDocuments";
import AllDocuments from "./pages/AllDocuments";

/* ================= USERS ================= */
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import ViewUser from "./pages/ViewUser";
import ImportData from "./pages/ImportData";

/* ================= SUCCESS STORIES ================= */
import SuccessStories from "./pages/success-stories/SuccessStories";
import AddStory from "./pages/success-stories/AddStory";
import EditStory from "./pages/success-stories/EditStory";
import ViewStory from "./pages/success-stories/ViewStory";

export default function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/logout" element={<Logout />} />

      {/* ================= PROTECTED ROOT ================= */}
      <Route
  path="/"
  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="users" element={<Users />} />
  <Route path="users/add" element={<AddUser />} />

        {/* ================= GENERAL (ALL AUTH USERS) ================= */}
        <Route path="applications" element={<Applications />} />
        <Route path="applications/view/:id" element={<ViewApplication />} />
        <Route path="/payments/receipt/:id" element={<PaymentReceipt />} />
        <Route path="success-stories" element={<SuccessStories />} />
        <Route path="success-stories/view/:id" element={<ViewStory />} />

        {/* ================= STAFF + ADMIN ================= */}
        <Route element={<RoleProtectedRoute allowedRoles={["admin", "staff"]} />}>

          <Route path="applications/new" element={<NewApplication />} />
          <Route path="applications/edit/:id" element={<EditApplication />} />

          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="beneficiaries/view/:id" element={<ViewBeneficiary />} />
          <Route path="beneficiaries/add" element={<AddBeneficiary />} />
          <Route path="beneficiaries/edit/:id" element={<EditBeneficiary />} />

          <Route path="soft-loans" element={<SoftLoans />} />
          <Route path="soft-loans/view/:id" element={<ViewSoftLoan />} />
          <Route path="soft-loan-dashboard" element={<SoftLoanDashboard />} />
          <Route path="soft-loans/add" element={<AddSoftLoan />} />
          <Route path="soft-loans/edit/:id" element={<EditSoftLoan />} />
          <Route path="soft-loans/installment/add/:loanId" element={<AddInstallment />} />
          <Route path="soft-loans/installment/edit/:id" element={<EditInstallment />} />
          <Route path="soft-loans/pdf/:id" element={<LoanPDF />} />

          <Route path="success-stories/add" element={<AddStory />} />
          <Route path="success-stories/edit/:id" element={<EditStory />} />
        </Route>

        {/* ================= ADMIN ONLY ================= */}
        <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>

          <Route path="payments" element={<Payments />} />
<Route path="payments/view/:id" element={<ViewPayment />} />
<Route path="payments/add" element={<AddPayment />} />
<Route path="payments/edit/:id" element={<EditPayment />} />
<Route path="payments/import" element={<ImportPayments />} />

          <Route path="donors" element={<Donors />} />
          <Route path="donors/view/:id" element={<ViewDonor />} />
          <Route path="donor-dashboard" element={<DonorDashboard />} />
          <Route path="donations/add/:donorId" element={<AddDonation />} />
          <Route path="donations/edit/:id" element={<EditDonation />} />
          <Route path="donors/add" element={<AddDonor />} />
          <Route path="donors/edit/:id" element={<EditDonor />} />

          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/all" element={<AllDocuments />} />
          <Route path="documents/trust" element={<TrustDocuments />} />
          <Route path="documents/bot" element={<BOTMinutes />} />
          <Route path="documents/bank" element={<BankDocuments />} />
          <Route path="documents/other" element={<OtherDocuments />} />
          <Route path="documents/upload" element={<UploadDocuments />} />
          <Route path="import-data" element={<ImportData />} />

          <Route path="users" element={<Users />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="users/view/:id" element={<ViewUser />} />
        </Route>

      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}

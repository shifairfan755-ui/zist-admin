import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// PUBLIC
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Unauthorized from "./pages/Unauthorized";

// DASHBOARD
import Dashboard from "./pages/Dashboard";

// APPLICATIONS
import Applications from "./pages/Applications";
import NewApplication from "./pages/NewApplication";
import ViewApplication from "./pages/ViewApplication";
import EditApplication from "./pages/EditApplication";

// BENEFICIARIES
import Beneficiaries from "./pages/Beneficiaries";
import AddBeneficiary from "./pages/AddBeneficiary";
import EditBeneficiary from "./pages/EditBeneficiary";
import ViewBeneficiary from "./pages/ViewBeneficiary";

// PAYMENTS
import Payments from "./pages/Payments";
import AddPayment from "./pages/AddPayment";
import EditPayment from "./pages/EditPayment";
import ViewPayment from "./pages/ViewPayment";

// SOFT LOANS
import SoftLoans from "./pages/SoftLoans/SoftLoans";
import SoftLoanDashboard from "./pages/SoftLoans/SoftLoanDashboard";
import AddSoftLoan from "./pages/SoftLoans/AddSoftLoan";
import EditSoftLoan from "./pages/SoftLoans/EditSoftLoan";
import ViewSoftLoan from "./pages/SoftLoans/ViewSoftLoan";
import AddInstallment from "./pages/SoftLoans/AddInstallment";
import EditInstallment from "./pages/SoftLoans/EditInstallment";
import LoanPDF from "./pages/SoftLoans/LoanPDF";

// DONORS
import Donors from "./pages/Donors";
import AddDonor from "./pages/AddDonor";
import EditDonor from "./pages/EditDonor";
import ViewDonor from "./pages/ViewDonor";
import DonorDashboard from "./pages/DonorDashboard";

// DOCUMENTS
import DocumentsPage from "./pages/DocumentsPage";
import UploadDocuments from "./pages/UploadDocuments";
import TrustDocuments from "./pages/TrustDocuments";
import BOTMinutes from "./pages/BOTMinutes";
import BankDocuments from "./pages/BankDocuments";
import OtherDocuments from "./pages/OtherDocuments";
import AllDocuments from "./pages/AllDocuments";

// USERS
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import ViewUser from "./pages/ViewUser";

// IMPORT
import ImportData from "./pages/ImportData";

// SUCCESS STORIES
import SuccessStories from "./pages/success-stories/SuccessStories";
import AddStory from "./pages/success-stories/AddStory";
import EditStory from "./pages/success-stories/EditStory";
import ViewStory from "./pages/success-stories/ViewStory";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* APPLICATIONS */}
          <Route path="applications" element={<Applications />} />
          <Route path="applications/view/:id" element={<ViewApplication />} />
          <Route path="applications/edit/:id" element={<EditApplication />} />
          <Route path="new-application" element={<NewApplication />} />

          {/* BENEFICIARIES */}
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="beneficiaries/add" element={<AddBeneficiary />} />
          <Route path="beneficiaries/edit/:id" element={<EditBeneficiary />} />
          <Route path="beneficiaries/view/:id" element={<ViewBeneficiary />} />

          {/* PAYMENTS */}
          <Route path="payments" element={<Payments />} />
          <Route path="payments/add" element={<AddPayment />} />
          <Route path="payments/edit/:id" element={<EditPayment />} />
          <Route path="payments/view/:id" element={<ViewPayment />} />

          {/* SOFT LOANS */}
          <Route path="soft-loans" element={<SoftLoans />} />
          <Route path="soft-loans/add" element={<AddSoftLoan />} />
          <Route path="soft-loans/edit/:id" element={<EditSoftLoan />} />
          <Route path="soft-loans/view/:id" element={<ViewSoftLoan />} />
          <Route path="soft-loans/installment/add/:loanId" element={<AddInstallment />} />
          <Route path="soft-loans/installment/edit/:id" element={<EditInstallment />} />
          <Route path="soft-loans/pdf/:id" element={<LoanPDF />} />
          <Route path="soft-loan-dashboard" element={<SoftLoanDashboard />} />

          {/* DONORS */}
          <Route path="donors" element={<Donors />} />
          <Route path="donors/add" element={<AddDonor />} />
          <Route path="donors/edit/:id" element={<EditDonor />} />
          <Route path="donors/view/:id" element={<ViewDonor />} />
          <Route path="donor-dashboard" element={<DonorDashboard />} />

          {/* DOCUMENTS */}
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/upload" element={<UploadDocuments />} />
          <Route path="documents/trust" element={<TrustDocuments />} />
          <Route path="documents/bot" element={<BOTMinutes />} />
          <Route path="documents/bank" element={<BankDocuments />} />
          <Route path="documents/other" element={<OtherDocuments />} />
          <Route path="documents/all" element={<AllDocuments />} />

          {/* USERS */}
          <Route path="users" element={<Users />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="users/view/:id" element={<ViewUser />} />

          {/* IMPORT */}
          <Route path="import-data" element={<ImportData />} />

          {/* STORIES */}
          <Route path="success-stories" element={<SuccessStories />} />
          <Route path="success-stories/add" element={<AddStory />} />
          <Route path="success-stories/edit/:id" element={<EditStory />} />
          <Route path="success-stories/view/:id" element={<ViewStory />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

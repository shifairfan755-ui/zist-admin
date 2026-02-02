import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

// AUTH
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// MAIN PAGES
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import Applications from "./pages/Applications";

// APPLICATION DETAILS
import ViewApplication from "./pages/ViewApplication";
import EditApplication from "./pages/EditApplication";

// BENEFICIARIES
import Beneficiaries from "./pages/Beneficiaries";
import BeneficiaryProfile from "./pages/BeneficiaryProfile";
import EditBeneficiary from "./pages/EditBeneficiary";

// PAYMENTS
import Payments from "./pages/Payments";
import AddPayment from "./pages/AddPayment";
import ViewPayment from "./pages/ViewPayment";
import EditPayment from "./pages/EditPayment";

// DONORS
import Donors from "./pages/Donors";
import AddDonor from "./pages/AddDonor";
import ViewDonor from "./pages/ViewDonor";
import EditDonor from "./pages/EditDonor";
import AddDonation from "./pages/AddDonation";
import EditDonation from "./pages/EditDonation";
import DonorPDF from "./pages/DonorPDF";
import DonorDashboard from "./pages/DonorDashboard";

// DOCUMENTS
import TrustDocuments from "./pages/TrustDocuments";
import BOTMinutes from "./pages/BOTMinutes";
import BankDocuments from "./pages/BankDocuments";
import OtherDocuments from "./pages/OtherDocuments";
import UploadDocuments from "./pages/UploadDocuments";
import AllDocuments from "./pages/AllDocuments";

// USERS
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import ViewUser from "./pages/ViewUser";

// IMPORT
import ImportData from "./pages/ImportData";

// SOFT LOANS
import SoftLoans from "./pages/SoftLoans/SoftLoans";
import AddSoftLoan from "./pages/SoftLoans/AddSoftLoan";
import ViewSoftLoan from "./pages/SoftLoans/ViewSoftLoan";
import EditSoftLoan from "./pages/SoftLoans/EditSoftLoan";
import AddInstallment from "./pages/SoftLoans/AddInstallment";
import EditInstallment from "./pages/SoftLoans/EditInstallment";
import SoftLoanDashboard from "./pages/SoftLoans/SoftLoanDashboard";

// LAYOUT
function Layout() {
  return (
    <div className="flex">
      <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
        <Sidebar />
      </div>
      <div className="ml-64 p-6 w-full">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* PUBLIC ROUTE */}
          <Route path="/login" element={<Login />} />

          {/* PROTECTED ROUTE WRAPS EVERYTHING */}
          <Route element={<ProtectedRoute roles={["admin", "staff", "viewer"]} />}>
            <Route element={<Layout />}>

              {/* DEFAULT */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* APPLICATIONS */}
              <Route path="/new-application" element={<NewApplication />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/view-application/:id" element={<ViewApplication />} />
              <Route path="/edit-application/:id" element={<EditApplication />} />

              {/* BENEFICIARIES */}
              <Route path="/beneficiaries" element={<Beneficiaries />} />
              <Route path="/beneficiary/:id" element={<BeneficiaryProfile />} />
              <Route path="/edit-beneficiary/:id" element={<EditBeneficiary />} />

              {/* PAYMENTS */}
              <Route path="/payments" element={<Payments />} />
              <Route path="/add-payment" element={<AddPayment />} />
              <Route path="/view-payment/:id" element={<ViewPayment />} />
              <Route path="/edit-payment/:id" element={<EditPayment />} />

              {/* SOFT LOANS */}
              <Route path="/soft-loans" element={<SoftLoans />} />
              <Route path="/add-soft-loan" element={<AddSoftLoan />} />
              <Route path="/view-soft-loan/:id" element={<ViewSoftLoan />} />
              <Route path="/edit-soft-loan/:id" element={<EditSoftLoan />} />
              <Route path="/add-installment/:id" element={<AddInstallment />} />
              <Route path="/edit-installment/:id" element={<EditInstallment />} />
              <Route path="/soft-loans-dashboard" element={<SoftLoanDashboard />} />

              {/* DONORS */}
              <Route path="/donors" element={<Donors />} />
              <Route path="/add-donor" element={<AddDonor />} />
              <Route path="/view-donor/:id" element={<ViewDonor />} />
              <Route path="/edit-donor/:id" element={<EditDonor />} />
              <Route path="/add-donation/:id" element={<AddDonation />} />
              <Route path="/edit-donation/:id" element={<EditDonation />} />
              <Route path="/donor/:id/pdf" element={<DonorPDF />} />
              <Route path="/donor-dashboard" element={<DonorDashboard />} />

              {/* DOCUMENTS */}
              <Route path="/documents" element={<AllDocuments />} />
              <Route path="/upload-documents" element={<UploadDocuments />} />
              <Route path="/trust-documents" element={<TrustDocuments />} />
              <Route path="/bank-documents" element={<BankDocuments />} />
              <Route path="/bot-minutes" element={<BOTMinutes />} />
              <Route path="/other-documents" element={<OtherDocuments />} />

              {/* USERS */}
              <Route path="/users" element={<Users />} />
              <Route path="/add-user" element={<AddUser />} />
              <Route path="/edit-user/:id" element={<EditUser />} />
              <Route path="/view-user/:id" element={<ViewUser />} />

              {/* IMPORT */}
              <Route path="/import-data" element={<ImportData />} />

            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { generateLoanPDF } from "./LoanPDF"; // ✅ PDF Export

export default function ViewSoftLoan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // LOAD MAIN LOAN
  // ------------------------------
  const loadLoan = async () => {
    const { data, error } = await supabase
      .from("soft_loans")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Loan not found");
      navigate("/soft-loans");
      return;
    }

    setLoan(data);
  };

  // ------------------------------
  // LOAD INSTALLMENTS
  // ------------------------------
  const loadInstallments = async () => {
    const { data, error } = await supabase
      .from("soft_loan_installments")
      .select("*")
      .eq("loan_id", id)
      .order("date", { ascending: false });

    if (!error) setInstallments(data || []);
  };

  useEffect(() => {
    Promise.all([loadLoan(), loadInstallments()]).then(() =>
      setLoading(false)
    );
  }, [id]);

  const deleteLoan = async () => {
    const yes = confirm("Are you sure you want to delete this loan?");
    if (!yes) return;

    const { error } = await supabase
      .from("soft_loans")
      .delete()
      .eq("id", id);

    if (error) return toast.error("Failed to delete soft loan");

    toast.success("Loan deleted successfully");
    navigate("/soft-loans");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  if (!loan) return <p className="p-6 text-red-600">Loan not found</p>;

  // ------------------------------
  // TOTAL PAID CALCULATION
  // ------------------------------
  const totalPaid = installments.reduce(
    (total, i) => total + Number(i.amount || 0),
    0
  );

  const remaining = Number(loan.amount) - totalPaid;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid on Time":
        return "bg-green-100 text-green-700";
      case "Defaulter":
        return "bg-red-100 text-red-700";
      case "Paying in Installments":
        return "bg-yellow-100 text-yellow-700";
      case "Closed as Imdaad":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* BACK BUTTON */}
      <Link to="/soft-loans" className="text-blue-600">
        ← Back to Soft Loans
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Soft Loan Details
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 border">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-5 mb-6">
          <div>
            <h2 className="text-2xl font-bold">{loan.name}</h2>
            {loan.parentage && (
              <p className="text-gray-600 mt-1">S/O: {loan.parentage}</p>
            )}
            <p className="text-gray-600">{loan.phone}</p>
            <p className="text-gray-500">{loan.address}</p>

            <span
              className={`inline-block mt-3 px-3 py-1 text-sm rounded-full font-semibold ${getStatusColor(
                loan.status
              )}`}
            >
              {loan.status}
            </span>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold text-green-700">
              ₹{loan.amount?.toLocaleString()}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Loan Date: {new Date(loan.loan_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* SUMMARY BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryBox label="Total Loan" value={`₹${loan.amount?.toLocaleString()}`} />
          <SummaryBox label="Total Paid" value={`₹${totalPaid.toLocaleString()}`} />
          <SummaryBox
            label="Remaining"
            value={`₹${remaining.toLocaleString()}`}
            highlight={remaining > 0}
          />
        </div>

        {/* DESCRIPTION FIELDS */}
        <DetailBox label="Recommendation" value={loan.recommendation} />
        <DetailBox label="Cheque Number" value={loan.cheque_no} />

        {/* INSTALLMENTS HEADER */}
        <div className="flex justify-between items-center mt-10 mb-4">
          <h2 className="text-xl font-bold">Installment History</h2>

          <Link
            to={`/add-installment/${loan.id}`}
            className="bg-green-700 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800"
          >
            + Add Installment
          </Link>
        </div>

        {/* INSTALLMENT TABLE */}
        <div className="bg-gray-50 rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-green-100">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Notes</th>
              </tr>
            </thead>

            <tbody>
              {installments.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={3}>
                    No installments recorded
                  </td>
                </tr>
              ) : (
                installments.map((ins) => (
                  <tr key={ins.id} className="hover:bg-gray-100">
                    <td className="p-3 border">
                      {new Date(ins.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-green-700 font-bold">
                      ₹{ins.amount?.toLocaleString()}
                    </td>
                    <td className="p-3 border">{ins.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-10 flex gap-4">
          <Link
            to={`/edit-soft-loan/${loan.id}`}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700"
          >
            Edit Loan
          </Link>

          <button
            onClick={deleteLoan}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-700"
          >
            Delete Loan
          </button>

          {/* PDF EXPORT BUTTON */}
          <button
            onClick={() => generateLoanPDF(loan, installments)}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-purple-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* SummaryBox Component */
function SummaryBox({ label, value, highlight = false }: any) {
  return (
    <div
      className={`p-5 rounded-xl border shadow-sm ${
        highlight ? "bg-red-50 border-red-300" : "bg-gray-50"
      }`}
    >
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

/* DetailBox Component */
function DetailBox({ label, value }: any) {
  return (
    <div className="bg-gray-50 p-5 rounded-xl border shadow-sm mb-6">
      <p className="text-gray-500 text-sm mb-2">{label}</p>
      <p className="text-gray-900 whitespace-pre-line">{value || "—"}</p>
    </div>
  );
}

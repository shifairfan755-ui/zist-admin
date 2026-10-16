
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { generateLoanPDF } from "./LoanPDF";

export default function ViewSoftLoan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [imdaadApprovals, setImdaadApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadLoan(), loadInstallments(), loadImdaad()]);
    setLoading(false);
  };

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

  const loadInstallments = async () => {
    const { data, error } = await supabase
      .from("soft_loan_installments")
      .select("*")
      .eq("loan_id", id)
      .order("date", { ascending: false });

    if (error) {
      toast.error("Could not load installment history");
      setInstallments([]);
      return;
    }

    setInstallments(data || []);
  };

  const loadImdaad = async () => {
    const { data, error } = await supabase
      .from("soft_loan_imdaad")
      .select("id, loan_id, approved_amount")
      .eq("loan_id", id);

    if (error) {
      console.error("Could not load Imdaad records:", error);
      toast.error("Could not load Imdaad records");
      setImdaadApprovals([]);
      return;
    }

    setImdaadApprovals(data || []);
  };

  const deleteLoan = async () => {
    const yes = confirm("Delete this loan permanently?");
    if (!yes) return;

    const { error } = await supabase
      .from("soft_loans")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Delete failed");
      return;
    }

    toast.success("Loan deleted");
    navigate("/soft-loans");
  };

  if (loading) {
    return (
      <div className="p-6 text-center font-semibold">
        Loading...
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-6 text-red-600">
        Loan not found
      </div>
    );
  }

  const installmentTotal = installments.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  // Preserve the existing recovery calculation.
  const totalPaid =
    loan.status === "Paid on Time"
      ? Number(loan.amount || 0)
      : Math.min(installmentTotal, Number(loan.amount || 0));

  const approvedImdaad = imdaadApprovals.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.approved_amount || 0)),
    0
  );

  const totalImdaad = Math.min(
    Math.max(0, Number(loan.amount || 0) - totalPaid),
    approvedImdaad
  );

  const remaining = Math.max(
    0,
    Number(loan.amount || 0) - totalPaid - totalImdaad
  );

  const percentPaid =
    Number(loan.amount || 0) > 0
      ? Math.min(
          100,
          Math.round((totalPaid / Number(loan.amount)) * 100)
        )
      : 0;

  const badgeColor = (status: string) => {
    switch (status) {
      case "Paid on Time":
        return "bg-green-100 text-green-700";
      case "Defaulter":
        return "bg-red-100 text-red-700";
      case "Paying in Installments":
        return "bg-yellow-100 text-yellow-700";
      case "Closed as Imdaad":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const displayValue = (value: any) =>
    value !== null && value !== undefined && String(value).trim() !== ""
      ? String(value)
      : "-";

  const formatDate = (value: string) => {
    if (!value) return "-";
    return new Date(`${value}T00:00:00`).toLocaleDateString();
  };

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto">
      <Link
        to="/soft-loans"
        className="text-blue-600 text-sm font-medium"
      >
        Back to Soft Loans
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Soft Loan Details
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete loan profile and repayment history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {loan.name}
              </h2>

              {loan.parentage && (
                <p className="text-slate-500 mt-1">
                  S/O {loan.parentage}
                </p>
              )}

              {loan.phone && (
                <p className="text-slate-600 mt-2">
                  Phone: {loan.phone}
                </p>
              )}

              {loan.address && (
                <p className="text-slate-600 mt-1">
                  Address: {loan.address}
                </p>
              )}
            </div>

            <span
              className={`px-3 py-2 rounded-full text-sm font-semibold w-fit ${badgeColor(
                loan.status
              )}`}
            >
              {loan.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <StatCard
              label="Loan Amount"
              value={`Rs.${Number(loan.amount || 0).toLocaleString()}`}
            />
            <StatCard
              label="Recovered"
              value={`Rs.${totalPaid.toLocaleString()}`}
            />
            <StatCard
              label="Imdaad"
              value={`Rs.${totalImdaad.toLocaleString("en-IN")}`}
            />
            <StatCard
              label="Balance"
              value={`Rs.${remaining.toLocaleString("en-IN")}`}
            />
            <StatCard
              label="Date"
              value={loan.loan_date ? new Date(loan.loan_date).toLocaleDateString() : "-"}
            />
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Recovery Progress</span>
              <span>{percentPaid}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>

          {loan.recommendation && (
            <div className="mt-6 text-sm text-slate-600">
              <span className="font-semibold">Recommended By:</span>{" "}
              {loan.recommendation}
            </div>
          )}

          {loan.notes && (
            <div className="mt-3 text-sm text-slate-600">
              <span className="font-semibold">Notes:</span> {loan.notes}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-5 md:p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to={`/soft-loans/edit/${loan.id}`}
              className="block text-center w-full px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Loan
            </Link>

            <Link
              to={`/soft-loans/installment/add/${loan.id}`}
              className="block text-center w-full px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              + Add Installment
            </Link>

            <button
              onClick={() => generateLoanPDF(loan, installments, totalImdaad)}
              className="w-full px-4 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
            >
              Download PDF
            </button>

            <button
              onClick={deleteLoan}
              className="w-full px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Delete Loan
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Installment History</h2>
          <span className="text-sm text-slate-500">
            {installments.length} records
          </span>
        </div>

        {/* Desktop installment history */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Payment Mode</th>
                <th className="p-3 text-left">Reference No.</th>
                <th className="p-3 text-left">Received By</th>
                <th className="p-3 text-left">Receipt No.</th>
                <th className="p-3 text-left">Deposited Into</th>
                <th className="p-3 text-left">Notes</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {installments.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-6 text-center text-slate-500"
                  >
                    No installments yet
                  </td>
                </tr>
              ) : (
                installments.map((item) => (
                  <tr key={item.id} className="border-t align-top">
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="p-3 font-semibold text-green-700 whitespace-nowrap">
                      Rs.{Number(item.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3">{displayValue(item.payment_mode)}</td>
                    <td className="p-3">{displayValue(item.reference_number)}</td>
                    <td className="p-3">{displayValue(item.received_by)}</td>
                    <td className="p-3">{displayValue(item.receipt_number)}</td>
                    <td className="p-3">{displayValue(item.deposited_into)}</td>
                    <td className="p-3">{displayValue(item.notes)}</td>
                    <td className="p-3">
                      <Link
                        to={`/soft-loans/installment/edit/${item.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile installment cards */}
        <div className="md:hidden space-y-3">
          {installments.length === 0 ? (
            <div className="text-center text-slate-500 py-4">
              No installments yet
            </div>
          ) : (
            installments.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <p className="font-semibold text-green-700">
                    Rs.{Number(item.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(item.date)}
                  </p>
                </div>

                <DetailRow label="Payment Mode" value={item.payment_mode} />
                <DetailRow label="Reference No." value={item.reference_number} />
                <DetailRow label="Received By" value={item.received_by} />
                <DetailRow label="Receipt No." value={item.receipt_number} />
                <DetailRow label="Deposited Into" value={item.deposited_into} />
                <DetailRow label="Notes" value={item.notes} />

                <Link
                  to={`/soft-loans/installment/edit/${item.id}`}
                  className="inline-block pt-2 text-blue-600 hover:underline font-medium"
                >
                  Edit installment
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 text-sm">
      <span className="text-slate-500 sm:min-w-32">{label}:</span>
      <span className="text-slate-800 break-words">
        {value !== null && value !== undefined && String(value).trim() !== ""
          ? String(value)
          : "-"}
      </span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

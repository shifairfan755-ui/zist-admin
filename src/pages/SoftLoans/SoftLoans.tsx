
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

type SoftLoan = {
  id: string;
  name: string;
  parentage?: string | null;
  phone?: string | null;
  address?: string | null;
  amount: number | string;
  cheque_no?: string | null;
  recommendation?: string | null;
  loan_date?: string | null;
  status: string | null;
  created_at?: string | null;
};

type ImdaadApproval = {
  id: string;
  loan_id: string;
  approved_amount: number | string;
};
type Installment = {
  id: string;
  loan_id: string;
  amount: number | string;
  date?: string | null;
  notes?: string | null;
};

const STATUS_OPTIONS = [
  { value: "Paying in Installments", label: "Running" },
  { value: "Defaulter", label: "Defaulter" },
  { value: "Paid on Time", label: "Completed / Paid" },
  { value: "Closed as Imdaad", label: "Closed as Imdaad" },
];

const money = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function SoftLoans() {
  const [loans, setLoans] = useState<SoftLoan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [imdaadApprovals, setImdaadApprovals] = useState<ImdaadApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    void loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);

    try {
      const [loanResult, imdaadResult, installmentResult] = await Promise.all([
        supabase
          .from("soft_loans")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("soft_loan_imdaad").select("id, loan_id, approved_amount"),
        supabase
          .from("soft_loan_installments")
          .select("id, loan_id, amount, date, notes"),
      ]);

      if (loanResult.error) {
        console.error(loanResult.error);
        toast.error("Failed to load soft loans");
        return;
      }

      if (imdaadResult.error) throw imdaadResult.error;
      setImdaadApprovals(imdaadResult.data || []);
      setLoans(loanResult.data || []);

      if (installmentResult.error) {
        console.error(installmentResult.error);
        setInstallments([]);
        toast.error("Could not load repayment records");
      } else {
        setInstallments(installmentResult.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load soft loan information");
    } finally {
      setLoading(false);
    }
  };

  // Total actual installments received for each loan.
  const installmentTotals = installments.reduce<Record<string, number>>(
    (totals, installment) => {
      totals[installment.loan_id] =
        (totals[installment.loan_id] || 0) +
        Number(installment.amount || 0);
      return totals;
    },
    {}
  );

  // A fully paid loan is recovered in full.
  // Imdaad closure is not treated as cash recovery.
  const getRecovered = (loan: SoftLoan) => {
    const amount = Math.max(0, Number(loan.amount || 0));

    if (loan.status === "Paid on Time") {
      return amount;
    }

    return Math.min(
      amount,
      Math.max(0, installmentTotals[loan.id] || 0)
    );
  };

  const getImdaad = (loan: SoftLoan) =>
    imdaadApprovals
      .filter((approval) => approval.loan_id === loan.id)
      .reduce(
        (sum, approval) =>
          sum + Math.max(0, Number(approval.approved_amount || 0)),
        0
      );

  const getPending = (loan: SoftLoan) =>
    Math.max(
      0,
      Number(loan.amount || 0) - getRecovered(loan) - getImdaad(loan)
    );


  const filtered = loans.filter((loan) => {
    const q = search.trim().toLowerCase();

    const matchSearch =
      !q ||
      (loan.name || "").toLowerCase().includes(q) ||
      (loan.phone || "").toLowerCase().includes(q) ||
      (loan.address || "").toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "" || loan.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selected.length} selected loans? Their linked installment records will also be deleted.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("soft_loans")
      .delete()
      .in("id", selected);

    if (error) {
      console.error(error);
      toast.error("Delete failed");
      return;
    }

    toast.success("Deleted successfully");
    setSelected([]);
    await loadLoans();
  };

  const totalLoan = loans.reduce(
    (sum, loan) => sum + Number(loan.amount || 0),
    0
  );

  const totalCases = loans.length;

  const recovered = loans.reduce(
    (sum, loan) => sum + getRecovered(loan),
    0
  );

  const totalImdaad = loans.reduce((sum, loan) => sum + getImdaad(loan), 0);
  const pending = loans.reduce((sum, loan) => sum + getPending(loan), 0);

  if (loading) {
    return (
      <div className="p-6 text-center font-semibold">
        Loading soft loans...
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Soft Loans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage loan records, recovery &amp; beneficiaries
          </p>
        </div>

        <div className="grid grid-cols-2 md:flex gap-2">
          {selected.length > 0 && (
            <button
              onClick={deleteSelected}
              className="px-4 py-3 rounded-xl bg-red-600 text-white text-sm"
            >
              Delete ({selected.length})
            </button>
          )}

          <Link
            to="/soft-loans/add"
            className="px-4 py-3 rounded-xl bg-green-700 text-white text-center text-sm"
          >
            + Add Loan
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card title="Cases" value={totalCases.toLocaleString("en-IN")} />
        <Card title="Total Loan" value={money(totalLoan)} />
        <Card title="Recovered" value={money(recovered)} />
        <Card title="Imdaad" value={money(totalImdaad)} />
        <Card title="Pending" value={money(pending)} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          type="text"
          placeholder="Search loans..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-xl border px-4 py-3"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            void loadLoans();
          }}
          className="w-full rounded-xl border px-4 py-3 text-slate-700 hover:bg-slate-50"
        >
          Refresh / Clear Filters
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4"></th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Loan Amount</th>
              <th className="p-4 text-left">Recovered</th>
              <th className="p-4 text-left">Imdaad</th>
              <th className="p-4 text-left">Pending</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No soft loans found.
                </td>
              </tr>
            ) : (
              filtered.map((loan) => (
                <tr key={loan.id} className="border-t hover:bg-slate-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(loan.id)}
                      onChange={() => toggleSelect(loan.id)}
                      aria-label={`Select ${loan.name}`}
                    />
                  </td>
                  <td className="p-4 font-medium">{loan.name}</td>
                  <td className="p-4">{loan.phone || "â€”"}</td>
                  <td className="p-4 text-green-700 font-semibold">
                    {money(Number(loan.amount || 0))}
                  </td>
                  <td className="p-4 text-blue-700">
                    {money(getRecovered(loan))}
                  </td>
                  <td className="p-4 text-purple-700">
                    {money(getImdaad(loan))}
                  </td>
                  <td className="p-4 text-orange-700">
                    {money(getPending(loan))}
                  </td>
                  <td className="p-4">{loan.status || "â€”"}</td>
                  <td className="p-4">
                    <Link
                      to={`/soft-loans/view/${loan.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500">
            No soft loans found.
          </div>
        ) : (
          filtered.map((loan) => (
            <div key={loan.id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {loan.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {loan.phone || "No phone"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selected.includes(loan.id)}
                  onChange={() => toggleSelect(loan.id)}
                  aria-label={`Select ${loan.name}`}
                />
              </div>

              <div className="mt-4 text-sm space-y-2 text-slate-600">
                <p>
                  <span className="font-medium">Loan Amount: </span>
                  {money(Number(loan.amount || 0))}
                </p>
                <p>
                  <span className="font-medium">Recovered: </span>
                  {money(getRecovered(loan))}
                </p>
                <p>
                  <span className="font-medium">Imdaad: </span>
                  {money(getImdaad(loan))}
                </p>
                <p>
                  <span className="font-medium">Pending: </span>
                  {money(getPending(loan))}
                </p>
                <p>
                  <span className="font-medium">Status: </span>
                  {loan.status || "â€”"}
                </p>
              </div>

              <Link
                to={`/soft-loans/view/${loan.id}`}
                className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm"
              >
                View
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <h3 className="text-lg font-bold text-slate-800 mt-1">{value}</h3>
    </div>
  );
}










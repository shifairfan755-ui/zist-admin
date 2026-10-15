import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

type Loan = {
  id: string;
  name: string;
  amount: number | string;
  status: string | null;
  loan_date?: string | null;
};

type Installment = {
  id: string;
  loan_id: string;
  amount: number | string;
};

type ImdaadApproval = {
  id: string;
  loan_id: string;
  approved_amount: number | string;
  approval_date: string;
  approved_by: string;
  approval_reference: string | null;
  reason: string;
  remarks: string | null;
  created_at: string;
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const today = () => {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export default function ImdaadManagement() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [approvals, setApprovals] = useState<ImdaadApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [loanId, setLoanId] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approvalDate, setApprovalDate] = useState(today());
  const [approvedBy, setApprovedBy] = useState("");
  const [approvalReference, setApprovalReference] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");

  const loadData = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [loanRes, installmentRes, approvalRes] = await Promise.all([
        supabase
          .from("soft_loans")
          .select("id, name, amount, status, loan_date")
          .order("created_at", { ascending: false }),
        supabase
          .from("soft_loan_installments")
          .select("id, loan_id, amount"),
        supabase
          .from("soft_loan_imdaad")
          .select("id, loan_id, approved_amount, approval_date, approved_by, approval_reference, reason, remarks, created_at")
          .order("approval_date", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (loanRes.error) throw loanRes.error;
      if (installmentRes.error) throw installmentRes.error;
      if (approvalRes.error) throw approvalRes.error;

      setLoans((loanRes.data || []) as Loan[]);
      setInstallments((installmentRes.data || []) as Installment[]);
      setApprovals((approvalRes.data || []) as ImdaadApproval[]);
    } catch (error) {
      console.error("Failed to load Imdaad management data:", error);
      setLoadError(
        "Could not load Imdaad data. Check the database policies and refresh the page."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const loanSummaries = useMemo(() => {
    const installmentTotals: Record<string, number> = {};
    const imdaadTotals: Record<string, number> = {};

    installments.forEach((item) => {
      installmentTotals[item.loan_id] =
        (installmentTotals[item.loan_id] || 0) + Math.max(0, Number(item.amount || 0));
    });

    approvals.forEach((item) => {
      imdaadTotals[item.loan_id] =
        (imdaadTotals[item.loan_id] || 0) + Math.max(0, Number(item.approved_amount || 0));
    });

    return loans.map((loan) => {
      const original = Math.max(0, Number(loan.amount || 0));
      // Preserve the app's existing convention for loans marked Paid on Time.
      const recovered =
        loan.status === "Paid on Time"
          ? original
          : Math.min(original, installmentTotals[loan.id] || 0);
      const imdaad = Math.min(
        Math.max(0, original - recovered),
        imdaadTotals[loan.id] || 0
      );
      const outstanding = Math.max(0, original - recovered - imdaad);

      return { ...loan, original, recovered, imdaad, outstanding };
    });
  }, [loans, installments, approvals]);

  const selectedLoan = loanSummaries.find((loan) => loan.id === loanId);
  const requestedAmount = Number(approvedAmount || 0);
  const eligibleBalance = selectedLoan?.outstanding || 0;

  const totalApproved = approvals.reduce(
    (sum, item) => sum + Math.max(0, Number(item.approved_amount || 0)),
    0
  );

  const submitApproval = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLoan) {
      toast.error("Please select a loan.");
      return;
    }

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      toast.error("Enter an approved amount greater than zero.");
      return;
    }

    if (requestedAmount > eligibleBalance) {
      toast.error("The approved amount cannot exceed the eligible outstanding balance.");
      return;
    }

    if (!approvalDate || !approvedBy.trim() || !reason.trim()) {
      toast.error("Complete the approval date, approving authority, and reason.");
      return;
    }

    const confirmed = window.confirm(
      `Record a permanent Imdaad approval of ${money(requestedAmount)} for ${selectedLoan.name}? This approval cannot be edited or deleted from this screen.`
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("soft_loan_imdaad").insert({
        loan_id: selectedLoan.id,
        approved_amount: requestedAmount,
        approval_date: approvalDate,
        approved_by: approvedBy.trim(),
        approval_reference: approvalReference.trim() || null,
        reason: reason.trim(),
        remarks: remarks.trim() || null,
      });

      if (error) throw error;

      toast.success("Imdaad approval recorded.");
      setLoanId("");
      setApprovedAmount("");
      setApprovalDate(today());
      setApprovedBy("");
      setApprovalReference("");
      setReason("");
      setRemarks("");
      await loadData();
    } catch (error: any) {
      console.error("Failed to record Imdaad approval:", error);
      toast.error(error?.message || "Could not record approval.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center font-semibold">Loading Imdaad management...</div>;
  }

  if (loadError) {
    return (
      <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        <p>{loadError}</p>
        <button type="button" onClick={() => void loadData()} className="mt-3 rounded-lg border px-4 py-2">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-3 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Imdaad Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Record approved loan write-offs separately from cash recovery.
          </p>
        </div>
        <button type="button" onClick={() => void loadData()} className="rounded-xl border bg-white px-4 py-3 text-sm hover:bg-slate-50">
          Refresh records
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Loans" value={loanSummaries.length.toLocaleString("en-IN")} />
        <SummaryCard label="Total Approved Imdaad" value={money(totalApproved)} />
        <SummaryCard label="Approval Records" value={approvals.length.toLocaleString("en-IN")} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">Record an Imdaad Approval</h2>
          <p className="mb-5 text-sm text-amber-700">
            Permanent record: verify the formal approval before submitting.
          </p>

          <form onSubmit={submitApproval} className="space-y-4">
            <div>
              <label htmlFor="imdaad-loan" className="mb-1 block text-sm font-medium text-slate-700">Select loan</label>
              <select
                id="imdaad-loan"
                value={loanId}
                onChange={(event) => {
                  setLoanId(event.target.value);
                  setApprovedAmount("");
                }}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-3"
              >
                <option value="">Choose a beneficiary loan</option>
                {loanSummaries.filter((loan) => loan.outstanding > 0).map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.name} — {money(loan.outstanding)} eligible
                  </option>
                ))}
              </select>
            </div>

            {selectedLoan && (
              <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
                <MiniAmount label="Original loan" value={money(selectedLoan.original)} />
                <MiniAmount label="Cash recovered" value={money(selectedLoan.recovered)} />
                <MiniAmount label="Eligible balance" value={money(eligibleBalance)} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="imdaad-amount" className="mb-1 block text-sm font-medium text-slate-700">Approved amount (₹)</label>
                <input
                  id="imdaad-amount"
                  type="number"
                  min="0.01"
                  max={eligibleBalance || undefined}
                  step="0.01"
                  value={approvedAmount}
                  onChange={(event) => setApprovedAmount(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-3"
                />
                <p className="mt-1 text-xs text-slate-500">Must not exceed the eligible balance.</p>
              </div>
              <div>
                <label htmlFor="imdaad-date" className="mb-1 block text-sm font-medium text-slate-700">Approval date</label>
                <input
                  id="imdaad-date"
                  type="date"
                  value={approvalDate}
                  max={today()}
                  onChange={(event) => setApprovalDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-3"
                />
              </div>
              <div>
                <label htmlFor="imdaad-approved-by" className="mb-1 block text-sm font-medium text-slate-700">Approved by / authority</label>
                <input
                  id="imdaad-approved-by"
                  value={approvedBy}
                  onChange={(event) => setApprovedBy(event.target.value)}
                  required
                  maxLength={200}
                  placeholder="Board / authorized person"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3"
                />
              </div>
              <div>
                <label htmlFor="imdaad-reference" className="mb-1 block text-sm font-medium text-slate-700">Approval reference</label>
                <input
                  id="imdaad-reference"
                  value={approvalReference}
                  onChange={(event) => setApprovalReference(event.target.value)}
                  maxLength={200}
                  placeholder="Resolution / document number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imdaad-reason" className="mb-1 block text-sm font-medium text-slate-700">Reason for Imdaad</label>
              <textarea
                id="imdaad-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required
                maxLength={2000}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-3 py-3"
                placeholder="Explain the reason and basis for the approved write-off."
              />
            </div>
            <div>
              <label htmlFor="imdaad-remarks" className="mb-1 block text-sm font-medium text-slate-700">Additional remarks</label>
              <textarea
                id="imdaad-remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                maxLength={4000}
                rows={2}
                className="w-full rounded-xl border border-slate-300 px-3 py-3"
                placeholder="Optional supporting details"
              />
            </div>

            {requestedAmount > eligibleBalance && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                The amount exceeds the currently eligible balance.
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !selectedLoan || requestedAmount <= 0 || requestedAmount > eligibleBalance}
              className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Recording approval..." : "Record permanent approval"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Loan Balances</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3 whitespace-nowrap">Recovered</th>
                  <th className="p-3 whitespace-nowrap">Imdaad</th>
                  <th className="p-3 whitespace-nowrap">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {loanSummaries.map((loan) => (
                  <tr key={loan.id} className="border-t">
                    <td className="p-3 font-medium">{loan.name}</td>
                    <td className="p-3 whitespace-nowrap text-blue-700">{money(loan.recovered)}</td>
                    <td className="p-3 whitespace-nowrap text-violet-700">{money(loan.imdaad)}</td>
                    <td className="p-3 whitespace-nowrap text-orange-700">{money(loan.outstanding)}</td>
                  </tr>
                ))}
                {loanSummaries.length === 0 && (
                  <tr><td colSpan={4} className="p-5 text-center text-slate-500">No loans found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Cash recovered and Imdaad are reported separately. Historical loans marked “Closed as Imdaad” are not automatically treated as approved write-offs.
          </p>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Permanent Approval History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Approved Amount</th>
                <th className="p-3">Approved By</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Reason / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => {
                const loan = loans.find((item) => item.id === approval.loan_id);
                return (
                  <tr key={approval.id} className="border-t align-top">
                    <td className="whitespace-nowrap p-3">{approval.approval_date}</td>
                    <td className="p-3 font-medium">{loan?.name || "Loan record unavailable"}</td>
                    <td className="whitespace-nowrap p-3 font-semibold text-violet-700">{money(Number(approval.approved_amount || 0))}</td>
                    <td className="p-3">{approval.approved_by}</td>
                    <td className="p-3">{approval.approval_reference || "—"}</td>
                    <td className="min-w-56 p-3">
                      <p>{approval.reason}</p>
                      {approval.remarks && <p className="mt-1 text-slate-500">{approval.remarks}</p>}
                    </td>
                  </tr>
                );
              })}
              {approvals.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">No Imdaad approvals recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}

function MiniAmount({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

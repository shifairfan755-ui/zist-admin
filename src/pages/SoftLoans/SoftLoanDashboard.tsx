
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Loan = {
  id: string;
  amount: number | string;
  status: string | null;
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

export default function SoftLoanDashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [imdaadApprovals, setImdaadApprovals] = useState<ImdaadApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const [loanRes, instRes, imdaadRes] = await Promise.all([
        supabase.from("soft_loans").select("id, amount, status"),
        supabase
          .from("soft_loan_installments")
          .select("id, loan_id, amount, date, notes"),
        supabase.from("soft_loan_imdaad").select("id, loan_id, approved_amount"),
      ]);

      if (loanRes.error) throw loanRes.error;
      if (instRes.error) throw instRes.error;
      if (imdaadRes.error) throw imdaadRes.error;

      setLoans(loanRes.data || []);
      setInstallments(instRes.data || []);
      setImdaadApprovals(imdaadRes.data || []);
    } catch (error) {
      console.error("Failed to load soft loan dashboard:", error);
      setLoadError(true);
      setLoans([]);
      setInstallments([]);
    } finally {
      setLoading(false);
    }
  };

  const safeDate = (value: string | null | undefined) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  if (loading) {
    return (
      <div className="p-6 text-center font-semibold">
        Loading soft loan dashboard...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 text-center text-red-600">
        Could not load soft loan data. Please refresh the page.
        <button
          type="button"
          onClick={() => void loadData()}
          className="ml-3 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Use the same installment totals and recovery rules as SoftLoans.tsx.
  const installmentTotals = installments.reduce<Record<string, number>>(
    (totals, installment) => {
      const loanId = String(installment.loan_id);
      totals[loanId] =
        (totals[loanId] || 0) + Number(installment.amount || 0);
      return totals;
    },
    {}
  );

  const getRecovered = (loan: Loan) => {
    const amount = Math.max(0, Number(loan.amount || 0));

    if (loan.status === "Paid on Time") {
      return amount;
    }

    // Closed as Imdaad is not treated as cash recovery.
    return Math.min(
      amount,
      Math.max(0, installmentTotals[String(loan.id)] || 0)
    );
  };

  const totalLoan = loans.reduce(
    (sum, loan) => sum + Math.max(0, Number(loan.amount || 0)),
    0
  );

  const recovered = loans.reduce(
    (sum, loan) => sum + getRecovered(loan),
    0
  );

  const totalImdaad = imdaadApprovals.reduce(
    (sum, approval) => sum + Math.max(0, Number(approval.approved_amount || 0)),
    0
  );

  const pending = Math.max(0, totalLoan - recovered - totalImdaad);

  const defaulters = loans.filter(
    (loan) => loan.status === "Defaulter"
  ).length;

  const activeLoans = loans.filter(
    (loan) => loan.status === "Paying in Installments"
  ).length;

  // Chart shows actual recorded installments by month.
  const monthMap: Record<string, number> = {};

  installments.forEach((item) => {
    const date = safeDate(item.date);
    if (!date) return;

    const month = date.toLocaleString("en-IN", {
      month: "short",
      year: "2-digit",
    });

    monthMap[month] =
      (monthMap[month] || 0) + Number(item.amount || 0);
  });

  const monthlyData = Object.entries(monthMap).map(
    ([month, amount]) => ({ month, amount })
  );

  const statusMap: Record<string, number> = {};

  loans.forEach((loan) => {
    const status = loan.status || "Unknown";
    statusMap[status] = (statusMap[status] || 0) + 1;
  });

  const statusData = Object.entries(statusMap).map(
    ([name, value]) => ({ name, value })
  );

  const COLORS = [
    "#16a34a",
    "#dc2626",
    "#f59e0b",
    "#2563eb",
    "#64748b",
  ];

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="p-3 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Soft Loan Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Analytics, recovery and portfolio performance
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card title="Total Loan" value={formatCurrency(totalLoan)} />
        <Card title="Recovered" value={formatCurrency(recovered)} />
        <Card title="Total Imdaad" value={formatCurrency(totalImdaad)} />
        <Card title="Pending" value={formatCurrency(pending)} />
        <Card title="Defaulters" value={defaulters} danger />
        <Card title="Active" value={activeLoans} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Recovery</h2>

          {monthlyData.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) =>
                      formatCurrency(Number(value))
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Loan Status Distribution
          </h2>

          {statusData.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Portfolio Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Summary
            label="Recovery Rate"
            value={`${
              totalLoan > 0
                ? Math.round((recovered / totalLoan) * 100)
                : 0
            }%`}
          />
          <Summary label="Total Cases" value={loans.length} />
          <Summary
            label="Installments Records"
            value={installments.length}
          />
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <h3
        className={`text-lg font-bold mt-1 ${
          danger ? "text-red-600" : "text-slate-800"
        }`}
      >
        {value}
      </h3>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-slate-500">{label}</p>
      <p className="font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="h-full flex items-center justify-center text-slate-500">
      No data available
    </div>
  );
}








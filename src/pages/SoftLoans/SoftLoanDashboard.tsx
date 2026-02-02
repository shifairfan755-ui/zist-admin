import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SoftLoanDashboard() {
  const [loans, setLoans] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // SAFELY PARSE DATES
  function safeDate(d: any) {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // LOAD LOANS + INSTALLMENTS
  const loadData = async () => {
    const { data: loanData } = await supabase.from("soft_loans").select("*");

    const { data: instData } = await supabase
      .from("soft_loan_installments")
      .select("*");

    setLoans(loanData || []);
    setInstallments(instData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  // 📌 TOTALS
  const totalLoanAmount = loans.reduce(
    (t, x) => t + Number(x.amount || 0),
    0
  );

  const totalInstallmentPaid = installments.reduce(
    (t, x) => t + Number(x.amount || 0),
    0
  );

  const outstanding = totalLoanAmount - totalInstallmentPaid;

  const defaulters = loans.filter((l) => l.status === "Defaulter").length;

  // 📌 MONTHLY RECOVERY (NO NAN)
  const monthData = installments
    .map((ins) => {
      const dt = safeDate(ins.date);
      if (!dt) return null;

      return {
        month: dt.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        amount: Number(ins.amount),
      };
    })
    .filter(Boolean); // remove nulls

  // GROUP BY MONTH
  const monthlyTotals: any = {};
  monthData.forEach((x) => {
    monthlyTotals[x.month] = (monthlyTotals[x.month] || 0) + x.amount;
  });

  const chartMonthly = Object.entries(monthlyTotals).map(([month, amount]) => ({
    month,
    amount,
  }));

  // 📌 STATUS DISTRIBUTION (PIE)
  const statusCounts: any = {};
  loans.forEach((l) => {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  });

  const statusChart = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        Soft Loan Dashboard
      </h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card title="Total Loan Amount" value={`₹${totalLoanAmount.toLocaleString()}`} />
        <Card title="Total Installments Paid" value={`₹${totalInstallmentPaid.toLocaleString()}`} />
        <Card title="Outstanding Balance" value={`₹${outstanding.toLocaleString()}`} />
        <Card title="Defaulters" value={defaulters} valueClass="text-red-600" />
      </div>

      {/* MONTHLY RECOVERY CHART */}
      <section className="bg-white p-6 rounded-xl shadow border mb-10">
        <h2 className="text-xl font-bold mb-4">Monthly Recovery</h2>

        {chartMonthly.length === 0 ? (
          <p className="text-gray-500">No installment data available</p>
        ) : (
          <BarChartUI data={chartMonthly} />
        )}
      </section>

      {/* STATUS PIE CHART */}
      <section className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4">Loan Status Distribution</h2>

        {statusChart.length === 0 ? (
          <p className="text-gray-500">No status data available</p>
        ) : (
          <PieChartUI data={statusChart} />
        )}
      </section>
    </div>
  );
}

/* CARD UI */
function Card({ title, value, valueClass = "" }: any) {
  return (
    <div className="bg-white p-6 border shadow rounded-xl">
      <p className="text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${valueClass}`}>{value}</p>
    </div>
  );
}

/* BAR CHART */
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

function BarChartUI({ data }: any) {
  return (
    <BarChart width={800} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="amount" fill="#0fbf64" />
    </BarChart>
  );
}

/* PIE CHART */
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2ecc71", "#e74c3c", "#f1c40f", "#3498db"];

function PieChartUI({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          dataKey="value"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((_: any, index: number) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

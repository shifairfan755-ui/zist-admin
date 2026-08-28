import {
  useEffect,
  useState,
} from "react";

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

export default function SoftLoanDashboard() {
  const [loans, setLoans] =
    useState<any[]>([]);

  const [
    installments,
    setInstallments,
  ] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData =
    async () => {
      setLoading(true);

      const [
        loanRes,
        instRes,
      ] =
        await Promise.all([
          supabase
            .from(
              "soft_loans"
            )
            .select("*"),

          supabase
            .from(
              "soft_loan_installments"
            )
            .select("*"),
        ]);

      setLoans(
        loanRes.data ||
          []
      );

      setInstallments(
        instRes.data ||
          []
      );

      setLoading(false);
    };

  const safeDate = (
    val: any
  ) => {
    if (!val)
      return null;

    const d =
      new Date(
        val
      );

    return isNaN(
      d.getTime()
    )
      ? null
      : d;
  };

  if (loading) {
    return (
      <div className="p-6 text-center font-semibold">
        Loading...
      </div>
    );
  }

  /* Totals */
  const totalLoan =
    loans.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.amount ||
            0
        ),
      0
    );

  const recovered =
    installments.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.amount ||
            0
        ),
      0
    );

  const pending =
    totalLoan -
    recovered;

  const defaulters =
    loans.filter(
      (
        l
      ) =>
        l.status ===
        "Defaulter"
    ).length;

  const activeLoans =
    loans.filter(
      (
        l
      ) =>
        l.status ===
        "Paying in Installments"
    ).length;

  /* Monthly Chart */
  const monthMap: any =
    {};

  installments.forEach(
    (item) => {
      const d =
        safeDate(
          item.date
        );

      if (!d)
        return;

      const key =
        d.toLocaleString(
          "default",
          {
            month:
              "short",
            year: "2-digit",
          }
        );

      monthMap[key] =
        (monthMap[
          key
        ] ||
          0) +
        Number(
          item.amount ||
            0
        );
    }
  );

  const monthlyData =
    Object.entries(
      monthMap
    ).map(
      ([
        month,
        amount,
      ]) => ({
        month,
        amount,
      })
    );

  /* Status Pie */
  const statusMap: any =
    {};

  loans.forEach(
    (item) => {
      const key =
        item.status ||
        "Unknown";

      statusMap[key] =
        (statusMap[
          key
        ] ||
          0) + 1;
    }
  );

  const statusData =
    Object.entries(
      statusMap
    ).map(
      ([
        name,
        value,
      ]) => ({
        name,
        value,
      })
    );

  const COLORS = [
    "#16a34a",
    "#dc2626",
    "#f59e0b",
    "#2563eb",
    "#64748b",
  ];

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Soft Loan
          Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Analytics,
          recovery and
          portfolio
          performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card
          title="Total Loan"
          value={`₹${totalLoan.toLocaleString()}`}
        />

        <Card
          title="Recovered"
          value={`₹${recovered.toLocaleString()}`}
        />

        <Card
          title="Pending"
          value={`₹${pending.toLocaleString()}`}
        />

        <Card
          title="Defaulters"
          value={defaulters}
          danger
        />

        <Card
          title="Active"
          value={
            activeLoans
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Recovery */}
        <section className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Monthly
            Recovery
          </h2>

          {monthlyData.length ===
          0 ? (
            <Empty />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    monthlyData
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Status */}
        <section className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Loan Status
            Distribution
          </h2>

          {statusData.length ===
          0 ? (
            <Empty />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      statusData
                    }
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {statusData.map(
                      (
                        _,
                        i
                      ) => (
                        <Cell
                          key={
                            i
                          }
                          fill={
                            COLORS[
                              i %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Legend />

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Bottom Summary */}
      <div className="mt-6 bg-white rounded-2xl shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">
          Portfolio
          Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Summary
            label="Recovery Rate"
            value={`${totalLoan > 0 ? Math.round((recovered / totalLoan) * 100) : 0}%`}
          />

          <Summary
            label="Total Cases"
            value={
              loans.length
            }
          />

          <Summary
            label="Installments Records"
            value={
              installments.length
            }
          />
        </div>
      </div>
    </div>
  );
}

/* Reusable */

function Card({
  title,
  value,
  danger = false,
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <h3
        className={`text-lg font-bold mt-1 ${
          danger
            ? "text-red-600"
            : "text-slate-800"
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
}: any) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-slate-500">
        {label}
      </p>

      <p className="font-bold text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}

function Empty() {
  return (
    <div className="h-full flex items-center justify-center text-slate-500">
      No data
      available
    </div>
  );
}
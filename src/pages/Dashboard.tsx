import CountUp from "react-countup";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import CategoryChart from "../components/CategoryChart";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    year: 0,
    categories: 0,
  });

  const [latestStory, setLatestStory] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const { data: payments } = await supabase
        .from("payments")
        .select("id, payee_name, amount, category, payment_date");

      if (!payments) return;

      let todayTotal = 0;
      let monthTotal = 0;
      let yearTotal = 0;

      const categoryCounts: Record<string, number> = {};
      const monthMap: Record<number, number> = {};

      payments.forEach((p: any) => {
        const created = new Date(p.payment_date);
        const monthIndex = created.getMonth();

        if (p.payment_date?.startsWith(todayStr))
          todayTotal += p.amount || 0;

        if (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        )
          monthTotal += p.amount || 0;

        if (created >= yearStart)
          yearTotal += p.amount || 0;

        if (p.category)
          categoryCounts[p.category] =
            (categoryCounts[p.category] || 0) + 1;

        monthMap[monthIndex] =
          (monthMap[monthIndex] || 0) + (p.amount || 0);
      });

      // Monthly ordered Jan–Dec
      const monthNames = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec",
      ];

      const formattedMonthly = monthNames.map((name, index) => ({
        month: name,
        total: monthMap[index] || 0,
      }));

      setStats({
        today: todayTotal,
        month: monthTotal,
        year: yearTotal,
        categories: Object.keys(categoryCounts).length,
      });

      setCategoryData(
        Object.keys(categoryCounts).map((key) => ({
          name: key,
          value: categoryCounts[key],
        }))
      );

      setMonthlyData(formattedMonthly);

      // Recent Payments (sorted by real payment date)
      const { data: recent } = await supabase
        .from("payments")
        .select("id, payee_name, amount, category, payment_date")
        .order("payment_date", { ascending: false })
        .limit(5);

      setRecentPayments(recent || []);

      const { data: story } = await supabase
        .from("success_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      setLatestStory(story?.[0] || null);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full px-8 py-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

      {loading ? (
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Today", value: stats.today, color: "from-blue-500 to-blue-700" },
              { label: "This Month", value: stats.month, color: "from-green-500 to-green-700" },
              { label: "This Year", value: stats.year, color: "from-purple-500 to-purple-700" },
              { label: "Categories", value: stats.categories, color: "from-orange-500 to-orange-700", noCurrency: true },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-3xl text-white shadow-lg bg-gradient-to-r ${card.color}`}
              >
                <p className="text-sm opacity-90">{card.label}</p>
                <p className="text-3xl font-bold mt-2">
                  {card.noCurrency ? (
                    <CountUp end={card.value} duration={1.5} />
                  ) : (
                    <>₹<CountUp end={card.value} duration={1.5} separator="," /></>
                  )}
                </p>
              </motion.div>
            ))}
          </div>

          {/* MONTHLY GRAPH */}
          <div className="bg-white shadow-lg rounded-3xl p-8 mb-12">
            <h3 className="text-lg font-semibold mb-4">
              Monthly Payment Summary
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CATEGORY CHART */}
          <div className="bg-white shadow-lg rounded-3xl p-8 mb-12">
            <h3 className="text-lg font-semibold mb-4">
              Category Distribution
            </h3>

            <div className="flex justify-center">
              <div className="w-full max-w-[600px] h-[350px]">
                <CategoryChart data={categoryData} />
              </div>
            </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="bg-white shadow-lg rounded-3xl p-8 mb-12">
            <h3 className="text-lg font-semibold mb-4">
              Recent Payments
            </h3>

            {recentPayments.length === 0 ? (
              <p className="text-gray-500">No recent payments.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-gray-600 text-sm">
                      <th className="py-3">Date</th>
                      <th className="py-3">Name</th>
                      <th className="py-3">Category</th>
                      <th className="py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        onClick={() => navigate(`/payments/${payment.id}`)}
                        className="border-b hover:bg-gray-100 cursor-pointer transition"
                      >
                        <td className="py-3">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-medium">
                          {payment.payee_name}
                        </td>
                        <td className="py-3">
                          {payment.category}
                        </td>
                        <td className="py-3 text-right font-semibold text-green-600">
                          ₹{Number(payment.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LATEST STORY */}
          <div className="bg-white shadow-lg rounded-3xl p-8 mb-20">
            <h3 className="text-lg font-semibold mb-3">
              Latest Success Story
            </h3>

            {latestStory ? (
              <div className="p-5 bg-gray-100 rounded-xl">
                <p className="font-medium">
                  {latestStory.title}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(latestStory.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p>No stories available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

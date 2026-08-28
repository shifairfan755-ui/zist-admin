import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const debounce = (fn: Function, delay = 300) => {
  let timeout: any;

  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearchFn = debounce((value: string) => {
    setDebouncedSearch(value);
  }, 300);

  const handleSearchChange = (e: any) => {
    setSearch(e.target.value);
    debouncedSearchFn(e.target.value);
  };

  const loadPayments = async () => {
    setLoading(true);

    let query = supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

    if (categoryFilter) {
      query = query.eq("category", categoryFilter);
    }

    // ✅ SEARCH NOW INCLUDES CHEQUE NO + MODE
    if (debouncedSearch) {
      query = query.or(`
        payee_name.ilike.%${debouncedSearch}%,
        notes.ilike.%${debouncedSearch}%,
        description.ilike.%${debouncedSearch}%,
        cheque_no.ilike.%${debouncedSearch}%,
        mode.ilike.%${debouncedSearch}%
      `);
    }

    const { data } = await query;

    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, [debouncedSearch, categoryFilter]);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const bulkDelete = async () => {
    if (!selected.length) return;

    if (!confirm("Delete selected payments?")) return;

    await supabase
      .from("payments")
      .delete()
      .in("id", selected);

    setSelected([]);
    loadPayments();
  };

  const categories = [
    "Sheep",
    "Cow",
    "Monthly Assistance",
    "Education",
    "Medical",
    "Livelihood Generation",
    "Soft Loan",
    "Salary",
    "Office Expense",
    "Other",
  ];

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Loading Payments...
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6">

        <div className="flex flex-col md:flex-row md:justify-between gap-4">

          <h1 className="text-3xl font-bold text-blue-600">
            Payments
          </h1>

          <div className="flex gap-2 flex-wrap">
            <Link
              to="/payments/add"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              + Add Payment
            </Link>

            <Link
              to="/payments/import"
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Import
            </Link>

            {selected.length > 0 && (
              <button
                onClick={bulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete ({selected.length})
              </button>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search name / cheque / mode..."
            value={search}
            onChange={handleSearchChange}
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="border rounded-xl px-4 py-3"
          >
            <option value="">All Categories</option>

            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-left">Payee</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Cheque No</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() =>
                      toggleSelection(p.id)
                    }
                  />
                </td>

                <td className="p-3">{p.payee_name}</td>

                <td className="p-3 font-semibold text-green-600">
                  ₹{Number(p.amount).toLocaleString()}
                </td>

                {/* ✅ NEW COLUMN */}
                <td className="p-3">
                  {p.cheque_no || "---"}
                </td>

                <td className="p-3">{p.category}</td>

                <td className="p-3">{p.payment_date}</td>

                <td className="p-3 space-x-3">
                  <Link
                    to={`/payments/view/${p.id}`}
                    className="text-blue-600"
                  >
                    View
                  </Link>

                  <Link
                    to={`/payments/edit/${p.id}`}
                    className="text-green-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={async () => {
                      if (
                        !confirm(
                          "Delete this payment?"
                        )
                      )
                        return;

                      await supabase
                        .from("payments")
                        .delete()
                        .eq("id", p.id);

                      loadPayments();
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-gray-500"
                >
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
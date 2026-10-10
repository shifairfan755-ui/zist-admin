
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Payment = {
  id: string;
  payee_name?: string | null;
  amount?: number | string | null;
  cheque_no?: string | null;
  category?: string | null;
  payment_date?: string | null;
  notes?: string | null;
  description?: string | null;
  mode?: string | null;
  [key: string]: any;
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track the latest request so older responses cannot replace newer results.
  const requestId = useRef(0);

  // Delay searching briefly while the user types.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPayments = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError("");

    try {
      let query = supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });

      if (categoryFilter) {
        query = query.eq("category", categoryFilter);
      }

      // Escape special characters used by PostgREST filter syntax.
      const term = debouncedSearch.replace(/[\\%_,().]/g, (char) => `\\${char}`);

      if (term) {
        query = query.or(
          `payee_name.ilike.%${term}%,notes.ilike.%${term}%,description.ilike.%${term}%,cheque_no.ilike.%${term}%,mode.ilike.%${term}%`
        );
      }

      const { data, error: queryError } = await query;

      // Ignore results from a request that is no longer the latest.
      if (currentRequest !== requestId.current) return;

      if (queryError) {
        throw queryError;
      }

      setPayments((data ?? []) as Payment[]);
    } catch (err) {
      if (currentRequest !== requestId.current) return;

      console.error("Failed to load payments:", err);
      setError("Unable to load payments. Please try again.");
      setPayments([]);
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [categoryFilter, debouncedSearch]);

  useEffect(() => {
    void loadPayments();

    return () => {
      // Invalidate any request that is still running after this effect changes.
      requestId.current += 1;
    };
  }, [loadPayments]);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm("Delete selected payments?")) return;

    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .in("id", selected);

    if (deleteError) {
      console.error("Failed to delete payments:", deleteError);
      window.alert("Unable to delete selected payments.");
      return;
    }

    setSelected([]);
    await loadPayments();
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

  return (
    <div className="p-3 md:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <h1 className="text-3xl font-bold text-blue-600">
            Payments
          </h1>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/payments/add"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              + Add Payment
            </Link>

            <Link
              to="/payments/import"
              className="rounded-lg bg-green-600 px-4 py-2 text-white"
            >
              Import
            </Link>

            {selected.length > 0 && (
              <button
                type="button"
                onClick={bulkDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Delete ({selected.length})
              </button>
            )}
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="search"
            placeholder="Search name / cheque / mode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            aria-label="Search payments by name, cheque number, notes, description or mode"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-w-0 rounded-xl border px-4 py-3"
            aria-label="Filter payments by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Keep the search input visible while loading. */}
        {loading && (
          <p className="text-sm text-gray-500" role="status">
            Updating payments...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadPayments()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* PAYMENTS TABLE */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow">
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
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggleSelection(p.id)}
                    aria-label={`Select payment for ${p.payee_name || "unnamed payee"}`}
                  />
                </td>

                <td className="p-3">{p.payee_name || "---"}</td>

                <td className="p-3 font-semibold text-green-600">
                  ₹{Number(p.amount ?? 0).toLocaleString("en-IN")}
                </td>

                <td className="p-3">{p.cheque_no || "---"}</td>
                <td className="p-3">{p.category || "---"}</td>
                <td className="p-3">{p.payment_date || "---"}</td>

                <td className="space-x-3 whitespace-nowrap p-3">
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
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Delete this payment?")) return;

                      const { error: deleteError } = await supabase
                        .from("payments")
                        .delete()
                        .eq("id", p.id);

                      if (deleteError) {
                        console.error("Failed to delete payment:", deleteError);
                        window.alert("Unable to delete this payment.");
                        return;
                      }

                      setSelected((prev) =>
                        prev.filter((id) => id !== p.id)
                      );

                      await loadPayments();
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  {error
                    ? "Payments could not be loaded."
                    : debouncedSearch || categoryFilter
                      ? "No payments match your search or filter."
                      : "No payments found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

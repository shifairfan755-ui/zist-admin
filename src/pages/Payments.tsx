import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [loading, setLoading] = useState(true);

  /** Load all payments */
  const loadPayments = async () => {
    setLoading(true);

    let query = supabase.from("payments").select("*").order("payment_date", { ascending: false });

    if (categoryFilter) query = query.eq("category", categoryFilter);
    if (search) {
      query = query.or(
        `payee_name.ilike.%${search}%,notes.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (!error && data) {
      setPayments(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, [search, categoryFilter]);

  /** Handle Checkbox Toggle */
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  /** Bulk Delete */
  const bulkDelete = async () => {
    if (!selected.length) {
      alert("No items selected");
      return;
    }

    if (!confirm("Delete selected payments?")) return;

    const { error } = await supabase.from("payments").delete().in("id", selected);

    if (!error) {
      alert("Deleted successfully");
      setSelected([]);
      loadPayments();
    }
  };

  /** Export CSV */
  const exportCSV = () => {
    if (!payments.length) return;

    const header = Object.keys(payments[0]).join(",");
    const rows = payments.map((p) => Object.values(p).join(",")).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + rows;
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "payments_export.csv";
    link.click();
  };

  if (loading)
    return <p className="p-6 text-center text-xl font-semibold">Loading Payments...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Payments</h1>

        <div className="flex gap-3">
          <Link
            to="/add-payment"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Payment
          </Link>

          <Link
            to="/import-payments"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Import
          </Link>

          <button
            onClick={exportCSV}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
          >
            Export
          </button>

          {selected.length > 0 && (
            <button
              onClick={bulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Delete Selected ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
        <input
          placeholder="Search payment, note, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-1/3"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="Education">Education</option>
          <option value="Medical">Medical</option>
          <option value="Livelihood Generation">Livelihood Generation</option>
          <option value="Monthly Assistance">Monthly Assistance</option>
          <option value="Food Kit">Food Kit</option>
          <option value="Office Rent">Office Rent</option>
          <option value="Salary">Salary</option>
          <option value="Livestock">Livestock</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-left">Payee</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-100">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggleSelection(p.id)}
                  />
                </td>

                <td className="p-3">{p.payee_name}</td>
                <td className="p-3">₹{p.amount?.toLocaleString()}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.payment_date}</td>

                <td className="p-3 flex gap-3">
                  <Link to={`/view-payment/${p.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>

                  <Link to={`/edit-payment/${p.id}`} className="text-green-600 hover:underline">
                    Edit
                  </Link>

                  <button
                    onClick={async () => {
                      if (!confirm("Delete this payment?")) return;

                      await supabase.from("payments").delete().eq("id", p.id);
                      loadPayments();
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!payments.length && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-600">
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

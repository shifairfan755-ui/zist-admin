import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function SoftLoans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();

  // -------------------------------------
  // LOAD SOFT LOANS
  // -------------------------------------
  const loadLoans = async () => {
    const { data, error } = await supabase
      .from("soft_loans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load soft loans");
    } else {
      setLoans(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLoans();
  }, []);

  // -------------------------------------
  // SEARCH FILTER
  // -------------------------------------
  const filtered = loans.filter((loan) => {
    const t = search.toLowerCase();
    return (
      loan.name?.toLowerCase().includes(t) ||
      loan.phone?.toLowerCase().includes(t) ||
      loan.address?.toLowerCase().includes(t) ||
      loan.status?.toLowerCase().includes(t)
    );
  });

  // -------------------------------------
  // TOGGLE ONE
  // -------------------------------------
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // -------------------------------------
  // SELECT ALL
  // -------------------------------------
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      const allIds = filtered.map((loan) => loan.id);
      setSelected(allIds);
      setSelectAll(true);
    }
  };

  // -------------------------------------
  // BULK DELETE
  // -------------------------------------
  const deleteSelected = async () => {
    if (selected.length === 0) return;

    const yes = confirm(
      `Delete ${selected.length} selected soft loans?\nThis cannot be undone.`
    );
    if (!yes) return;

    const { error } = await supabase
      .from("soft_loans")
      .delete()
      .in("id", selected);

    if (error) {
      toast.error("Failed to delete selected loans");
      return;
    }

    toast.success("Deleted successfully");
    setSelected([]);
    setSelectAll(false);
    loadLoans();
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Soft Loans</h1>

        <div className="flex gap-3">
          {selected.length > 0 && (
            <button
              onClick={deleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700"
            >
              Delete Selected ({selected.length})
            </button>
          )}

          <Link
            to="/add-soft-loan"
            className="bg-green-700 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800"
          >
            + Add Soft Loan
          </Link>
        </div>
      </div>

      <input
        placeholder="🔍 Search soft loans..."
        className="border p-3 rounded-lg w-full mb-4 shadow-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3 border">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No soft loans found.
                </td>
              </tr>
            )}

            {filtered.map((loan) => (
              <tr
                key={loan.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/view-soft-loan/${loan.id}`)}
              >
                <td
                  className="p-3 border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(loan.id)}
                    onChange={() => toggleSelect(loan.id)}
                  />
                </td>

                <td className="p-3 border font-semibold">{loan.name}</td>
                <td className="p-3 border">{loan.phone}</td>
                <td className="p-3 border text-green-700 font-bold">
                  ₹{loan.amount?.toLocaleString()}
                </td>
                <td className="p-3 border">{loan.status}</td>

                <td
                  className="p-3 border text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link to={`/view-soft-loan/${loan.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

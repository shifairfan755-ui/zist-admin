import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function SoftLoans() {
  const [loans, setLoans] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [selected, setSelected] =
    useState<string[]>([]);

  const navigate =
    useNavigate();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans =
    async () => {
      setLoading(true);

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "soft_loans"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {
        toast.error(
          "Failed to load soft loans"
        );
      } else {
        setLoans(
          data || []
        );
      }

      setLoading(false);
    };

  const filtered =
    loans.filter(
      (loan) => {
        const q =
          search.toLowerCase();

        const matchSearch =
          loan.name
            ?.toLowerCase()
            .includes(q) ||
          loan.phone
            ?.toLowerCase()
            .includes(q) ||
          loan.address
            ?.toLowerCase()
            .includes(q);

        const matchStatus =
          statusFilter ===
            "" ||
          loan.status ===
            statusFilter;

        return (
          matchSearch &&
          matchStatus
        );
      }
    );

  const toggleSelect = (
    id: string
  ) => {
    setSelected(
      (prev) =>
        prev.includes(
          id
        )
          ? prev.filter(
              (
                x
              ) =>
                x !== id
            )
          : [
              ...prev,
              id,
            ]
    );
  };

  const deleteSelected =
    async () => {
      if (
        selected.length ===
        0
      )
        return;

      const yes =
        confirm(
          `Delete ${selected.length} selected loans?`
        );

      if (!yes)
        return;

      const {
        error,
      } =
        await supabase
          .from(
            "soft_loans"
          )
          .delete()
          .in(
            "id",
            selected
          );

      if (error) {
        toast.error(
          "Delete failed"
        );
        return;
      }

      toast.success(
        "Deleted successfully"
      );

      setSelected([]);
      loadLoans();
    };

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

  const totalCases =
    loans.length;

  const recovered =
    loans.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.recovered ||
            0
        ),
      0
    );

  const pending =
    totalLoan -
    recovered;

  if (loading) {
    return (
      <div className="p-6 text-center font-semibold">
        Loading...
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
            Manage loan
            records,
            recovery &
            beneficiaries
          </p>
        </div>

        <div className="grid grid-cols-2 md:flex gap-2">
          {selected.length >
            0 && (
            <button
              onClick={
                deleteSelected
              }
              className="px-4 py-3 rounded-xl bg-red-600 text-white text-sm"
            >
              Delete (
              {
                selected.length
              }
              )
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card
          title="Cases"
          value={
            totalCases.toString()
          }
        />

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
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          type="text"
          placeholder="Search loans..."
          value={search}
          onChange={(
            e
          ) =>
            setSearch(
              e.target
                .value
            )
          }
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        />

        <select
          value={
            statusFilter
          }
          onChange={(
            e
          ) =>
            setStatusFilter(
              e.target
                .value
            )
          }
          className="w-full rounded-xl border px-4 py-3"
        >
          <option value="">
            All Status
          </option>
          <option value="Pending">
            Pending
          </option>
          <option value="Running">
            Running
          </option>
          <option value="Completed">
            Completed
          </option>
          <option value="Closed">
            Closed
          </option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4"></th>
              <th className="p-4 text-left">
                Name
              </th>
              <th className="p-4 text-left">
                Phone
              </th>
              <th className="p-4 text-left">
                Amount
              </th>
              <th className="p-4 text-left">
                Status
              </th>
              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length ===
            0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500"
                >
                  No soft
                  loans found.
                </td>
              </tr>
            ) : (
              filtered.map(
                (
                  loan
                ) => (
                  <tr
                    key={
                      loan.id
                    }
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(
                          loan.id
                        )}
                        onChange={() =>
                          toggleSelect(
                            loan.id
                          )
                        }
                      />
                    </td>

                    <td className="p-4 font-medium">
                      {
                        loan.name
                      }
                    </td>

                    <td className="p-4">
                      {
                        loan.phone
                      }
                    </td>

                    <td className="p-4 text-green-700 font-semibold">
                      ₹
                      {Number(
                        loan.amount
                      ).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {
                        loan.status
                      }
                    </td>

                    <td className="p-4">
                      <Link
                        to={`/soft-loans/view/${loan.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.length ===
        0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500">
            No soft loans
            found.
          </div>
        ) : (
          filtered.map(
            (loan) => (
              <div
                key={
                  loan.id
                }
                className="bg-white rounded-2xl shadow p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {
                        loan.name
                      }
                    </h3>

                    <p className="text-sm text-slate-500">
                      {
                        loan.phone
                      }
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selected.includes(
                      loan.id
                    )}
                    onChange={() =>
                      toggleSelect(
                        loan.id
                      )
                    }
                  />
                </div>

                <div className="mt-4 text-sm space-y-1 text-slate-600">
                  <p>
                    <span className="font-medium">
                      Amount:
                    </span>{" "}
                    ₹
                    {Number(
                      loan.amount
                    ).toLocaleString()}
                  </p>

                  <p>
                    <span className="font-medium">
                      Status:
                    </span>{" "}
                    {
                      loan.status
                    }
                  </p>
                </div>

                <Link
                  to={`/soft-loans/view/${loan.id}`}
                  className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm"
                >
                  View
                </Link>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <h3 className="text-lg font-bold text-slate-800 mt-1">
        {value}
      </h3>
    </div>
  );
}
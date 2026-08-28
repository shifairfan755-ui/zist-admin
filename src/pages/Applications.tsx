import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function Applications() {
  const [
    applications,
    setApplications,
  ] = useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const location =
    useLocation();

  useEffect(() => {
    loadApplications();
  }, [location.pathname]);

  const loadApplications =
    async () => {
      setLoading(true);

      const { data } =
        await supabase
          .from(
            "applications"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      setApplications(
        data || []
      );

      setLoading(false);
    };

  const deleteApplication =
    async (
      id: string
    ) => {
      const yes =
        confirm(
          "Delete this application?"
        );

      if (!yes)
        return;

      await supabase
        .from(
          "applications"
        )
        .delete()
        .eq("id", id);

      setApplications(
        (prev) =>
          prev.filter(
            (a) =>
              a.id !== id
          )
      );

      toast.success(
        "Application deleted"
      );
    };

  const filtered =
    applications.filter(
      (a) =>
        (
          (a.applicant_name ||
            "") +
          (a.application_no ||
            "") +
          (a.phone || "") +
          (a.address ||
            "")
        )
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
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
            Applications
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage submitted
            assistance requests
          </p>
        </div>

        <Link
          to="/applications/new"
          className="w-full md:w-auto text-center px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700"
        >
          + New Application
        </Link>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name, application no, phone..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total"
          value={
            applications.length
          }
        />

        <StatCard
          title="Showing"
          value={
            filtered.length
          }
        />

        <StatCard
          title="Today"
          value={
            applications.filter(
              (a) =>
                new Date(
                  a.created_at
                ).toDateString() ===
                new Date().toDateString()
            ).length
          }
        />

        <StatCard
          title="This Month"
          value={
            applications.filter(
              (a) =>
                new Date(
                  a.created_at
                ).getMonth() ===
                  new Date().getMonth() &&
                new Date(
                  a.created_at
                ).getFullYear() ===
                  new Date().getFullYear()
            ).length
          }
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4 text-left">
                APP No
              </th>
              <th className="p-4 text-left">
                Name
              </th>
              <th className="p-4 text-left">
                Phone
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
                  colSpan={4}
                  className="p-8 text-center text-slate-500"
                >
                  No
                  applications
                  found.
                </td>
              </tr>
            ) : (
              filtered.map(
                (app) => (
                  <tr
                    key={app.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4 font-medium">
                      {
                        app.application_no
                      }
                    </td>

                    <td className="p-4">
                      {
                        app.applicant_name
                      }
                    </td>

                    <td className="p-4">
                      {
                        app.phone
                      }
                    </td>

                    <td className="p-4 space-x-3">
                      <Link
                        to={`/applications/view/${app.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>

                      <Link
                        to={`/applications/edit/${app.id}`}
                        className="text-green-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          deleteApplication(
                            app.id
                          )
                        }
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
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
            No
            applications
            found.
          </div>
        ) : (
          filtered.map(
            (app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl shadow p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      APP #
                      {
                        app.application_no
                      }
                    </p>

                    <h3 className="font-semibold text-slate-800 mt-1">
                      {
                        app.applicant_name
                      }
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {
                        app.phone
                      }
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Link
                    to={`/applications/view/${app.id}`}
                    className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm"
                  >
                    View
                  </Link>

                  <Link
                    to={`/applications/edit/${app.id}`}
                    className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() =>
                      deleteApplication(
                        app.id
                      )
                    }
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

/* Components */

function StatCard({
  title,
  value,
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="text-2xl font-bold text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}
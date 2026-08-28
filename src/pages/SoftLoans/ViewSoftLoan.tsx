import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { generateLoanPDF } from "./LoanPDF";

export default function ViewSoftLoan() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [loan, setLoan] =
    useState<any>(null);

  const [
    installments,
    setInstallments,
  ] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData =
    async () => {
      setLoading(true);

      await Promise.all([
        loadLoan(),
        loadInstallments(),
      ]);

      setLoading(false);
    };

  const loadLoan =
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "soft_loans"
          )
          .select("*")
          .eq("id", id)
          .single();

      if (
        error ||
        !data
      ) {
        toast.error(
          "Loan not found"
        );

        navigate(
          "/soft-loans"
        );

        return;
      }

      setLoan(data);
    };

  const loadInstallments =
    async () => {
      const {
        data,
      } =
        await supabase
          .from(
            "soft_loan_installments"
          )
          .select("*")
          .eq(
            "loan_id",
            id
          )
          .order("date", {
            ascending:
              false,
          });

      setInstallments(
        data || []
      );
    };

  const deleteLoan =
    async () => {
      const yes =
        confirm(
          "Delete this loan permanently?"
        );

      if (!yes) return;

      const {
        error,
      } =
        await supabase
          .from(
            "soft_loans"
          )
          .delete()
          .eq("id", id);

      if (error) {
        toast.error(
          "Delete failed"
        );
        return;
      }

      toast.success(
        "Loan deleted"
      );

      navigate(
        "/soft-loans"
      );
    };

  if (loading) {
    return (
      <div className="p-6 text-center font-semibold">
        Loading...
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-6 text-red-600">
        Loan not found
      </div>
    );
  }

  const totalPaid =
    installments.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount ||
            0
        ),
      0
    );

  const remaining =
    Number(
      loan.amount ||
        0
    ) - totalPaid;

  const percentPaid =
    Number(
      loan.amount
    ) > 0
      ? Math.min(
          100,
          Math.round(
            (totalPaid /
              Number(
                loan.amount
              )) *
              100
          )
        )
      : 0;

  const badgeColor =
    (
      status: string
    ) => {
      switch (
        status
      ) {
        case "Paid on Time":
          return "bg-green-100 text-green-700";

        case "Defaulter":
          return "bg-red-100 text-red-700";

        case "Paying in Installments":
          return "bg-yellow-100 text-yellow-700";

        case "Closed as Imdaad":
          return "bg-blue-100 text-blue-700";

        default:
          return "bg-slate-100 text-slate-700";
      }
    };

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto">
      {/* Back */}
      <Link
        to="/soft-loans"
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to
        Soft Loans
      </Link>

      {/* Title */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Soft Loan
          Details
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Complete loan
          profile and
          repayment
          history
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Borrower */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {
                  loan.name
                }
              </h2>

              {loan.parentage && (
                <p className="text-slate-500 mt-1">
                  S/O{" "}
                  {
                    loan.parentage
                  }
                </p>
              )}

              {loan.phone && (
                <p className="text-slate-600 mt-2">
                  📞{" "}
                  {
                    loan.phone
                  }
                </p>
              )}

              {loan.address && (
                <p className="text-slate-600 mt-1">
                  📍{" "}
                  {
                    loan.address
                  }
                </p>
              )}
            </div>

            <span
              className={`px-3 py-2 rounded-full text-sm font-semibold w-fit ${badgeColor(
                loan.status
              )}`}
            >
              {
                loan.status
              }
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <StatCard
              label="Loan Amount"
              value={`₹${Number(
                loan.amount
              ).toLocaleString()}`}
            />

            <StatCard
              label="Recovered"
              value={`₹${totalPaid.toLocaleString()}`}
            />

            <StatCard
              label="Balance"
              value={`₹${remaining.toLocaleString()}`}
            />

            <StatCard
              label="Date"
              value={new Date(
                loan.loan_date
              ).toLocaleDateString()}
            />
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">
                Recovery
                Progress
              </span>

              <span>
                {
                  percentPaid
                }
                %
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{
                  width: `${percentPaid}%`,
                }}
              />
            </div>
          </div>

          {loan.recommendation && (
            <div className="mt-6 text-sm text-slate-600">
              <span className="font-semibold">
                Recommended
                By:
              </span>{" "}
              {
                loan.recommendation
              }
            </div>
          )}

          {loan.notes && (
            <div className="mt-3 text-sm text-slate-600">
              <span className="font-semibold">
                Notes:
              </span>{" "}
              {
                loan.notes
              }
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow p-5 md:p-6">
          <h3 className="font-semibold text-lg mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <Link
              to={`/soft-loans/edit/${loan.id}`}
              className="block text-center w-full px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Loan
            </Link>

            <Link
              to={`/soft-loans/installment/add/${loan.id}`}
              className="block text-center w-full px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              + Add Installment
            </Link>

            <button
              onClick={() =>
                generateLoanPDF(
                  loan,
                  installments
                )
              }
              className="w-full px-4 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
            >
              Download PDF
            </button>

            <button
              onClick={
                deleteLoan
              }
              className="w-full px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Delete Loan
            </button>
          </div>
        </div>
      </div>

      {/* Installments */}
      <div className="mt-6 bg-white rounded-2xl shadow p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Installment
            History
          </h2>

          <span className="text-sm text-slate-500">
            {
              installments.length
            }{" "}
            records
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 text-left">
                  Date
                </th>
                <th className="p-3 text-left">
                  Amount
                </th>
                <th className="p-3 text-left">
                  Notes
                </th>
              </tr>
            </thead>

            <tbody>
              {installments.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={
                      3
                    }
                    className="p-6 text-center text-slate-500"
                  >
                    No
                    installments
                    yet
                  </td>
                </tr>
              ) : (
                installments.map(
                  (
                    item
                  ) => (
                    <tr
                      key={
                        item.id
                      }
                      className="border-t"
                    >
                      <td className="p-3">
                        {new Date(
                          item.date
                        ).toLocaleDateString()}
                      </td>

                      <td className="p-3 font-semibold text-green-700">
                        ₹
                        {Number(
                          item.amount
                        ).toLocaleString()}
                      </td>

                      <td className="p-3">
                        {item.notes ||
                          "—"}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {installments.length ===
          0 ? (
            <div className="text-center text-slate-500 py-4">
              No
              installments
              yet
            </div>
          ) : (
            installments.map(
              (
                item
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="border rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">
                      ₹
                      {Number(
                        item.amount
                      ).toLocaleString()}
                    </p>

                    <p className="text-sm text-slate-500">
                      {new Date(
                        item.date
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 mt-2">
                    {item.notes ||
                      "No notes"}
                  </p>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* Reusable */

function StatCard({
  label,
  value,
}: any) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="font-bold text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}
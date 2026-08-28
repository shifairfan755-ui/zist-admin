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

export default function EditInstallment() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      loan_id: "",
      date: "",
      amount: "",
      notes: "",
    });

  useEffect(() => {
    loadInstallment();
  }, [id]);

  const loadInstallment =
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "soft_loan_installments"
          )
          .select("*")
          .eq("id", id)
          .single();

      if (
        error ||
        !data
      ) {
        toast.error(
          "Installment not found"
        );

        navigate(
          "/soft-loans"
        );

        return;
      }

      setForm({
        loan_id:
          data.loan_id ||
          "",
        date:
          data.date ||
          "",
        amount:
          data.amount?.toString() ||
          "",
        notes:
          data.notes ||
          "",
      });

      setLoading(false);
    };

  const handleChange = (
    e: any
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const updateInstallment =
    async (
      e: any
    ) => {
      e.preventDefault();

      if (
        !form.amount ||
        !form.date
      ) {
        toast.error(
          "Amount and date are required"
        );
        return;
      }

      setSaving(true);

      const {
        error,
      } =
        await supabase
          .from(
            "soft_loan_installments"
          )
          .update({
            date:
              form.date,
            amount:
              Number(
                form.amount
              ),
            notes:
              form.notes ||
              null,
          })
          .eq("id", id);

      setSaving(false);

      if (error) {
        toast.error(
          "Failed to update installment"
        );
        return;
      }

      toast.success(
        "Installment updated successfully"
      );

      navigate(
        `/soft-loans/view/${form.loan_id}`
      );
    };

  if (loading) {
    return (
      <div className="p-6 text-center font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        to={`/soft-loans/view/${form.loan_id}`}
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to Loan
      </Link>

      {/* Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Edit Installment
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Update repayment
          details
        </p>
      </div>

      <form
        onSubmit={
          updateInstallment
        }
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-8"
      >
        {/* Payment Details */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Installment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              name="date"
              value={
                form.date
              }
              onChange={
                handleChange
              }
              required
            />

            <Input
              label="Amount"
              type="number"
              name="amount"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
              required
            />
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Notes
          </h2>

          <TextArea
            label="Optional Notes"
            name="notes"
            value={
              form.notes
            }
            onChange={
              handleChange
            }
            rows={5}
          />
        </section>

        {/* Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/soft-loans/view/${form.loan_id}`
              )
            }
            className="w-full md:w-auto px-5 py-3 rounded-xl border hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Reusable */

function Input(
  props: any
) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {props.label}
        {props.required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <input
        {...props}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function TextArea(
  props: any
) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {props.label}
      </label>

      <textarea
        {...props}
        className="w-full rounded-xl border px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
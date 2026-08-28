import { useState } from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function AddInstallment() {
  const { loanId } =
    useParams();

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      date: new Date()
        .toISOString()
        .split("T")[0],
      amount: "",
      notes: "",
    });

  const handleChange = (
    e: any
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const saveInstallment =
    async (
      e: any
    ) => {
      e.preventDefault();

      if (!loanId) {
        toast.error(
          "Invalid loan reference"
        );
        return;
      }

      if (
        !form.amount
      ) {
        toast.error(
          "Amount is required"
        );
        return;
      }

      setLoading(true);

      const {
        error,
      } =
        await supabase
          .from(
            "soft_loan_installments"
          )
          .insert([
            {
              loan_id:
                loanId,
              date:
                form.date,
              amount:
                Number(
                  form.amount
                ),
              notes:
                form.notes ||
                null,
            },
          ]);

      setLoading(false);

      if (error) {
        toast.error(
          error.message
        );
        return;
      }

      toast.success(
        "Installment added successfully"
      );

      navigate(
        `/soft-loans/view/${loanId}`
      );
    };

  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        to={`/soft-loans/view/${loanId}`}
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to Loan
      </Link>

      {/* Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Add Installment
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Record loan
          repayment
          installment
        </p>
      </div>

      <form
        onSubmit={
          saveInstallment
        }
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-8"
      >
        {/* Installment Details */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Payment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Installment Date"
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
              autoFocus
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
                `/soft-loans/view/${loanId}`
              )
            }
            className="w-full md:w-auto px-5 py-3 rounded-xl border hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : "Save Installment"}
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
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
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
        className="w-full rounded-xl border px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import {
  useNavigate,
  Link,
} from "react-router-dom";

export default function AddSoftLoan() {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      parentage: "",
      phone: "",
      address: "",
      amount: "",
      cheque_no: "",
      recommendation:
        "",
      loan_date: "",
      status:
        "Paying in Installments",
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

  const addLoan =
    async (
      e: any
    ) => {
      e.preventDefault();

      if (
        !form.name ||
        !form.amount
      ) {
        toast.error(
          "Name and amount are required"
        );
        return;
      }

      setLoading(true);

      const {
        error,
      } =
        await supabase
          .from(
            "soft_loans"
          )
          .insert([
            {
              name:
                form.name,
              parentage:
                form.parentage ||
                null,
              phone:
                form.phone ||
                null,
              address:
                form.address ||
                null,
              amount:
                Number(
                  form.amount
                ),
              cheque_no:
                form.cheque_no ||
                null,
              recommendation:
                form.recommendation ||
                null,
              loan_date:
                form.loan_date ||
                new Date()
                  .toISOString()
                  .split(
                    "T"
                  )[0],
              status:
                form.status,
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
        "Soft loan added successfully"
      );

      navigate(
        "/soft-loans"
      );
    };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        to="/soft-loans"
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to Soft
        Loans
      </Link>

      {/* Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Add Soft Loan
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Create new loan
          record with
          beneficiary
          details
        </p>
      </div>

      <form
        onSubmit={
          addLoan
        }
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-8"
      >
        {/* Borrower */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Borrower Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              required
            />

            <Input
              label="Parentage"
              name="parentage"
              value={
                form.parentage
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Phone Number"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Address"
              name="address"
              value={
                form.address
              }
              onChange={
                handleChange
              }
            />
          </div>
        </section>

        {/* Loan */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Loan Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Loan Amount"
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

            <Input
              label="Cheque Number"
              name="cheque_no"
              value={
                form.cheque_no
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Loan Date"
              type="date"
              name="loan_date"
              value={
                form.loan_date
              }
              onChange={
                handleChange
              }
            />

            <Select
              label="Status"
              name="status"
              value={
                form.status
              }
              onChange={
                handleChange
              }
              options={[
                "Paid on Time",
                "Defaulter",
                "Paying in Installments",
                "Closed as Imdaad",
              ]}
            />

            <Input
              label="Recommendation By"
              name="recommendation"
              value={
                form.recommendation
              }
              onChange={
                handleChange
              }
            />
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Notes
          </h2>

          <TextArea
            label="Additional Notes"
            name="notes"
            value={
              form.notes
            }
            onChange={
              handleChange
            }
            rows={4}
          />
        </section>

        {/* Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/soft-loans"
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
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-green-700 text-white hover:bg-green-800 disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : "Add Soft Loan"}
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

function Select(
  props: any
) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {props.label}
      </label>

      <select
        name={
          props.name
        }
        value={
          props.value
        }
        onChange={
          props.onChange
        }
        className="w-full rounded-xl border px-4 py-3"
      >
        {props.options.map(
          (
            item: string
          ) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          )
        )}
      </select>
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
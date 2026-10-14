
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";

const paymentModes = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque",
  "Other",
];

const depositOptions = [
  "Cash held by office",
  "Deposited into ZIST bank account",
  "Other / pending deposit",
];

export default function EditInstallment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    loan_id: "",
    date: "",
    amount: "",
    payment_mode: "",
    reference_number: "",
    received_by: "",
    receipt_number: "",
    deposited_into: "",
    notes: "",
  });

  useEffect(() => {
    const loadInstallment = async () => {
      const { data, error } = await supabase
        .from("soft_loan_installments")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Installment not found");
        navigate("/soft-loans");
        return;
      }

      setForm({
        loan_id: data.loan_id || "",
        date: data.date || "",
        amount: data.amount?.toString() || "",
        payment_mode: data.payment_mode || "",
        reference_number: data.reference_number || "",
        received_by: data.received_by || "",
        receipt_number: data.receipt_number || "",
        deposited_into: data.deposited_into || "",
        notes: data.notes || "",
      });

      setLoading(false);
    };

    loadInstallment();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const updateInstallment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.date || !form.amount || Number(form.amount) <= 0) {
      toast.error("Enter a valid date and amount");
      return;
    }

    if (!form.payment_mode) {
      toast.error("Please select a mode of payment");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("soft_loan_installments")
      .update({
        date: form.date,
        amount: Number(form.amount),
        payment_mode: form.payment_mode,
        reference_number: form.reference_number.trim() || null,
        received_by: form.received_by.trim() || null,
        receipt_number: form.receipt_number.trim() || null,
        deposited_into: form.deposited_into || null,
        notes: form.notes.trim() || null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error(`Failed to update installment: ${error.message}`);
      return;
    }

    toast.success("Installment updated successfully");
    navigate(`/soft-loans/view/${form.loan_id}`);
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
      <Link
        to={`/soft-loans/view/${form.loan_id}`}
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to Loan
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Edit Installment
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update repayment details
        </p>
      </div>

      <form
        onSubmit={updateInstallment}
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-8"
      >
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Payment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Installment Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <Input
              label="Amount Received (₹)"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />

            <Select
              label="Mode of Payment"
              name="payment_mode"
              value={form.payment_mode}
              onChange={handleChange}
              options={paymentModes}
              required
            />

            <Input
              label="Transaction / Reference Number"
              name="reference_number"
              value={form.reference_number}
              onChange={handleChange}
              placeholder="UTR, cheque or transaction number"
            />

            <Input
              label="Received By"
              name="received_by"
              value={form.received_by}
              onChange={handleChange}
              placeholder="Staff member's name"
            />

            <Input
              label="Receipt Number"
              name="receipt_number"
              value={form.receipt_number}
              onChange={handleChange}
              placeholder="Official receipt number"
            />

            <div className="md:col-span-2">
              <Select
                label="Deposited Into"
                name="deposited_into"
                value={form.deposited_into}
                onChange={handleChange}
                options={depositOptions}
                optional
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Notes / Remarks</h2>
          <TextArea
            label="Optional Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
          />
        </section>

        <div className="flex flex-col-reverse md:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/soft-loans/view/${form.loan_id}`)
            }
            className="w-full md:w-auto px-5 py-3 rounded-xl border hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  placeholder?: string;
};

function Input(props: InputProps) {
  const { label, required, ...inputProps } = props;

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...inputProps}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: string[];
  required?: boolean;
  optional?: boolean;
};

function Select(props: SelectProps) {
  const {
    label,
    required,
    optional,
    options,
    ...selectProps
  } = props;

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && (
          <span className="text-slate-500 ml-1">(Optional)</span>
        )}
      </label>
      <select
        {...selectProps}
        required={required}
        className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

type TextAreaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  rows?: number;
};

function TextArea(props: TextAreaProps) {
  const { label, ...textareaProps } = props;

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      <textarea
        {...textareaProps}
        className="w-full rounded-xl border px-4 py-3 resize-y outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

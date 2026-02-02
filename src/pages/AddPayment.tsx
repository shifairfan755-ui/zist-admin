import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export default function AddPayment() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [externalPayee, setExternalPayee] = useState("");

  const [form, setForm] = useState({
    amount: "",
    category: "",
    payment_date: "",
    cheque_no: "",
    description: "",
    notes: "",
    remarks: "",
  });

  const navigate = useNavigate();

  const categories = [
    "Livestock",
    "Medical",
    "Education",
    "Soft Loan",
    "Monthly Assistance",
    "Livelihood Generation",
    "Office Expense",
    "Salary",
    "Office Rent",
    "Petrol Expense",
    "Other",
  ];

  // Fetch beneficiaries list
  const loadBeneficiaries = async () => {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("id, full_name");

    if (!error) setBeneficiaries(data || []);
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validation
    if (!form.amount || !form.category || !form.payment_date) {
      toast.error("Please fill required fields");
      return;
    }

    if (!selectedBeneficiary && !externalPayee) {
      toast.error("Please select beneficiary OR enter external payee");
      return;
    }

    if (selectedBeneficiary && externalPayee) {
      toast.error("Choose ONLY one: Beneficiary OR External Payee");
      return;
    }

    const payload: any = {
      amount: Number(form.amount),
      category: form.category,
      payment_date: form.payment_date,
      cheque_no: form.cheque_no || "",
      description: form.description || "",
      notes: form.notes || "",
      remarks: form.remarks || "",
    };

    if (selectedBeneficiary) {
      payload.beneficiary_id = selectedBeneficiary;
      payload.payee_name = null;
    } else {
      payload.payee_name = externalPayee;
      payload.beneficiary_id = null;
    }

    const { error } = await supabase.from("payments").insert(payload);

    if (error) {
      toast.error("Failed to add payment");
      return;
    }

    toast.success("Payment added successfully!");
    navigate("/payments");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Add Payment</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 border space-y-6"
      >
        {/* PAYEE SECTION */}
        <h2 className="text-xl font-semibold mb-2">Payee</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Beneficiary Dropdown */}
          <div>
            <label className="font-semibold">Select Beneficiary</label>
            <select
              className="border p-2 rounded w-full"
              value={selectedBeneficiary}
              onChange={(e) => {
                setSelectedBeneficiary(e.target.value);
                if (e.target.value) setExternalPayee("");
              }}
            >
              <option value="">-- Select Beneficiary --</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* External Payee Text */}
          <div>
            <label className="font-semibold">External Payee Name</label>
            <input
              className="border p-2 rounded w-full"
              placeholder="Enter name"
              value={externalPayee}
              onChange={(e) => {
                setExternalPayee(e.target.value);
                if (e.target.value) setSelectedBeneficiary("");
              }}
            />
          </div>
        </div>

        {/* PAYMENT DETAILS */}
        <h2 className="text-xl font-semibold mt-4 mb-2">Payment Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="font-semibold">Amount (₹)</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold">Category</label>
            <select
              className="border p-2 rounded w-full"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="font-semibold">Payment Date</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={form.payment_date}
              onChange={(e) =>
                setForm({ ...form, payment_date: e.target.value })
              }
            />
          </div>

          {/* Cheque No */}
          <div>
            <label className="font-semibold">Cheque No</label>
            <input
              className="border p-2 rounded w-full"
              value={form.cheque_no}
              onChange={(e) =>
                setForm({ ...form, cheque_no: e.target.value })
              }
            />
          </div>
        </div>

        {/* TEXT AREAS */}
        <div>
          <label className="font-semibold">Description</label>
          <textarea
            className="border p-2 rounded w-full"
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          ></textarea>
        </div>

        <div>
          <label className="font-semibold">Notes</label>
          <textarea
            className="border p-2 rounded w-full"
            rows={2}
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          ></textarea>
        </div>

        <div>
          <label className="font-semibold">Remarks</label>
          <textarea
            className="border p-2 rounded w-full"
            rows={2}
            value={form.remarks}
            onChange={(e) =>
              setForm({ ...form, remarks: e.target.value })
            }
          ></textarea>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700"
        >
          Save Payment
        </button>
      </form>
    </div>
  );
}

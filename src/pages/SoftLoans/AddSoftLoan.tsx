import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function AddSoftLoan() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    parentage: "",
    phone: "",
    address: "",
    amount: "",
    cheque_no: "",
    recommendation: "",
    loan_date: "",
    status: "Paying in Installments",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addLoan = async () => {
    if (!form.name || !form.amount) {
      toast.error("Name and Loan Amount are required!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("soft_loans").insert({
      name: form.name,
      parentage: form.parentage,
      phone: form.phone,
      address: form.address,
      amount: Number(form.amount),
      cheque_no: form.cheque_no,
      recommendation: form.recommendation,
      loan_date: form.loan_date || new Date().toISOString().split("T")[0],
      status: form.status,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to add soft loan");
      console.log(error);
      return;
    }

    toast.success("Soft Loan added successfully!");
    navigate("/soft-loans");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <Link to="/soft-loans" className="text-blue-600">
        ← Back to Soft Loans
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-3 mb-6">
        Add Soft Loan
      </h1>

      <div className="bg-white p-6 rounded-xl shadow border space-y-6">

        {/* NAME */}
        <InputField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        {/* PARENTAGE */}
        <InputField
          label="Parentage"
          name="parentage"
          value={form.parentage}
          onChange={handleChange}
        />

        {/* PHONE */}
        <InputField
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        {/* ADDRESS */}
        <InputField
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
        />

        {/* AMOUNT */}
        <InputField
          label="Loan Amount"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          required
        />

        {/* CHEQUE */}
        <InputField
          label="Cheque Number"
          name="cheque_no"
          value={form.cheque_no}
          onChange={handleChange}
        />

        {/* RECOMMENDATION */}
        <InputField
          label="Recommendation By"
          name="recommendation"
          value={form.recommendation}
          onChange={handleChange}
        />

        {/* LOAN DATE */}
        <InputField
          label="Loan Date"
          name="loan_date"
          type="date"
          value={form.loan_date}
          onChange={handleChange}
        />

        {/* STATUS */}
        <div>
          <label className="text-gray-600 text-sm">Loan Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-3 rounded-lg w-full mt-1"
          >
            <option value="Paid on Time">Paid on Time</option>
            <option value="Defaulter">Defaulter</option>
            <option value="Paying in Installments">Paying in Installments</option>
            <option value="Closed as Imdaad">Closed as Imdaad</option>
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={addLoan}
          disabled={loading}
          className="bg-green-700 text-white px-5 py-3 rounded-lg shadow hover:bg-green-800 w-full text-lg"
        >
          {loading ? "Saving..." : "Add Soft Loan"}
        </button>
      </div>
    </div>
  );
}

/* REUSABLE INPUT FIELD */
function InputField({ label, name, value, onChange, type = "text", required = false }: any) {
  return (
    <div>
      <label className="text-gray-600 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="border p-3 rounded-lg w-full mt-1"
      />
    </div>
  );
}

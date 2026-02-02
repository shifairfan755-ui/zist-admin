import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function EditSoftLoan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    parentage: "",
    phone: "",
    address: "",
    amount: "",
    cheque_no: "",
    recommendation: "",
    loan_date: "",
    status: "",
  });

  const loadLoan = async () => {
    const { data, error } = await supabase
      .from("soft_loans")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Loan not found");
      navigate("/soft-loans");
      return;
    }

    setForm({
      name: data.name,
      parentage: data.parentage,
      phone: data.phone,
      address: data.address,
      amount: data.amount,
      cheque_no: data.cheque_no,
      recommendation: data.recommendation,
      loan_date: data.loan_date,
      status: data.status,
    });

    setLoading(false);
  };

  useEffect(() => {
    loadLoan();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateLoan = async () => {
    if (!form.name || !form.amount) {
      toast.error("Name and Loan Amount are required!");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("soft_loans")
      .update({
        name: form.name,
        parentage: form.parentage,
        phone: form.phone,
        address: form.address,
        amount: Number(form.amount),
        cheque_no: form.cheque_no,
        recommendation: form.recommendation,
        loan_date: form.loan_date,
        status: form.status,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error("Update failed");
      return;
    }

    toast.success("Soft Loan updated successfully!");
    navigate(`/view-soft-loan/${id}`);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <Link to={`/view-soft-loan/${id}`} className="text-blue-600">
        ← Back to Loan Details
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-3 mb-6">
        Edit Soft Loan
      </h1>

      <div className="bg-white p-6 rounded-xl shadow border space-y-6">

        <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} />
        <InputField label="Parentage" name="parentage" value={form.parentage} onChange={handleChange} />
        <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />
        <InputField label="Address" name="address" value={form.address} onChange={handleChange} />
        <InputField label="Loan Amount" type="number" name="amount" value={form.amount} onChange={handleChange} />

        <InputField label="Cheque Number" name="cheque_no" value={form.cheque_no} onChange={handleChange} />
        <InputField label="Recommendation" name="recommendation" value={form.recommendation} onChange={handleChange} />
        <InputField label="Loan Date" type="date" name="loan_date" value={form.loan_date} onChange={handleChange} />

        <div>
          <label className="text-gray-600 text-sm">Status</label>
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

        <button
          onClick={updateLoan}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 w-full text-lg"
        >
          {saving ? "Saving..." : "Update Loan"}
        </button>
      </div>
    </div>
  );
}

/* Input Reusable Component */
function InputField({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-gray-600 text-sm">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="border p-3 rounded-lg w-full mt-1"
      />
    </div>
  );
}

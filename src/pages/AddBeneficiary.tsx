import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AddBeneficiary() {
  const [formData, setFormData] = useState({
    ben_no: "",
    full_name: "",
    parentage: "",
    phone: "",
    address: "",
    age: "",
    district: "",
    category: "",
    quantity_given: "",
    current_status: "",
    amount: "",
    remarks: "",
    notes: "",
  });

  const categories = [
    "Sheep Unit",
    "Cow",
    "Tailoring Unit",
    "Educational Aid",
    "Medical Support",
    "Widow Support",
    "Marriage Assistance",
    "Monthly Assistance",
    "Orphan Support",
    "Emergency Relief",
    "Other"
  ];

  const statuses = [
    "Active",
    "Pending",
    "Completed",
    "In Progress",
    "Rejected",
    "On Hold",
    "Verified",
    "New"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("beneficiaries").insert([formData]);

    if (error) {
      console.error(error);
      alert("Error saving beneficiary");
      return;
    }

    alert("Beneficiary added successfully!");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        Add New Beneficiary
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl border border-purple-200">

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ID / No */}
          <div>
            <label className="font-semibold text-purple-700">ID / No (ZIST-00001)</label>
            <input
              type="text"
              name="ben_no"
              value={formData.ben_no}
              onChange={handleChange}
              placeholder="ZIST-00001"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="font-semibold text-purple-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Parentage */}
          <div>
            <label className="font-semibold text-purple-700">Parentage</label>
            <input
              type="text"
              name="parentage"
              value={formData.parentage}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="font-semibold text-purple-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="font-semibold text-purple-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Age */}
          <div>
            <label className="font-semibold text-purple-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* District */}
          <div>
            <label className="font-semibold text-purple-700">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold text-purple-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Quantity Given */}
          <div>
            <label className="font-semibold text-purple-700">Quantity Given</label>
            <input
              type="number"
              name="quantity_given"
              value={formData.quantity_given}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Status */}
          <div>
            <label className="font-semibold text-purple-700">Current Status</label>
            <select
              name="current_status"
              value={formData.current_status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="font-semibold text-purple-700">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="font-semibold text-purple-700">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="2"
            ></textarea>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="font-semibold text-purple-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="2"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg w-full font-bold shadow"
            >
              Save Beneficiary
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

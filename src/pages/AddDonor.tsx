import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function AddDonor() {
  const navigate = useNavigate();

  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!donorName) {
      toast.error("Donor name is required");
      return;
    }

    const { error } = await supabase
      .from("donors")
      .insert([
        {
          donor_name: donorName,
          phone,
          address,
        },
      ]);

    if (error) {
      console.error(error);
      toast.error("Failed to add donor");
      return;
    }

    toast.success("Donor added successfully!");
    navigate("/donors");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link to="/donors" className="text-blue-600">
        ← Back to Donors
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Add New Donor
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 border space-y-6"
      >
        {/* NAME */}
        <div>
          <label className="block mb-2 font-medium">Full Name *</label>
          <input
            type="text"
            className="w-full border p-3 rounded-lg"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Donor full name"
            required
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="block mb-2 font-medium">Phone</label>
          <input
            type="text"
            className="w-full border p-3 rounded-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
          />
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block mb-2 font-medium">Address</label>
          <textarea
            className="w-full border p-3 rounded-lg h-28"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
          ></textarea>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg text-lg shadow hover:bg-green-700"
        >
          Save Donor
        </button>
      </form>
    </div>
  );
}

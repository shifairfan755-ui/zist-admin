import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddBeneficiary() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);

  const [form, setForm] = useState({
    ben_no: "",
    full_name: "",
    parentage: "",
    phone: "",
    address: "",
    category: "",
    current_status: "",
    quantity: "",
    amount: "",
    remarks: "",
    notes: "",
    age: "",
    district: "",
    amount_sanctioned: "",
  });

  /* 🔥 LOAD AUTH TOKEN BEFORE PAGE DOES ANYTHING */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/login");
        return;
      }
      setSession(data.session);
      setSessionLoaded(true);
    });
  }, []);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const generateBenNo = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!session) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    const token = session.access_token;
    let photo_url = null;

    try {
      /* ---------------------- UPLOAD PHOTO ---------------------- */
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const finalBenNo = form.ben_no || generateBenNo();
        const filePath = `ben_${finalBenNo}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("beneficiary-photos")
          .upload(filePath, photoFile, {
            headers: {
              Authorization: `Bearer ${token}`, // 🔥 ADD TOKEN
            },
          });

        if (uploadError) {
          alert("Photo upload failed");
          setLoading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("beneficiary-photos")
          .getPublicUrl(filePath);

        photo_url = urlData.publicUrl;
      }

      /* ---------------------- INSERT INTO DB ---------------------- */
      const { error } = await supabase
        .from("beneficiaries")
        .insert({
          ben_no: form.ben_no || generateBenNo(),
          full_name: form.full_name,
          parentage: form.parentage,
          phone: form.phone,
          address: form.address,
          category: form.category,
          current_status: form.current_status,
          quantity: form.quantity,
          amount: form.amount,
          remarks: form.remarks,
          notes: form.notes,
          age: form.age,
          district: form.district,
          amount_sanctioned: form.amount_sanctioned,
          photo_url,
          created_at: new Date(),
        })
        .single();

      if (error) {
        console.log(error);
        alert("Failed to add beneficiary");
        setLoading(false);
        return;
      }

      alert("Beneficiary added successfully!");
      navigate("/beneficiaries");
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  if (!sessionLoaded) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Add Beneficiary
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* your entire form same as before */}
      </form>
    </div>
  );
}

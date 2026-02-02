import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BeneficiaryProfile() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: beneficiary, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setData(beneficiary);
    };

    fetchData();
  }, [id]);

  if (!data)
    return (
      <div className="p-10 text-center text-gray-500 text-xl">
        Loading profile...
      </div>
    );

  return (
    <div className="p-10 max-w-5xl mx-auto">

      {/* Back Link */}
      <Link to="/beneficiaries" className="text-purple-600">
        ← Back to Beneficiaries
      </Link>

      <h1 className="text-3xl font-bold text-purple-700 mt-4 mb-8">
        Beneficiary Profile
      </h1>

      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border">

        <div className="flex gap-10 items-start">

          {/* Photo */}
          <div>
            <img
              src={data.photo_url || "/placeholder-profile.png"}
              alt="Profile"
              className="w-40 h-40 rounded-xl object-cover border shadow-sm"
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-4 w-full">

            <Detail label="Beneficiary No" value={data.ben_no} />
            <Detail label="Full Name" value={data.full_name} />
            <Detail label="Parentage" value={data.parentage} />
            <Detail label="Phone" value={data.phone} />
            <Detail label="Address" value={data.address} />
            <Detail label="District" value={data.district} />
            <Detail label="Age" value={data.age} />
            <Detail label="Category" value={data.category} />
            <Detail label="Status" value={data.status} />
            <Detail label="Quantity Given" value={data.quantity_given} />

          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-10">
          <Link
            to={`/edit-beneficiary/${data.id}`}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700"
          >
            Edit Beneficiary
          </Link>
        </div>
      </div>
    </div>
  );
}

/* Helper Component */
function Detail({ label, value }: any) {
  return (
    <div>
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
      <p className="text-lg text-gray-800 font-medium">{value || "---"}</p>
    </div>
  );
}

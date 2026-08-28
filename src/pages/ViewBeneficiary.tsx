import { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ViewBeneficiary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ben, setBen] =
    useState<any>(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const {
      data,
      error,
    } = await supabase
      .from(
        "beneficiaries"
      )
      .select("*")
      .eq("id", id)
      .single();

    if (
      error ||
      !data
    ) {
      alert(
        "Beneficiary not found"
      );
      navigate(
        "/beneficiaries"
      );
      return;
    }

    setBen(data);
    setLoading(false);
  };

  const deleteBeneficiary =
    async () => {
      const yes =
        window.confirm(
          "Delete beneficiary permanently?"
        );

      if (!yes)
        return;

      try {
        if (
          ben.photo_url
        ) {
          const path =
            ben.photo_url.split(
              "/object/public/beneficiary-photos/"
            )[1];

          if (path) {
            await supabase.storage
              .from(
                "beneficiary-photos"
              )
              .remove([
                path,
              ]);
          }
        }

        await supabase
          .from(
            "beneficiaries"
          )
          .delete()
          .eq("id", id);

        navigate(
          "/beneficiaries"
        );
      } catch {
        alert(
          "Delete failed"
        );
      }
    };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!ben) {
    return (
      <div className="p-6">
        Not found
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto">
      {/* Back */}
      <Link
        to="/beneficiaries"
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to
        Beneficiaries
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow p-5 md:p-8 mt-4">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex gap-5 items-start">
            {ben.photo_url ? (
              <img
                src={
                  ben.photo_url
                }
                alt="Beneficiary"
                className="w-28 h-36 md:w-32 md:h-40 object-cover rounded-2xl border"
              />
            ) : (
              <div className="w-28 h-36 md:w-32 md:h-40 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-500">
                {ben.full_name
                  ?.charAt(
                    0
                  )}
              </div>
            )}

            <div>
              <p className="text-sm text-slate-500">
                Beneficiary #
                {ben.ben_no}
              </p>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
                {
                  ben.full_name
                }
              </h1>

              <p className="text-slate-600 mt-1">
                {ben.parentage
                  ? `S/o ${ben.parentage}`
                  : "---"}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge>
                  {
                    ben.category
                  }
                </Badge>

                <Badge gray>
                  {
                    ben.current_status
                  }
                </Badge>

                <Badge gray>
                  {
                    ben.district
                  }
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
            <Link
              to={`/beneficiaries/edit/${ben.id}`}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white text-center hover:bg-blue-700"
            >
              Edit
            </Link>

            <button
              onClick={
                deleteBeneficiary
              }
              className="px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <InfoCard title="Personal Details">
          <Row
            label="Phone"
            value={
              ben.phone
            }
          />
          <Row
            label="Age"
            value={
              ben.age
            }
          />
          <Row
            label="Address"
            value={
              ben.address
            }
          />
          <Row
            label="District"
            value={
              ben.district
            }
          />
        </InfoCard>

        <InfoCard title="Support Details">
          <Row
            label="Category"
            value={
              ben.category
            }
          />
          <Row
            label="Status"
            value={
              ben.current_status
            }
          />
          <Row
            label="Quantity"
            value={
              ben.quantity
            }
          />
          <Row
            label="Amount"
            value={
              ben.amount
                ? `₹${Number(
                    ben.amount
                  ).toLocaleString()}`
                : "---"
            }
          />
          <Row
            label="Amount Sanctioned"
            value={
              ben.amount_sanctioned
                ? `₹${Number(
                    ben.amount_sanctioned
                  ).toLocaleString()}`
                : "---"
            }
          />
        </InfoCard>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <InfoCard title="Remarks">
          <p className="text-slate-700 whitespace-pre-line">
            {ben.remarks ||
              "---"}
          </p>
        </InfoCard>

        <InfoCard title="Notes">
          <p className="text-slate-700 whitespace-pre-line">
            {ben.notes ||
              "---"}
          </p>
        </InfoCard>
      </div>

      {/* Linked Application */}
      {ben.source_application_id && (
        <div className="mt-5">
          <InfoCard title="Source Application">
            <Link
              to={`/applications/view/${ben.source_application_id}`}
              className="text-blue-600 font-medium hover:underline"
            >
              View Linked
              Application
            </Link>
          </InfoCard>
        </div>
      )}
    </div>
  );
}

/* Components */

function InfoCard({
  title,
  children,
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {title}
      </h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: any) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-none last:pb-0">
      <span className="text-slate-500 text-sm">
        {label}
      </span>

      <span className="text-slate-800 font-medium text-right">
        {value ||
          "---"}
      </span>
    </div>
  );
}

function Badge({
  children,
  gray = false,
}: any) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        gray
          ? "bg-slate-100 text-slate-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {children}
    </span>
  );
}
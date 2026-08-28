import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const categories = [
    "Sheep",
    "Cow",
    "Medical",
    "Education",
    "Monthly Assistance",
    "Monthly Handholding",
    "Livelihood Generation",
    "Soft Loan",
    "Other",
  ];

  const statuses = [
    "Pending",
    "Approved",
    "Rejected",
    "Under Review",
    "Completed",
  ];

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from(
          "applications"
        )
        .select("*")
        .eq("id", id)
        .single();

      if (
        error ||
        !data
      ) {
        setLoading(false);
        return;
      }

      setApp(data);
      setLoading(false);
    };

  const handleChange = (
    e: any
  ) => {
    setApp({
      ...app,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSave =
    async (
      e: any
    ) => {
      e.preventDefault();

      setSaving(true);

      const {
        error,
      } =
        await supabase
          .from(
            "applications"
          )
          .update({
            applicant_name:
              app.applicant_name,
            parentage:
              app.parentage,
            phone:
              app.phone,
            address:
              app.address,
            requested_for:
              app.requested_for,
            amount_requested:
              app.amount_requested ===
              ""
                ? null
                : Number(
                    app.amount_requested
                  ),
            status:
              app.status,
            recommendation:
              app.recommendation,
            notes:
              app.notes,
            application_date:
              app.application_date,
            updated_at:
              new Date(),
          })
          .eq("id", id);

      setSaving(false);

      if (error) {
        alert(
          "Failed to update application"
        );
        return;
      }

      navigate(
        `/applications/view/${id}`
      );
    };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6 text-red-600">
        Application not found
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        to="/applications"
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to
        Applications
      </Link>

      {/* Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Edit Application
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Application #
          {
            app.application_no
          }
        </p>
      </div>

      <form
        onSubmit={
          handleSave
        }
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-8"
      >
        {/* Applicant */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Applicant Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Applicant Name"
              name="applicant_name"
              value={
                app.applicant_name ||
                ""
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Parentage"
              name="parentage"
              value={
                app.parentage ||
                ""
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Phone"
              name="phone"
              value={
                app.phone ||
                ""
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Application Date"
              type="date"
              name="application_date"
              value={
                app.application_date ||
                ""
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="mt-4">
            <TextArea
              label="Address"
              name="address"
              rows={3}
              value={
                app.address ||
                ""
              }
              onChange={
                handleChange
              }
            />
          </div>
        </section>

        {/* Request */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Request Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Requested For"
              name="requested_for"
              value={
                app.requested_for ||
                ""
              }
              onChange={
                handleChange
              }
              options={
                categories
              }
            />

            <Input
              label="Amount Requested"
              type="number"
              name="amount_requested"
              value={
                app.amount_requested ||
                ""
              }
              onChange={
                handleChange
              }
            />

            <Select
              label="Status"
              name="status"
              value={
                app.status ||
                ""
              }
              onChange={
                handleChange
              }
              options={
                statuses
              }
            />
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Internal Notes
          </h2>

          <div className="space-y-4">
            <TextArea
              label="Recommendation"
              name="recommendation"
              rows={4}
              value={
                app.recommendation ||
                ""
              }
              onChange={
                handleChange
              }
            />

            <TextArea
              label="Notes"
              name="notes"
              rows={4}
              value={
                app.notes ||
                ""
              }
              onChange={
                handleChange
              }
            />
          </div>
        </section>

        {/* Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/applications/view/${id}`
              )
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
            {saving
              ? "Saving..."
              : "Save Changes"}
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
      </label>

      <input
        {...props}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
        <option value="">
          Select
        </option>

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
        className="w-full rounded-xl border px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
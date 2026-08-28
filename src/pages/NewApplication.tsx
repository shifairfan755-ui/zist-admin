import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NewApplication() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [
    documentFile,
    setDocumentFile,
  ] = useState<any>(null);

  const [form, setForm] =
    useState({
      applicant_name: "",
      parentage: "",
      phone: "",
      address: "",
      requested_for: "",
      amount_requested:
        "",
      recommendation:
        "",
      notes: "",
      application_date:
        "",
    });

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

  const handleChange = (
    e: any
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (
      e: any
    ) => {
      e.preventDefault();
      setLoading(true);

      let document_url =
        null;

      try {
        /* Upload file */
        if (
          documentFile
        ) {
          const ext =
            documentFile.name
              .split(".")
              .pop();

          const fileName = `${Date.now()}.${ext}`;

          const filePath = `apps/${fileName}`;

          const {
            error:
              uploadError,
          } =
            await supabase.storage
              .from(
                "application_files"
              )
              .upload(
                filePath,
                documentFile,
                {
                  cacheControl:
                    "3600",
                  upsert: false,
                }
              );

          if (
            uploadError
          ) {
            alert(
              "Document upload failed"
            );
            setLoading(
              false
            );
            return;
          }

          const {
            data,
          } =
            supabase.storage
              .from(
                "application_files"
              )
              .getPublicUrl(
                filePath
              );

          document_url =
            data.publicUrl;
        }

        /* Save DB */
        const {
          error,
        } =
          await supabase
            .from(
              "applications"
            )
            .insert([
              {
                applicant_name:
                  form.applicant_name,
                parentage:
                  form.parentage,
                phone:
                  form.phone,
                address:
                  form.address,
                requested_for:
                  form.requested_for,
                amount_requested:
                  form.amount_requested ===
                  ""
                    ? null
                    : Number(
                        form.amount_requested
                      ),
                recommendation:
                  form.recommendation,
                notes:
                  form.notes,
                application_date:
                  form.application_date ||
                  new Date()
                    .toISOString()
                    .slice(
                      0,
                      10
                    ),
                document_url,
                status:
                  "Pending",
              },
            ]);

        if (error) {
          alert(
            "Error saving application"
          );
          setLoading(
            false
          );
          return;
        }

        navigate(
          "/applications"
        );
      } catch {
        alert(
          "Unexpected error"
        );
      }

      setLoading(false);
    };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          New Application
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Create a new support request
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
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
                form.applicant_name
              }
              onChange={
                handleChange
              }
              required
            />

            <Input
              label="Parentage"
              name="parentage"
              value={
                form.parentage
              }
              onChange={
                handleChange
              }
              required
            />

            <Input
              label="Phone"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
              required
            />

            <Input
              label="Application Date"
              name="application_date"
              type="date"
              value={
                form.application_date
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
              value={
                form.address
              }
              onChange={
                handleChange
              }
              rows={3}
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
                form.requested_for
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
              name="amount_requested"
              type="number"
              value={
                form.amount_requested
              }
              onChange={
                handleChange
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
              value={
                form.recommendation
              }
              onChange={
                handleChange
              }
              rows={4}
            />

            <TextArea
              label="Notes"
              name="notes"
              value={
                form.notes
              }
              onChange={
                handleChange
              }
              rows={4}
            />
          </div>
        </section>

        {/* File */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Supporting Document
          </h2>

          <input
            type="file"
            onChange={(e) =>
              setDocumentFile(
                e.target
                  .files?.[0]
              )
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </section>

        {/* Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/applications"
              )
            }
            className="w-full md:w-auto px-5 py-3 rounded-xl border hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : "Submit Application"}
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
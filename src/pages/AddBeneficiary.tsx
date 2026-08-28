import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddBeneficiary() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [
    photoFile,
    setPhotoFile,
  ] = useState<File | null>(
    null
  );

  const [
    docFile,
    setDocFile,
  ] = useState<File | null>(
    null
  );

  const [form, setForm] =
    useState({
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
      amount_sanctioned:
        "",
      start_date: "",
      reference_no: "",
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
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const generateBenNo =
    () =>
      Math.floor(
        1000 +
          Math.random() *
            9000
      ).toString();

  const cleanNumber = (
    val: any
  ) =>
    val === ""
      ? null
      : Number(val);

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();
      setLoading(true);

      try {
        let photo_url =
          null;
        let document_url =
          null;

        const finalBenNo =
          form.ben_no ||
          generateBenNo();

        /* Photo Upload */
        if (photoFile) {
          const ext =
            photoFile.name
              .split(".")
              .pop();

          const path = `photo_${finalBenNo}_${Date.now()}.${ext}`;

          const {
            error:
              uploadError,
          } =
            await supabase.storage
              .from(
                "beneficiary-photos"
              )
              .upload(
                path,
                photoFile
              );

          if (
            uploadError
          ) {
            alert(
              "Photo upload failed"
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
                "beneficiary-photos"
              )
              .getPublicUrl(
                path
              );

          photo_url =
            data.publicUrl;
        }

        /* Document Upload */
        if (docFile) {
          const ext =
            docFile.name
              .split(".")
              .pop();

          const path = `doc_${finalBenNo}_${Date.now()}.${ext}`;

          const {
            error:
              uploadError,
          } =
            await supabase.storage
              .from(
                "beneficiary-docs"
              )
              .upload(
                path,
                docFile
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
                "beneficiary-docs"
              )
              .getPublicUrl(
                path
              );

          document_url =
            data.publicUrl;
        }

        const {
          error,
        } =
          await supabase
            .from(
              "beneficiaries"
            )
            .insert({
              ben_no:
                finalBenNo,
              full_name:
                form.full_name,
              parentage:
                form.parentage,
              phone:
                form.phone,
              address:
                form.address,
              category:
                form.category,
              current_status:
                form.current_status,
              quantity:
                form.quantity ||
                null,
              age: cleanNumber(
                form.age
              ),
              amount:
                cleanNumber(
                  form.amount
                ),
              amount_sanctioned:
                cleanNumber(
                  form.amount_sanctioned
                ),
              start_date:
                form.start_date ||
                null,
              reference_no:
                form.reference_no ||
                null,
              remarks:
                form.remarks,
              notes:
                form.notes,
              district:
                form.district,
              photo_url,
              document_url,
              created_at:
                new Date(),
            });

        if (error) {
          alert(
            error.message
          );
          setLoading(
            false
          );
          return;
        }

        navigate(
          "/beneficiaries"
        );
      } catch (err) {
        alert(
          "Something went wrong"
        );
      }

      setLoading(false);
    };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Add Beneficiary
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Create a new
          beneficiary profile
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-8"
      >
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="ben_no"
              label="Beneficiary No"
              value={
                form.ben_no
              }
              onChange={
                handleChange
              }
              placeholder="Auto if blank"
            />

            <Input
              name="full_name"
              label="Full Name"
              value={
                form.full_name
              }
              onChange={
                handleChange
              }
              required
            />

            <Input
              name="parentage"
              label="Parentage"
              value={
                form.parentage
              }
              onChange={
                handleChange
              }
            />

            <Input
              name="age"
              label="Age"
              value={
                form.age
              }
              onChange={
                handleChange
              }
              type="number"
            />

            <Input
              name="phone"
              label="Phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
            />

            <Input
              name="district"
              label="District"
              value={
                form.district
              }
              onChange={
                handleChange
              }
            />
          </div>
        </section>

        {/* Assistance */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Assistance
            Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              name="category"
              label="Category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              required
              options={
                categories
              }
            />

            <Input
              name="quantity"
              label="Quantity"
              value={
                form.quantity
              }
              onChange={
                handleChange
              }
            />

            <Input
              name="amount"
              label="Amount"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
              type="number"
            />

            <Input
              name="amount_sanctioned"
              label="Amount Sanctioned"
              value={
                form.amount_sanctioned
              }
              onChange={
                handleChange
              }
              type="number"
            />

            <Input
              name="reference_no"
              label="Reference No"
              value={
                form.reference_no
              }
              onChange={
                handleChange
              }
            />

            <Input
              name="start_date"
              label="Start Date"
              value={
                form.start_date
              }
              onChange={
                handleChange
              }
              type="date"
            />
          </div>
        </section>

        {/* Address */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Address &
            Notes
          </h2>

          <div className="space-y-4">
            <TextArea
              name="address"
              label="Address"
              value={
                form.address
              }
              onChange={
                handleChange
              }
              rows={3}
            />

            <TextArea
              name="remarks"
              label="Remarks"
              value={
                form.remarks
              }
              onChange={
                handleChange
              }
              rows={3}
            />

            <TextArea
              name="notes"
              label="Notes"
              value={
                form.notes
              }
              onChange={
                handleChange
              }
              rows={3}
            />
          </div>
        </section>

        {/* Uploads */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Uploads
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileInput
              label="Photo"
              onChange={(
                e
              ) =>
                setPhotoFile(
                  e.target
                    .files?.[0] ||
                    null
                )
              }
            />

            <FileInput
              label="Supporting Document"
              onChange={(
                e
              ) =>
                setDocFile(
                  e.target
                    .files?.[0] ||
                    null
                )
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
                "/beneficiaries"
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
              : "Save Beneficiary"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Reusable Components */

function Input(
  props: any
) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
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
      <label className="block text-sm font-medium text-slate-700 mb-2">
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
        required={
          props.required
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
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {props.label}
      </label>

      <textarea
        {...props}
        className="w-full rounded-xl border px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function FileInput({
  label,
  onChange,
}: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <input
        type="file"
        onChange={
          onChange
        }
        className="w-full rounded-xl border px-4 py-3"
      />
    </div>
  );
}
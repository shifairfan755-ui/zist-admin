import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditBeneficiary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [
    photoFile,
    setPhotoFile,
  ] = useState<File | null>(
    null
  );

  const [
    oldPhotoPath,
    setOldPhotoPath,
  ] = useState<string | null>(
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
      photo_url: "",
    });

  const categories = [
    "Sheep",
    "Cow",
    "Medical",
    "Education",
    "Livelihood Generation",
    "Monthly Assistance",
    "Monthly Handholding",
    "Soft Loan",
    "Other",
  ];

  const statuses = [
    "New",
    "Beneficiary Created",
    "Verified",
    "Closed",
  ];

  useEffect(() => {
    loadBeneficiary();
  }, [id]);

  const loadBeneficiary =
    async () => {
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

      setForm({
        ben_no:
          data.ben_no ||
          "",
        full_name:
          data.full_name ||
          "",
        parentage:
          data.parentage ||
          "",
        phone:
          data.phone ||
          "",
        address:
          data.address ||
          "",
        category:
          data.category ||
          "",
        current_status:
          data.current_status ||
          "",
        quantity:
          data.quantity?.toString() ||
          "",
        amount:
          data.amount?.toString() ||
          "",
        remarks:
          data.remarks ||
          "",
        notes:
          data.notes ||
          "",
        age:
          data.age?.toString() ||
          "",
        district:
          data.district ||
          "",
        amount_sanctioned:
          data.amount_sanctioned?.toString() ||
          "",
        photo_url:
          data.photo_url ||
          "",
      });

      if (
        data.photo_url
      ) {
        const path =
          data.photo_url.split(
            "/object/public/beneficiary-photos/"
          )[1];

        setOldPhotoPath(
          path
        );
      }

      setLoading(false);
    };

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

  const numOrNull = (
    val: string
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
          form.photo_url;

        if (
          photoFile
        ) {
          if (
            oldPhotoPath
          ) {
            await supabase.storage
              .from(
                "beneficiary-photos"
              )
              .remove([
                oldPhotoPath,
              ]);
          }

          const ext =
            photoFile.name
              .split(".")
              .pop();

          const path = `ben_${form.ben_no}_${Date.now()}.${ext}`;

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

        const {
          error,
        } =
          await supabase
            .from(
              "beneficiaries"
            )
            .update({
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
                numOrNull(
                  form.quantity
                ),
              amount:
                numOrNull(
                  form.amount
                ),
              age: numOrNull(
                form.age
              ),
              amount_sanctioned:
                numOrNull(
                  form.amount_sanctioned
                ),
              remarks:
                form.remarks,
              notes:
                form.notes,
              district:
                form.district,
              photo_url,
              updated_at:
                new Date(),
            })
            .eq("id", id);

        if (error) {
          alert(
            "Failed to update beneficiary"
          );
          setLoading(
            false
          );
          return;
        }

        navigate(
          "/beneficiaries"
        );
      } catch {
        alert(
          "Something went wrong"
        );
      }

      setLoading(false);
    };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Edit Beneficiary
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Beneficiary #
          {form.ben_no}
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-8"
      >
        {/* Basic */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="full_name"
              value={
                form.full_name
              }
              onChange={
                handleChange
              }
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
            />

            <Input
              label="Age"
              name="age"
              type="number"
              value={
                form.age
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="District"
              name="district"
              value={
                form.district
              }
              onChange={
                handleChange
              }
            />

            <Select
              label="Category"
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              options={
                categories
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

        {/* Support */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Support Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              name="current_status"
              value={
                form.current_status
              }
              onChange={
                handleChange
              }
              options={
                statuses
              }
            />

            <Input
              label="Quantity"
              name="quantity"
              value={
                form.quantity
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Amount"
              name="amount"
              type="number"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Amount Sanctioned"
              name="amount_sanctioned"
              type="number"
              value={
                form.amount_sanctioned
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
            Notes
          </h2>

          <div className="space-y-4">
            <TextArea
              label="Remarks"
              name="remarks"
              value={
                form.remarks
              }
              onChange={
                handleChange
              }
              rows={3}
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
              rows={3}
            />
          </div>
        </section>

        {/* Photo */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Photo
          </h2>

          {form.photo_url && (
            <img
              src={
                form.photo_url
              }
              alt="Beneficiary"
              className="w-28 h-36 object-cover rounded-xl border mb-4"
            />
          )}

          <input
            type="file"
            onChange={(e) =>
              setPhotoFile(
                e.target
                  .files?.[0] ||
                  null
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
            Save Changes
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
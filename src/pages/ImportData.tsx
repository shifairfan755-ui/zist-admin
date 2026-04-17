import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ImportData() {
  const navigate = useNavigate();
const downloadTemplate = () => {
  let headers: string[] = [];

  if (importType === "beneficiaries") {
    headers = [
      "ID",
      "full_name",
      "parentage",
      "phone",
      "address",
      "category",
      "status",
      "cheque_no",
      "age",
      "district",
      "date_of_registration",
    ];
  }

  if (importType === "donors") {
    headers = [
      "donor_name",
      "phone",
      "address",
    ];
  }

  if (importType === "applications") {
    headers = [
      "application_no",
      "applicant_name",
      "parentage",
      "address",
      "phone",
      "requested_for",
      "amount_requested",
      "status",
    ];
  }

  if (!headers.length) {
    alert("Please select import type first.");
    return;
  }

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  XLSX.writeFile(workbook, `${importType}_template.xlsx`);
};

  const [importType, setImportType] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState<any>(null);

  const skipDuplicates = true;

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];

    if (!file || !importType) {
      alert("Please select import type and upload a file.");
      return;
    }

    setLoading(true);
    setSummary(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        alert("Excel file is empty.");
        setLoading(false);
        return;
      }

      let inserted = 0;
      let skipped = 0;
      let failed = 0;

      if (importType === "beneficiaries") {
  for (const row of rows) {
    try {
      const { error } = await supabase.from("beneficiaries").insert([
        {
          full_name: row.full_name,
          parentage: row.parentage,
          address: row.address,
          phone: row.phone,
          category: row.category,
          quantity: row.quantity,
          amount: row.amount,
          progress: row.progress,
          ben_code: row.ben_code,
          remarks: row.remarks,
          notes: row.notes,
          ben_no: row.ben_no,
          age: row.age,
          district: row.district,
          quantity_given: row.quantity_given,
          current_status: row.current_status,
          amount_sanctioned: row.amount_sanctioned,
          start_date: row.start_date,
          cheque_no: row.cheque_no,
          reference_no: row.reference_no,
        },
      ]);

      if (error) {
        console.error(error);
        failed++;
      } else {
        inserted++;
      }
    } catch (err) {
      console.error(err);
      failed++;
    }
  }
}

      if (importType === "donors") {
        for (const row of rows) {
          try {
            const { error } = await supabase.from("donors").insert([
              {
                donor_name: row.donor_name,
                phone: row.phone,
                address: row.address,
              },
            ]);

            if (error) failed++;
            else inserted++;
          } catch {
            failed++;
          }
        }
      }

      if (importType === "applications") {
        for (const row of rows) {
          try {
            const { error } = await supabase.from("applications").insert([
              {
                application_no: row.application_no,
                applicant_name: row.applicant_name,
                parentage: row.parentage,
                address: row.address,
                phone: row.phone,
                requested_for: row.requested_for,
                amount_requested: row.amount_requested,
                status: row.status,
              },
            ]);

            if (error) failed++;
            else inserted++;
          } catch {
            failed++;
          }
        }
      }

      setSummary({
        total: rows.length,
        inserted,
        skipped,
        failed,
      });
    } catch (error) {
      console.error(error);
      alert("Error importing file.");
    }

    setLoading(false);
  };

  const goToModule = () => {
    if (importType === "beneficiaries") navigate("/beneficiaries");
    if (importType === "donors") navigate("/donors");
    if (importType === "applications") navigate("/applications");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Import Data</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-xl border">

        <label className="font-semibold">Select Data Type</label>
<select
  className="w-full p-3 border rounded mb-4"
  value={importType}
  onChange={(e) => setImportType(e.target.value)}
>
  <option value="">Select Import Type</option>
  <option value="beneficiaries">Beneficiaries</option>
  <option value="donors">Donors</option>
  <option value="applications">Applications</option>
</select>

<button
  onClick={downloadTemplate}
  className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  Download Template
</button>


        <label className="font-semibold">Upload Excel (.xlsx) or CSV</label>
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileUpload}
          className="w-full p-3 border rounded"
        />

        {loading && (
          <p className="mt-3 text-blue-600 font-semibold">
            Importing… please wait
          </p>
        )}

        {summary && (
          <div className="mt-6 bg-green-50 border border-green-300 p-4 rounded-lg">
            <p className="font-semibold text-green-700 mb-2">
              Import Completed
            </p>

            <div className="text-sm space-y-1">
              <p>Total Rows: {summary.total}</p>
              <p className="text-green-700">
                Inserted: {summary.inserted}
              </p>
              <p className="text-yellow-600">
                Skipped (Duplicates): {summary.skipped}
              </p>
              <p className="text-red-600">
                Failed: {summary.failed}
              </p>
            </div>

            <button
              onClick={goToModule}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
            >
              View Imported Data
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

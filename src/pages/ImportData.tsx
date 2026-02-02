import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabaseClient";

export default function ImportData() {
  const [importType, setImportType] = useState("");
  const [loading, setLoading] = useState(false);

  // SKIP DUPLICATES OPTION: Enabled
  const skipDuplicates = true;

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !importType) {
      alert("Please select import type and upload a file.");
      return;
    }

    setLoading(true);

    try {
      // Read Excel/CSV
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        alert("Excel file is empty.");
        setLoading(false);
        return;
      }

      console.log("Parsed rows:", rows);

      // Insert based on selected type
      if (importType === "beneficiaries") {
        await importBeneficiaries(rows);
      }
      if (importType === "donors") {
        await importDonors(rows);
      }
      if (importType === "applications") {
        await importApplications(rows);
      }

      alert("Data imported successfully!");
    } catch (error) {
      console.error(error);
      alert("Error importing file.");
    }

    setLoading(false);
  };

  // ---------------------------
  // BENEFICIARIES IMPORT
  // ---------------------------
  const importBeneficiaries = async (rows) => {
    for (const row of rows) {
      // check duplicate by ID
      const { data: existing } = await supabase
        .from("beneficiaries")
        .select("ID")
        .eq("ID", row.ID)
        .maybeSingle();

      if (existing && skipDuplicates) continue;

      await supabase.from("beneficiaries").insert([
        {
          ID: row.ID,
          full_name: row.full_name,
          parentage: row.parentage,
          phone: row.phone,
          address: row.address,
          category: row.category,
          status: row.status,
          cheque_no: row.cheque_no,
          age: row.age,
          district: row.district,
          date_of_registration: row.date_of_registration,
        },
      ]);
    }
  };

  // ---------------------------
  // DONORS IMPORT
  // ---------------------------
  const importDonors = async (rows) => {
    for (const row of rows) {
      await supabase.from("donors").insert([
        {
          donor_name: row.donor_name,
          phone: row.phone,
          address: row.address,
          amount: row.amount,
          notes: row.notes,
          payment_date: row.payment_date,
        },
      ]);
    }
  };

  // ---------------------------
  // APPLICATIONS IMPORT
  // ---------------------------
  const importApplications = async (rows) => {
    for (const row of rows) {
      await supabase.from("applications").insert([
        {
          application_no: row.application_no,
          beneficiary_name: row.beneficiary_name,
          parentage: row.parentage,
          address: row.address,
          date: row.date,
          status: row.status,
          remarks: row.remarks,
        },
      ]);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Import Data</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-xl border">

        {/* SELECT TYPE */}
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

        {/* FILE UPLOAD */}
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
      </div>
    </div>
  );
}

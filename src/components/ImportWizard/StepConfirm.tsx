import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function StepConfirm({
  moduleType,
  mappedRows,
  setImportResult,
  next,
  back,
}) {
  const [loading, setLoading] = useState(false);

  const preview = mappedRows.slice(0, 10);

  // -------------------------
  // IMPORT HANDLERS
  // -------------------------
  const IMPORTERS = {
    beneficiaries: importBeneficiaries,
    applications: importApplications,
    payments: importPayments,
  };

  async function handleImport() {
    setLoading(true);

    const importer = IMPORTERS[moduleType];
    const result = await importer(mappedRows);

    setImportResult(result);
    setLoading(false);

    next();
  }

  // BENEFICIARIES IMPORT
  async function importBeneficiaries(rows) {
    let success = 0;
    let skipped = 0;

    for (const row of rows) {
      const { data: exists } = await supabase
        .from("beneficiaries")
        .select("ID")
        .eq("ID", row.ID)
        .maybeSingle();

      if (exists) {
        skipped++;
        continue;
      }

      await supabase.from("beneficiaries").insert([row]);
      success++;
    }

    return { success, skipped, total: rows.length };
  }

  // APPLICATIONS IMPORT
  async function importApplications(rows) {
    let success = 0;
    let failed = 0;

    for (const row of rows) {
      const { error } = await supabase.from("applications").insert([row]);
      if (error) failed++;
      else success++;
    }

    return { success, failed, total: rows.length };
  }

  // PAYMENTS IMPORT
  async function importPayments(rows) {
    let success = 0;
    let failed = 0;

    for (const row of rows) {
      const { error } = await supabase.from("payments").insert([row]);
      if (error) failed++;
      else success++;
    }

    return { success, failed, total: rows.length };
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-blue-600 mb-3">
        Step 4 — Confirm Import
      </h2>

      {/* SUMMARY */}
      <div className="bg-green-50 border border-green-400 rounded-xl p-4 mb-4">
        <p className="text-green-700 font-semibold">
          Total Rows: {mappedRows.length}
        </p>
        <p className="text-gray-700">
          You are importing data into:
          <span className="text-blue-700 font-bold"> {moduleType}</span>
        </p>
      </div>

      {/* PREVIEW TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              {Object.keys(preview[0] || {}).map((h) => (
                <th key={h} className="px-4 py-2 border-r border-blue-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {preview.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                {Object.keys(row).map((h) => (
                  <td key={h} className="px-4 py-2 border-r border-gray-200">
                    {row[h]?.toString() ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between mt-6">
        <button
          onClick={back}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          disabled={loading}
        >
          ← Back
        </button>

        <button
          onClick={handleImport}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? "Importing…" : "Confirm & Import"}
        </button>
      </div>
    </div>
  );
}

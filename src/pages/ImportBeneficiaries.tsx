import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabaseClient";

export default function ImportBeneficiaries() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, msg]);
  };

  const parseFile = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    setLog([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      addLog(`Rows found: ${json.length}`);

      for (const row of json) {
        await processRow(row);
      }

      addLog("✔ Import completed!");
    } catch (err) {
      addLog("❌ Error reading file.");
    }

    setLoading(false);
  };

  /* ------------------------------------------------------------------
     PROCESS EACH ROW
  -------------------------------------------------------------------- */

  const processRow = async (row: any) => {
    let full_name =
      row.full_name ||
      row.FullName ||
      row["Full Name"] ||
      row.name ||
      row.Name ||
      null;

    if (!full_name) {
      addLog("❌ Skipped row — Full Name missing");
      return;
    }

    const newBen = {
      full_name,
      parentage:
        row.parentage ||
        row.Parentage ||
        row.father_name ||
        row["Father Name"] ||
        "",
      phone: row.phone || row.Phone || "",
      address: row.address || row.Address || "",
      category: row.category || row.Category || "",
      quantity: Number(row.quantity || 0),
      amount: Number(row.amount || 0),
      amount_sanctioned: Number(row.amount_sanctioned || 0),
      current_status: row.current_status || row.Status || "New",
      remarks: row.remarks || "",
      notes: row.notes || "",
      ben_no: row.ben_no || "",
      age: Number(row.age || 0),
      district: row.district || "",
      quantity_given: Number(row.quantity_given || 0),
      source_application_id: row.source_application_id || null,
    };

    /* ------------------------------  
       AUTO GENERATE BEN CODE
    ------------------------------ */
    if (!newBen.ben_no || newBen.ben_no === "") {
      const code = "BEN-" + Math.floor(100000 + Math.random() * 900000);
      newBen.ben_no = code;
    }

    /* ------------------------------  
       CHECK DUPLICATE (full_name + phone)
    ------------------------------ */
    const { data: dup } = await supabase
      .from("beneficiaries")
      .select("id")
      .eq("full_name", newBen.full_name)
      .eq("phone", newBen.phone)
      .maybeSingle();

    if (dup) {
      addLog(`⚠ Skipped DUPLICATE → ${newBen.full_name}`);
      return;
    }

    /* ------------------------------  
       INSERT INTO SUPABASE
    ------------------------------ */
    const { error } = await supabase.from("beneficiaries").insert([newBen]);

    if (error) {
      addLog(`❌ Failed: ${newBen.full_name}`);
      return;
    }

    addLog(`✔ Imported: ${newBen.full_name}`);
  };

  /* ------------------------------------------------------------------ */

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Import Beneficiaries
      </h1>

      <p className="text-gray-600 mb-4">
        Upload Excel (.xlsx, .xls) or .csv file.  
        The system auto-detects columns.
      </p>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        className="border p-3 rounded w-full mb-4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        disabled={loading}
        onClick={parseFile}
        className="bg-blue-700 text-white px-6 py-3 rounded-lg w-full mb-4"
      >
        {loading ? "Importing..." : "Start Import"}
      </button>

      <div className="bg-gray-100 p-4 rounded-lg h-72 overflow-auto text-sm border">
        <h2 className="font-bold mb-2">IMPORT LOG</h2>

        {log.length === 0 ? (
          <p className="text-gray-500">No logs yet.</p>
        ) : (
          log.map((x, i) => <p key={i}>{x}</p>)
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ImportPayments() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const expectedColumns = [
    "payee_name",
    "amount",
    "category",
    "payment_date",
    "cheque_no",
    "description",
    "notes",
  ];

  /** Validate CSV/Excel structure */
  const validateColumns = (cols: string[]) => {
    return expectedColumns.every((col) => cols.includes(col));
  };

  /** Handle File Upload (CSV or Excel) */
  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const data = result.data;

          if (!validateColumns(Object.keys(data[0]))) {
            alert("❌ Invalid file format. Required columns:\n" + expectedColumns.join(", "));
            return;
          }

          setRows(data);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();

      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (!validateColumns(Object.keys(data[0]))) {
          alert("❌ Invalid file format. Required columns:\n" + expectedColumns.join(", "));
          return;
        }

        setRows(data);
      };

      reader.readAsBinaryString(file);
    } else {
      alert("❌ Please upload a CSV or Excel file.");
    }
  };

  /** Upload to Supabase */
  const handleImport = async () => {
    if (rows.length === 0) {
      alert("No rows to import");
      return;
    }

    setLoading(true);

    // Convert amount to number
    const cleaned = rows.map((r) => ({
      payee_name: r.payee_name,
      amount: Number(r.amount),
      category: r.category,
      payment_date: r.payment_date,
      cheque_no: r.cheque_no || "",
      description: r.description || "",
      notes: r.notes || "",
    }));

    const { error } = await supabase.from("payments").insert(cleaned);

    if (error) {
      console.error(error);
      alert("❌ Import failed");
      setLoading(false);
      return;
    }

    alert("✅ Payments Imported Successfully!");
    navigate("/payments");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Import Payments
      </h1>

      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="border p-2 rounded mb-4"
      />

      {rows.length > 0 && (
        <>
          <p className="font-semibold mb-2">
            Rows Loaded: {rows.length}
          </p>

          <div className="overflow-auto max-h-96 border rounded">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  {expectedColumns.map((col) => (
                    <th key={col} className="border p-2 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b">
                    {expectedColumns.map((col) => (
                      <td key={col} className="border p-2">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Importing..." : "Import Now"}
          </button>
        </>
      )}
    </div>
  );
}

import * as XLSX from "xlsx";
import { useState } from "react";

export default function StepFileUpload({ moduleType, setRawRows, next }) {
  const [fileName, setFileName] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const buf = await file.arrayBuffer();
    const workbook = XLSX.read(buf);
    const sheet = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    if (sheetData.length === 0) {
      alert("Uploaded file is empty.");
      return;
    }

    setRawRows(sheetData);
    next();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-blue-600 mb-2">Step 1 — Upload File</h2>

      <p className="text-gray-600 mb-4">
        Upload an Excel (<span className="font-semibold">.xlsx</span>) or CSV file containing{" "}
        <span className="text-green-600 font-semibold">{moduleType}</span> data.
      </p>

      <div className="border-2 border-dashed border-blue-400 rounded-xl p-6 text-center hover:bg-blue-50 transition">
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleUpload}
          className="w-full"
        />

        {fileName && (
          <p className="mt-3 text-green-600 font-semibold">{fileName}</p>
        )}
      </div>
    </div>
  );
}

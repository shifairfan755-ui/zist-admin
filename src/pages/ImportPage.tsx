import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabaseClient";

export default function ImportPage() {
  const [rows, setRows] = useState([]);
  const [tableType, setTableType] = useState("beneficiaries");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ============================================================
  // EXPECTED FIELDS FOR EACH TABLE
  // ============================================================
  const expectedFields = {
    beneficiaries: [
      "name",
      "phone",
      "address",
      "application_id",
      "status",
      "created_at",
      "requested_for",
      "amount_requested",
      "amount_approved",
      "remarks",
    ],

    applications: [
      "applicant_name",
      "phone",
      "address",
      "application_type",
      "amount_requested",
      "status",
      "created_at",
      "updated_at",
      "status_id",
      "user_id",
      "requested_for",
      "file_url",
    ],

    payments: [
      "date",
      "cheque_no",
      "beneficiary_name",
      "issued_to",
      "purpose",
      "category",
      "phone",
      "address",
      "amount",
      "given",
      "status",
      "notes",
    ],
  };

  // ============================================================
  // VALIDATION FUNCTION
  // ============================================================
  function validateRows(jsonRows, table) {
    const required = expectedFields[table];
    const errors = [];
    const validatedRows = [];

    jsonRows.forEach((row, index) => {
      let rowErrors = [];
      let cleanRow = {};

      // Missing & allowed fields check
      required.forEach((col) => {
        if (!(col in row)) {
          rowErrors.push(`Missing column: ${col}`);
        } else {
          cleanRow[col] = row[col];
        }
      });

      // Extra unexpected columns
      Object.keys(row).forEach((col) => {
        if (!required.includes(col)) {
          rowErrors.push(`Extra column: ${col}`);
        }
      });

      // Additional checks
      if (cleanRow.phone && String(cleanRow.phone).length < 7) {
        rowErrors.push("Phone number too short");
      }

      if (cleanRow.amount && isNaN(Number(cleanRow.amount))) {
        rowErrors.push("Amount must be a number");
      }

      if (
        cleanRow.created_at &&
        isNaN(Date.parse(cleanRow.created_at))
      ) {
        rowErrors.push("Invalid created_at date");
      }

      validatedRows.push({
        ...cleanRow,
        _errors: rowErrors,
      });

      if (rowErrors.length > 0) {
        errors.push({ index, rowErrors });
      }
    });

    return { validatedRows, errors };
  }

  // ============================================================
  // HANDLE DRAG & DROP FILE IMPORT
  // ============================================================
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // ⭐ VALIDATE
        const { validatedRows, errors } = validateRows(json, tableType);
        setRows(validatedRows);

        if (errors.length > 0) {
          setMessage(`⚠️ Found ${errors.length} invalid rows. They are highlighted in red.`);
        } else {
          setMessage("✅ All rows are valid and ready to import.");
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [tableType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "text/csv": [],
    },
  });

  // ============================================================
  // IMPORT TO SUPABASE
  // ============================================================
  async function importRows() {
    if (rows.length === 0) {
      setMessage("❌ No rows to import.");
      return;
    }

    // Stop if invalid rows exist
    const invalid = rows.filter((r) => r._errors?.length > 0);
    if (invalid.length > 0) {
      setMessage("❌ Cannot import. Fix the errors first.");
      return;
    }

    setLoading(true);
    const table = tableType;

    const cleanRows = rows.map((r) => {
      const { _errors, ...rest } = r;
      return rest;
    });

    const { error } = await supabase.from(table).insert(cleanRows);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("❌ Import failed. Check console.");
    } else {
      setRows([]);
      setMessage(`✅ Successfully imported ${cleanRows.length} rows.`);
    }
  }

  // ============================================================
  // TEMPLATE GENERATOR
  // ============================================================
  function createAndDownloadExcel(filename, data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  // Beneficiary template
  function downloadBeneficiaryTemplate() {
    const data = [
      {
        name: "",
        phone: "",
        address: "",
        application_id: "",
        status: "",
        created_at: "",
        requested_for: "",
        amount_requested: "",
        amount_approved: "",
        remarks: "",
      },
    ];
    createAndDownloadExcel("beneficiaries_template.xlsx", data);
  }

  // Applications template
  function downloadApplicationTemplate() {
    const data = [
      {
        applicant_name: "",
        phone: "",
        address: "",
        application_type: "",
        amount_requested: "",
        status: "",
        created_at: "",
        updated_at: "",
        status_id: "",
        user_id: "",
        requested_for: "",
        file_url: "",
      },
    ];
    createAndDownloadExcel("applications_template.xlsx", data);
  }

  // Payments template
  function downloadPaymentsTemplate() {
    const data = [
      {
        date: "",
        cheque_no: "",
        beneficiary_name: "",
        issued_to: "",
        purpose: "",
        category: "",
        phone: "",
        address: "",
        amount: "",
        given: "",
        status: "",
        notes: "",
      },
    ];
    createAndDownloadExcel("payments_template.xlsx", data);
  }

  // ============================================================
  // UI START
  // ============================================================
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Import Data</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <label className="font-semibold">Select Table</label>
        <select
          value={tableType}
          onChange={(e) => setTableType(e.target.value)}
          className="border p-3 rounded-lg w-full mb-6 mt-2"
        >
          <option value="beneficiaries">Beneficiaries</option>
          <option value="applications">Applications</option>
          <option value="payments">Payments</option>
        </select>

        {/* DRAG AND DROP */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-10 rounded-xl text-center cursor-pointer ${
            isDragActive ? "bg-blue-100 border-blue-500" : "bg-gray-100"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600 text-lg">
            {isDragActive ? "Drop your file here…" : "Drag & drop Excel file or click to browse"}
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mt-4 p-3 rounded-lg bg-gray-800 text-white">{message}</div>
        )}

        {/* PREVIEW */}
        {rows.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Preview (showing first 25 rows)</h2>

            <div className="overflow-auto max-h-96 border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-300 sticky top-0">
                  <tr>
                    {expectedFields[tableType].map((col) => (
                      <th key={col} className="border px-3 py-2 text-left">{col}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.slice(0, 25).map((row, i) => (
                    <tr
                      key={i}
                      className={row._errors?.length ? "bg-red-200" : "bg-white"}
                    >
                      {expectedFields[tableType].map((col) => (
                        <td className="border px-3 py-2" key={col}>
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={importRows}
              disabled={loading}
              className="bg-black text-white px-5 py-3 rounded-lg mt-4"
            >
              {loading ? "Importing..." : "Import Now"}
            </button>
          </div>
        )}
      </div>

      {/* TEMPLATE DOWNLOAD SECTION */}
      <div className="bg-white p-6 mt-8 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4">Download Import Templates</h2>

        <div className="space-y-3">
          <button
            onClick={downloadBeneficiaryTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Beneficiaries Template
          </button>

          <button
            onClick={downloadApplicationTemplate}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Applications Template
          </button>

          <button
            onClick={downloadPaymentsTemplate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Payments Template
          </button>
        </div>
      </div>
    </div>
  );
}

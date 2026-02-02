import { useEffect, useState } from "react";

// EXPECTED FIELDS FOR EACH MODULE
const FIELD_TEMPLATES = {
  beneficiaries: [
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
  ],

  applications: [
    "application_no",
    "beneficiary_id",
    "beneficiary_name",
    "parentage",
    "address",
    "date",
    "status",
    "remarks",
  ],

  payments: [
    "payment_id",
    "beneficiary_id",
    "amount",
    "mode",
    "date",
    "remarks",
  ],
};

export default function StepColumnMatch({
  moduleType,
  rawRows,
  setMappedRows,
  next,
  back,
}) {
  const excelHeaders = Object.keys(rawRows[0] || {});
  const expectedFields = FIELD_TEMPLATES[moduleType];

  const [mapping, setMapping] = useState({});

  // AUTO MATCH HEADERS (smart)
  useEffect(() => {
    const auto = {};
    expectedFields.forEach((f) => {
      const found = excelHeaders.find(
        (h) => h.toLowerCase().trim() === f.toLowerCase().trim()
      );
      if (found) auto[f] = found;
    });

    setMapping(auto);
  }, []);

  // HANDLE CHANGE
  const handleSelect = (field, excelCol) => {
    setMapping((prev) => ({
      ...prev,
      [field]: excelCol,
    }));
  };

  // VALIDATION
  const handleNext = () => {
    const missing = expectedFields.filter((f) => !mapping[f]);
    if (missing.length > 0) {
      alert("Please map all required fields before continuing.");
      return;
    }

    // Build mapped rows
    const finalRows = rawRows.map((row) => {
      const newRow = {};
      expectedFields.forEach((f) => {
        newRow[f] = row[mapping[f]] ?? null;
      });
      return newRow;
    });

    setMappedRows(finalRows);
    next();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-blue-600 mb-2">
        Step 3 — Match Columns
      </h2>

      <p className="text-gray-600 mb-4">
        Match your Excel columns with the required database fields.
        Auto-matched fields are pre-selected.
      </p>

      <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 mb-4">
        <p className="font-semibold text-blue-700">
          Excel Columns: {excelHeaders.join(", ")}
        </p>
      </div>

      {/* MATCHING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expectedFields.map((field) => (
          <div
            key={field}
            className="bg-white border border-green-300 p-4 rounded-xl shadow-sm"
          >
            <label className="font-semibold text-green-600">{field}</label>

            <select
              className="w-full border mt-2 p-2 rounded"
              value={mapping[field] || ""}
              onChange={(e) => handleSelect(field, e.target.value)}
            >
              <option value="">Select Excel Column</option>
              {excelHeaders.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between mt-6">
        <button
          onClick={back}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          ← Back
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

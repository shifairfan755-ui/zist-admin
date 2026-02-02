export default function StepPreview({ rawRows, next, back }) {
  const previewRows = rawRows.slice(0, 20); // show first 20 rows
  const headers = Object.keys(previewRows[0] || {});

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-blue-600 mb-2">
        Step 2 — Preview Data
      </h2>

      <p className="text-gray-600 mb-4">
        Review the first few rows of your uploaded file. If everything looks good, proceed
        to the next step.
      </p>

      {/* PREVIEW TABLE */}
      <div className="border border-green-400 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-600 text-white sticky top-0">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-4 py-2 border-r border-blue-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {previewRows.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  {headers.map((h) => (
                    <td key={h} className="px-4 py-2 border-r border-gray-200">
                      {row[h]?.toString() ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          onClick={next}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

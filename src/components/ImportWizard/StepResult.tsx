export default function StepResult({ importResult }) {
  const { success = 0, skipped = 0, failed = 0, total = 0 } = importResult || {};

  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        Import Completed ✔
      </h2>

      {/* SUCCESS CARD */}
      <div className="bg-green-50 border border-green-400 rounded-xl p-6 shadow max-w-md mx-auto mb-6">
        <p className="text-green-700 text-xl font-semibold mb-2">
          All Done!
        </p>

        <p className="text-gray-700">
          Total Rows: <span className="font-bold">{total}</span>
        </p>

        <p className="text-green-700">
          Successfully Imported: <span className="font-bold">{success}</span>
        </p>

        {skipped > 0 && (
          <p className="text-blue-600">
            Skipped (Duplicates): <span className="font-bold">{skipped}</span>
          </p>
        )}

        {failed > 0 && (
          <p className="text-red-600">
            Failed: <span className="font-bold">{failed}</span>
          </p>
        )}
      </div>

      {/* GREEN CHECK ICON */}
      <div className="flex justify-center mb-6">
        <div className="bg-green-600 text-white w-16 h-16 flex items-center justify-center rounded-full shadow animate-bounce">
          ✔
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl shadow-lg"
      >
        Import Another File
      </button>
    </div>
  );
}

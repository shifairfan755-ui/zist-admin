export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white shadow p-8 rounded-lg text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Access Denied
        </h1>
        <p className="mt-2 text-gray-600">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}

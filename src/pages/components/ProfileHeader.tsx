export default function ProfileHeader({ data }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-6">
      <img
        src={data.photo_url || "/placeholder.png"}
        className="w-24 h-24 rounded-xl object-cover border"
      />

      <div className="flex-1">
        <h2 className="text-2xl font-semibold">{data.full_name}</h2>
        <p className="text-gray-600">{data.phone}</p>
        <p className="text-gray-500 text-sm">{data.address}</p>
      </div>

      <span
        className={`px-4 py-2 text-sm rounded-lg ${
          data.status === "Approved"
            ? "bg-green-100 text-green-700"
            : data.status === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {data.status}
      </span>
    </div>
  );
}

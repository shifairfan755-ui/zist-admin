import { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import DocumentsSection from "./DocumentsSection";
import PaymentsHistory from "./PaymentsHistory";

export default function ProfileTabs({ data }: any) {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "documents", label: "Documents" },
    { key: "payments", label: "Payments" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex gap-6 border-b mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-2 ${
              t.key === tab
                ? "border-b-2 border-blue-600 font-medium"
                : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <ProfileInfo data={data} />}
      {tab === "documents" && <DocumentsSection documents={data.documents} />}
      {tab === "payments" && <PaymentsHistory payments={data.payments} />}
    </div>
  );
}

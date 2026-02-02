import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  Heart,
  Banknote,
  Archive,
  Folder,
} from "lucide-react";

export default function DocumentsPage() {
  const cards = [
    {
      title: "Application Documents",
      desc: "All photos & files uploaded with applications.",
      icon: <FileText size={40} className="text-blue-600" />,
      link: "/documents/applications",
      bg: "bg-blue-50",
    },
    {
      title: "Beneficiary Documents",
      desc: "Files attached to beneficiaries, IDs, proofs, agreements.",
      icon: <Users size={40} className="text-green-600" />,
      link: "/documents/beneficiaries",
      bg: "bg-green-50",
    },
    {
      title: "Donor Documents",
      desc: "Donor files, receipts & donation slips.",
      icon: <Heart size={40} className="text-red-600" />,
      link: "/documents/donors",
      bg: "bg-red-50",
    },
    {
      title: "Bank Documents",
      desc: "Bank statements, approvals & finance-related files.",
      icon: <Banknote size={40} className="text-purple-600" />,
      link: "/documents/bank",
      bg: "bg-purple-50",
    },
    {
      title: "Trust Documents",
      desc: "Legal papers belonging to ZIST Foundation.",
      icon: <Archive size={40} className="text-orange-600" />,
      link: "/documents/trust",
      bg: "bg-orange-50",
    },
    {
      title: "Other Documents",
      desc: "Misc files, general uploads & attachments.",
      icon: <Folder size={40} className="text-gray-600" />,
      link: "/documents/other",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">
        All Documents
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.title}
            to={c.link}
            className={`${c.bg} p-6 rounded-xl shadow hover:shadow-lg transition border`}
          >
            <div className="flex items-center gap-4 mb-4">
              {c.icon}
              <h2 className="text-xl font-semibold">{c.title}</h2>
            </div>

            <p className="text-gray-700">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Table from "../components/Table";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();

  function excelDateToJSDate(serial: number) {
    const utc_days = serial - 25569;
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split("T")[0];
  }

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        id,
        beneficiary_id,
        payee_name,
        amount,
        category,
        payment_date,
        cheque_no,
        remarks,
        description,
        created_at,
        beneficiaries ( full_name )
      `
      )
      .order("payment_date", { ascending: false });

    if (error) toast.error("Failed to load payments");
    else setPayments(data || []);

    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const categories = Array.from(
    new Set(payments.map((p) => p.category).filter(Boolean))
  );

  // ---------------------------
  // FILTER LOGIC
  // ---------------------------
  const filtered = payments.filter((p) => {
    const term = search.toLowerCase();

    const payee = p.beneficiary_id
      ? p.beneficiaries?.full_name || ""
      : p.payee_name || "";

    const matchesSearch =
      payee.toLowerCase().includes(term) ||
      (p.category || "").toLowerCase().includes(term) ||
      (p.cheque_no || "").toLowerCase().includes(term) ||
      (p.remarks || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term) ||
      p.amount?.toString().includes(term);

    const matchesCategory =
      categoryFilter === "" || p.category === categoryFilter;

    const paymentDate = new Date(p.payment_date);
    const matchesFrom = !fromDate || paymentDate >= new Date(fromDate);
    const matchesTo = !toDate || paymentDate <= new Date(toDate);

    return matchesSearch && matchesCategory && matchesFrom && matchesTo;
  });

  // ---------------------------
  // TABLE DATA TRANSFORMATION
  // ---------------------------
  const tableData = filtered.map((p) => ({
    ...p,
    payee_name: p.beneficiary_id
      ? p.beneficiaries?.full_name
      : p.payee_name,
  }));

  // ---------------------------
  // IMPORT FUNCTION (unchanged)
  // ---------------------------
  const handleImport = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const wb = XLSX.read(reader.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        let importData = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];

          if (!row.Payee || !row.Amount || !row.Category || !row.Date) {
            toast.error(`Missing required fields in row ${i + 2}`);
            return;
          }

          let finalDate = row.Date;

          if (typeof row.Date === "number") {
            finalDate = excelDateToJSDate(row.Date);
          } else {
            finalDate = new Date(row.Date).toISOString().split("T")[0];
          }

          importData.push({
            payee_name: row.Payee,
            amount: Number(row.Amount),
            category: row.Category,
            payment_date: finalDate,
            cheque_no: row.Cheque || "",
            remarks: row.Remarks || "",
            description:
              row.Description || row.Descriptions || row.Desc || row.description || row.desc || "",
            beneficiary_id: row.BeneficiaryID || null,
          });
        }

        const { error } = await supabase.from("payments").insert(importData);

        if (error) {
          toast.error("Import failed");
        } else {
          toast.success("Payments imported successfully");
          loadPayments();
        }
      } catch (err) {
        toast.error("Import error");
      }
    };

    reader.readAsBinaryString(file);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Payments</h1>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const data = payments.map((p) => ({
                Payee: p.beneficiary_id
                  ? p.beneficiaries?.full_name
                  : p.payee_name || "",
                Category: p.category,
                Amount: p.amount,
                Date: p.payment_date,
                Cheque: p.cheque_no,
                Description: p.description,
                Remarks: p.remarks,
              }));

              const ws = XLSX.utils.json_to_sheet(data);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Payments");

              XLSX.writeFile(wb, "payments_export.xlsx");
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow"
          >
            Export Excel
          </button>

          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow cursor-pointer">
            Import Excel
            <input type="file" className="hidden" onChange={handleImport} />
          </label>

          <Link
            to="/add-payment"
            className="bg-primaryLight text-white px-4 py-2 rounded-lg shadow"
          >
            + Add Payment
          </Link>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <input
        placeholder="Search payments..."
        className="border p-3 rounded-lg w-full mb-4 shadow-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-3 rounded-lg shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-3 rounded-lg shadow-sm"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-3 rounded-lg shadow-sm"
        />

        <button
          onClick={() => {
            setCategoryFilter("");
            setFromDate("");
            setToDate("");
            setSearch("");
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
        >
          Clear Filters
        </button>
      </div>

      {/* UNIVERSAL TABLE */}
      <Table
        data={tableData}
        selectable
        onRowClick={(row) => navigate(`/view-payment/${row.id}`)}
        columns={[
          { key: "payee_name", label: "Payee" },
          { key: "category", label: "Category", type: "badge" },
          { key: "amount", label: "Amount", type: "currency" },
          { key: "payment_date", label: "Date", type: "date" },
          { key: "cheque_no", label: "Cheque" },
        ]}
      />
    </div>
  );
}

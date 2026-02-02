import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function DonorPDF() {
  const { id } = useParams();
  const [donor, setDonor] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    // Load donor
    const { data: donorData } = await supabase
      .from("donors")
      .select("*")
      .eq("id", id)
      .single();

    setDonor(donorData);

    // Load donor files
    const { data: fileData } = await supabase
      .from("donor_files")
      .select("*")
      .eq("donor_id", id);

    setFiles(fileData || []);
    setLoading(false);

    generatePDF(donorData, fileData || []);
  }

  function generatePDF(donor: any, files: any[]) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Donor Profile", 14, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${donor.donor_name}`, 14, 35);
    doc.text(`Phone: ${donor.phone}`, 14, 45);
    doc.text(`Address: ${donor.address || "--"}`, 14, 55);
    doc.text(`Donation Type: ${donor.donation_type}`, 14, 65);
    doc.text(`Amount: ₹${donor.amount}`, 14, 75);
    doc.text(`Date Given: ${donor.date_given}`, 14, 85);
    doc.text(`Remarks: ${donor.remarks || "--"}`, 14, 95);

    // Receipt table
    const tableRows = files.map((f: any, i: number) => [
      i + 1,
      f.file_url,
    ]);

    if (tableRows.length > 0) {
      doc.autoTable({
        head: [["#", "Receipt URL"]],
        body: tableRows,
        startY: 110,
      });
    }

    doc.save(`${donor.donor_name}_donor_profile.pdf`);
  }

  return (
    <div className="p-6 text-center">
      {loading ? (
        <p>Generating PDF...</p>
      ) : (
        <p className="text-lg text-green-700 font-semibold">
          PDF downloaded successfully!
        </p>
      )}
    </div>
  );
}

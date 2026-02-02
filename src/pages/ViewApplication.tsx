import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const zistLogo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXAAAABSCAYAAABYNrkGAAAACXBIWXMAAAsTAAALEwEAmpwYAAAI2ElEQ..."; // keep existing logo

export default function ViewApplication() {
  const { id } = useParams(); // UUID – keep as string
  const navigate = useNavigate();

  const [app, setApp] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [profileBase64, setProfileBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pdfRef = useRef<HTMLDivElement>(null);

  const convertToBase64 = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/png"));
      };

      img.onerror = () => resolve(null);
    });
  };

  // Load application + photos
  const loadData = async () => {
    if (!id) return;

    const { data: appData } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (!appData) {
      setApp(null);
      setLoading(false);
      return;
    }

    const { data: photoData } = await supabase
      .from("application_photos")
      .select("*")
      .eq("application_id", id);

    setApp(appData);
    setPhotos(photoData || []);

    if (photoData?.length > 0) {
      const base64 = (await convertToBase64(photoData[0].photo_url)) as string;
      setProfileBase64(base64);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Delete Application
  const deleteApplication = async () => {
    const yes = window.confirm("Are you sure you want to delete this application?");
    if (!yes) return;

    try {
      // 1️⃣ Load related photos
      const { data: appPhotos } = await supabase
        .from("application_photos")
        .select("*")
        .eq("application_id", id);

      // 2️⃣ Delete from storage
      if (appPhotos && appPhotos.length > 0) {
        const filePaths = appPhotos
          .map((x) => x.file_path)
          .filter((p) => p && p.length > 3);

        if (filePaths.length > 0) {
          await supabase.storage.from("application-photos").remove(filePaths);
        }
      }

      // 3️⃣ Delete rows from application_photos
      await supabase
        .from("application_photos")
        .delete()
        .eq("application_id", id);

      // 4️⃣ Delete application
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Failed to delete: " + error.message);
        return;
      }

      alert("Application deleted successfully");
      navigate("/applications");

    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.addImage(img, "PNG", 5, 5, 200, 287);
    pdf.save(`Application-${app.application_no}.pdf`);
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (!app) return <p className="p-6 text-red-600">Application Not Found</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <Link to="/applications" className="text-blue-600">
        ← Back to Applications
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">
        Application Profile — {app.application_no}
      </h1>

      {/* PDF AREA */}
      <div ref={pdfRef} className="bg-white p-6 border rounded-xl">

        {/* Header */}
        <div className="text-center mb-4">
          <img src={zistLogo} style={{ width: "220px" }} />
        </div>

        {/* Applicant */}
        <div className="flex justify-between border-b pb-4 mb-4">
          <div>
            <p className="text-xl font-bold">{app.applicant_name}</p>
            <p>S/o {app.parentage}</p>
            <p>{app.phone}</p>
          </div>

          {profileBase64 && (
            <img
              src={profileBase64}
              className="w-[35mm] h-[45mm] object-cover border rounded"
            />
          )}
        </div>

        {/* Details */}
        <table className="w-full">
          <tbody>
            <DetailRow label="Applicant Name" value={app.applicant_name} />
            <DetailRow label="Parentage" value={app.parentage} />
            <DetailRow label="Phone" value={app.phone} />
            <DetailRow label="Address" value={app.address} />
            <DetailRow label="Requested For" value={app.requested_for} />
            <DetailRow label="Amount Requested" value={`₹${app.amount_requested}`} />
            <DetailRow label="Application Date" value={app.application_date} />
            <DetailRow label="Remarks" value={app.remarks} />
            <DetailRow label="Notes" value={app.notes} />
          </tbody>
        </table>

      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={generatePDF} className="bg-green-600 text-white px-6 py-3 rounded-lg">
          Download PDF
        </button>

        <Link
          to={`/edit-application/${app.id}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Edit Application
        </Link>

        <button
          onClick={deleteApplication}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Delete Application
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <tr>
      <td className="bg-gray-100 p-3 border font-semibold w-[40%]">{label}</td>
      <td className="bg-gray-50 p-3 border w-[60%]">{value || "---"}</td>
    </tr>
  );
}

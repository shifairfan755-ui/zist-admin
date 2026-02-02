import React, { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import PDFViewerModal from "./PDFViewerModal";

export default function DocumentUploader({ bucket, table }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");

  // Load documents from table
  const loadDocs = async () => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (!error) setDocs(data);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // Upload file
  const handleUpload = async () => {
    if (!title || !file) {
      alert("Please enter a title and select a file.");
      return;
    }

    setLoading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // Upload to Supabase bucket
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload failed");
      setLoading(false);
      return;
    }

    // Get public URL
    const publicUrl = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName).data.publicUrl;

    // Insert into DB
    const { error: dbError } = await supabase.from(table).insert({
      title,
      file_url: publicUrl,
      uploaded_at: new Date(),
    });

    if (dbError) console.log(dbError);

    setTitle("");
    setFile(null);
    setLoading(false);

    loadDocs();
  };

  // Delete file
  const deleteDoc = async (id, file_url) => {
    const fileName = file_url.split("/").pop();

    await supabase.storage.from(bucket).remove([fileName]);
    await supabase.from(table).delete().eq("id", id);

    loadDocs();
  };

  // Download file
  const downloadFile = (file_url) => {
    window.open(file_url, "_blank");
  };

  return (
    <div>
      {/* Upload Box */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "70%",
          marginBottom: "30px",
        }}
      >
        <h3>Upload Document</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title / Description"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            background: "#0066ff",
            color: "white",
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* List of uploaded files */}
      <h3>Uploaded Files</h3>

      <table
        style={{
          width: "100%",
          background: "white",
          borderRadius: "10px",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#f0f0f0",
              textAlign: "left",
              padding: "10px",
            }}
          >
            <th style={{ padding: "10px" }}>Title</th>
            <th>Uploaded On</th>
            <th>View</th>
            <th>Download</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {docs.length === 0 && (
            <tr>
              <td
                colSpan="5"
                style={{ textAlign: "center", padding: "20px" }}
              >
                No documents uploaded yet.
              </td>
            </tr>
          )}

          {docs.map((doc) => (
            <tr key={doc.id}>
              <td style={{ padding: "10px" }}>{doc.title}</td>

              <td style={{ padding: "10px" }}>
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </td>

              <td>
                <button
                  onClick={() => setPreviewUrl(doc.file_url)}
                  style={{
                    color: "white",
                    background: "green",
                    padding: "6px 14px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  View
                </button>
              </td>

              <td>
                <button
                  onClick={() => downloadFile(doc.file_url)}
                  style={{
                    color: "white",
                    background: "#007bff",
                    padding: "6px 14px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Download
                </button>
              </td>

              <td>
                <button
                  onClick={() => deleteDoc(doc.id, doc.file_url)}
                  style={{
                    color: "white",
                    background: "red",
                    padding: "6px 14px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PDF Viewer Modal */}
      {previewUrl && (
        <PDFViewerModal
          url={previewUrl}
          onClose={() => setPreviewUrl("")}
        />
      )}
    </div>
  );
}

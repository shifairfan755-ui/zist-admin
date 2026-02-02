import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import PDFViewerModal from "./PDFViewerModal";

export default function DocumentUploader({ bucket, table }) {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setUploadedFiles(data);
    }
  };

  const handleUpload = async () => {
    if (!title || !date || files.length === 0) {
      alert("Please fill title, date and select files");
      return;
    }

    setUploading(true);

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const base = file.name.replace(/\.[^/.]+$/, "");
      const fileName = `${Date.now()}-${base}.${ext}`;
      const filePath = fileName;

      // Upload File
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        alert("Upload failed");
        setUploading(false);
        return;
      }

      // Get Public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicURL = data.publicUrl;

      // Insert DB Record
      await supabase.from(table).insert({
        title: title,
        file_url: publicURL,
        upload_date: date,
      });
    }

    setUploading(false);
    setFiles([]);
    setTitle("");
    setDate("");
    await loadFiles();
  };

  const deleteFile = async (id) => {
    await supabase.from(table).delete().eq("id", id);
    loadFiles();
  };

  const downloadFile = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = url.split("/").pop();
    a.click();
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <input
        type="text"
        placeholder="Title / Description"
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        className="input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="file"
        multiple
        onChange={(e) => setFiles([...e.target.files])}
        style={{ marginTop: "10px", marginBottom: "10px" }}
      />

      <button
        className="btn"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      <table style={{ width: "100%", marginTop: "30px" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>View</th>
            <th>Download</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {uploadedFiles.map((file) => (
            <tr key={file.id}>
              <td>{file.title}</td>
              <td>{file.upload_date}</td>
              <td>
                <button
                  className="viewBtn"
                  onClick={() => setPreviewUrl(file.file_url)}
                >
                  View
                </button>
              </td>
              <td>
                <button
                  className="downloadBtn"
                  onClick={() => downloadFile(file.file_url)}
                >
                  Download
                </button>
              </td>
              <td>
                <button
                  className="deleteBtn"
                  onClick={() => deleteFile(file.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {previewUrl && (
        <PDFViewerModal
          url={previewUrl}
          onClose={() => setPreviewUrl("")}
        />
      )}
    </div>
  );
}

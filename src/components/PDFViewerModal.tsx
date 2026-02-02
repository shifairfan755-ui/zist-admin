import React from "react";

export default function PDFViewerModal({ url, onClose }) {
  if (!url) return null;

  const isPDF = url.toLowerCase().includes(".pdf");
  const isImage =
    url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
    url.includes("image");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
      }}
    >
      <div style={{ position: "relative", width: "90%", height: "90%" }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "red",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          Close
        </button>

        {isPDF ? (
          <iframe
            src={url}
            style={{ width: "100%", height: "100%" }}
            title="PDF Viewer"
          />
        ) : isImage ? (
          <img
            src={url}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
          />
        ) : (
          <div
            style={{
              color: "white",
              textAlign: "center",
              marginTop: "50px",
              fontSize: "22px",
            }}
          >
            Unsupported file format.
          </div>
        )}
      </div>
    </div>
  );
}

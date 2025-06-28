import React, { useState } from "react";
import "./FileUpload.css";

const FileUpload = ({ onFileChange = () => {} }) => { // Default function to avoid errors
  const [fileName, setFileName] = useState("");

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        alert("⚠️ Invalid file type. Please upload a PDF, JPG, or PNG.");
        return;
      }
      setFileName(file.name);
      onFileChange(file); // Safe to call even if onFileChange is not provided
    }
  };

  return (
    <div className="file-upload">
      <input type="file" className="upload-input" onChange={handleChange} accept=".pdf, .jpg, .png" />
      {fileName && <p className="file-name">📂 {fileName}</p>}
    </div>
  );
};

export default FileUpload;
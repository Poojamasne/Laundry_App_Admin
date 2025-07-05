import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";

const ImportExportActions = ({ templateConfig, onImport, onExport }) => {
  const [openImportModal, setOpenImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = React.useState([]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const closeModal = async () => {
    setWarnings([]);
    setOpenImportModal(false);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    //setImportMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      debugger;
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/learningPath.import/${templateConfig.key}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result?.warnings?.length) {
        setWarnings(result.warnings);
      } else {
        setWarnings([result.message || "Import completed"]);
      }
      //setImportMessage(result.message || "Import completed");

      onImport(result);
      // setOpenImportModal(false);
    } catch (error) {
      setWarnings(["Import failed"]);

      //setImportMessage("Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${process.env.backend_url}/admin.export/${templateConfig.exportEndpoint}`
      );
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${templateConfig.header}_export.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  return (
    <MDBox display="flex" justifyContent="flex-end" alignItems="center" mb={2} mt={2} mr={2}>
      <MDBox display="flex" gap={1}>
        <MDButton
          variant="contained"
          color="info"
          startIcon={<CloudUploadIcon />}
          onClick={() => setOpenImportModal(true)}
          size="small"
        >
          Import
        </MDButton>

        <MDButton
          variant="contained"
          color="success"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          size="small"
        >
          Export
        </MDButton>
      </MDBox>

      <Dialog open={openImportModal} onClose={() => closeModal()}>
        <DialogTitle>Import {templateConfig.header}</DialogTitle>
        <DialogContent>
          <input type="file" accept=".xlsx" onChange={handleFileSelect} />
          {templateConfig.importSampleFile && (
            <a
              style={{
                textDecoration: "none",
                color: "#007bff",
                fontSize: "10px",
                padding: "2px 6px",
              }}
              href={templateConfig.importSampleFile}
              download
              target="_blank"
            >
              Sample File
            </a>
          )}
          {/* {importMessage && <p>{importMessage}</p>} */}
          <div>
            {warnings.length > 0 && (
              <div>
                {warnings.map((warning, index) => (
                  <p
                    key={index}
                    className="text-red-500" // Tailwind CSS for red text
                    style={{ color: "red" }} // Inline fallback
                  >
                    {warning}
                  </p>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeModal()}>Cancel</Button>

          <MDButton
            variant="contained"
            color="info"
            startIcon={<CloudUploadIcon />}
            onClick={handleImport}
            disabled={!selectedFile || loading}
          >
            {loading ? "Importing..." : "Import"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default ImportExportActions;

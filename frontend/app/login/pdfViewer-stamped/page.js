"use client";
import React, { useState, useEffect } from 'react';
import { Layout, Tabs } from 'antd';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import RetrieveAPI from '@/utils/api/retrieve';
import { TokenStorage } from '@/utils/tokenStorage';
import StampingAPI from '@/utils/api/stamping';
const { TabPane } = Tabs;
import Swal from 'sweetalert2';
const PDFViewer = () => {
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [pdfUrls, setPdfUrls] = useState({});
  const [loading, setLoading] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [tipe,setTipe] = useState("");
  const router = useRouter();

  useEffect(() => {
      const tipe = sessionStorage.getItem("tipeDokumen");

      setTipe(tipe);
    const loadFiles = async () => {
      try {
        const timestamp = sessionStorage.getItem("timestamp");
        const storedList = JSON.parse(sessionStorage.getItem("filesMetadata")) || [];
        setMetadata(storedList);
        console.log("STORED",storedList);

        if (!storedList || storedList.length === 0) return;

        const filesResp = await RetrieveAPI.getStamped(timestamp);
        console.log("FILERESP", filesResp);

        const formattedFiles = filesResp.data.map((file, index) => ({
          name: file.filename,
          apiUrl: file.url,
          meta: storedList.find(m => m.file === file.filename) || {}
        }));

        console.log("FORMATTED", formattedFiles);
        setFiles(formattedFiles);

        // Load first PDF immediately
        if (formattedFiles.length > 0) {
          loadPDF(formattedFiles[0], 0);
        }
      } catch (error) {
        console.error("Error loading files:", error);
      }
    };

    loadFiles();
  }, []);

  // ✅ Load PDF as blob and create object URL
  const loadPDF = async (file, index) => {
    if (pdfUrls[index]) return; // Already loaded

    setLoading(prev => ({ ...prev, [index]: true }));

    try {

      // Fetch PDF with authentication
const response = await fetch(file.apiUrl, {
  credentials: "include"   // ✅ VERY IMPORTANT
});

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get blob and create object URL
      const blob = await response.blob();
      console.log(`PDF blob size: ${blob.size} bytes, type: ${blob.type}`);

      // Verify it's actually a PDF
      if (!blob.type.includes('pdf') && blob.type !== 'application/octet-stream') {
        console.warn(`Warning: Expected PDF but got ${blob.type}`);
      }

      const objectUrl = URL.createObjectURL(blob);
      
      setPdfUrls(prev => ({
        ...prev,
        [index]: objectUrl
      }));

      console.log(`✅ PDF ${index} loaded successfully`);

    } catch (error) {
      console.error(`❌ Error loading PDF ${index}:`, error);
      alert(`Failed to load PDF: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  // Load PDF when tab changes
  const handleTabChange = (activeKey) => {
    const index = parseInt(activeKey);
    if (files[index] && !pdfUrls[index] && !loading[index]) {
      loadPDF(files[index], index);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(pdfUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [pdfUrls]);

  const handleBack = () => {
    sessionStorage.removeItem("filesMetadata");
    router.push("/login/home");
  };

  const handleSubmit = () => {
    setIsSubmit(true);
    const token = TokenStorage.getToken();
   files.forEach(async (file, index) => {
      try {
        console.log("FILES",file);
        const response = await StampingAPI.stamping(token,  {fileName: file.name.split(".")[0], tipeDokumen: tipe});
        console.log("RESPONSE",response)
        if(response.statusCode == 1){
         Swal.fire({
            icon: "error",
            title: "Gagal Process Data!",
            text: error.message || "An error occurred",
            confirmButtonText: "OK",
        });
        }
        else{
            await Swal.fire({
                              icon: "success",
                              title: "Stamping Berhasil",
                              showConfirmButton: true,
                              timerProgressBar: true,
                              allowOutsideClick: false,
          
                          })
        }
      }
      catch(error){
        console.log("ERROR",error,message);
      Swal.fire({
            icon: "error",
            title: "Gagal Process Data!",
            text: error.message || "Gagal Stamping",
            confirmButtonText: "OK",
        });
        setIsSubmit(false)
      }
    })
  };

  if (files.length === 0) {
    return (
      <Layout
        className="flex justify-center items-center w-screen min-h-screen"
        style={{ background: "#f0f0f0" }}
      >
        <div className="text-center">
          <p className="text-xl mb-4">Loading documents...</p>
          <Button
            variant="contained"
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back to Upload
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      className="w-screen min-h-screen"
      style={{ background: "#f0f0f0", padding: "20px" }}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">PDF Document Viewer</h1>
              <p className="text-gray-600">
                You have uploaded {files.length} document{files.length > 1 ? "s" : ""}.
              </p>
            </div>
            <Button
              variant="contained"
              onClick={handleBack}
              startIcon={<ArrowBack />}
              style={{ backgroundColor: "#4CAF50" }}
            >
              Back
            </Button>
          </div>
        </div>

        {/* PDF Viewer Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <Tabs 
            defaultActiveKey="0" 
            type="card" 
            size="large"
            onChange={handleTabChange}
          >
            {files.map((file, index) => (
              <TabPane
                tab={
                  <div>
                    <strong>{file.name}</strong>
                    <p style={{ fontSize: "12px", margin: 0 }}>
                      {tipe || "-"}
                    </p>
                  </div>
                }
                key={index}
              >
                <div className="p-2">
                  <p>
                    <strong>Tanggal:</strong>{" "}
                    {file.meta?.tgldoc || "Unknown"} <br />
                    <strong>Tipe Dokumen:</strong>{" "}
                    {tipe || "Unknown"} <br />
                    <strong>Nomor Dokumen:</strong>{" "}
                    {file.meta?.file?.split('_')[1] || "Unknown"}
                  </p>

                  <div
                    className="w-full mt-2 bg-gray-100 rounded flex items-center justify-center"
                    style={{ height: "calc(100vh - 400px)" }}
                  >
                    {loading[index] ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading PDF...</p>
                      </div>
                    ) : pdfUrls[index] ? (
                      <iframe
                        src={pdfUrls[index]}
                        className="w-full h-full border-0"
                        title={file.name}
                        style={{ backgroundColor: 'white' }}
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">PDF not loaded</p>
                        <Button
                          variant="contained"
                          onClick={() => loadPDF(file, index)}
                        >
                          Load PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabPane>
            ))}
          </Tabs>

          {/* Submit Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-green-500 rounded-lg p-3 font-bold text-2xl text-white hover:bg-green-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default PDFViewer;
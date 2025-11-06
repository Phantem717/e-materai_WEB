"use client";
import React, { useState, useEffect } from 'react';
import { Layout, Tabs } from 'antd';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import PinCard from '@/app/component/pinCard';
import RetrieveAPI from '@/utils/api/retrieve';
const { TabPane } = Tabs;

const PDFViewer = () => {
  const [files, setFiles] = useState([]);
  const [metadata,setMetadata] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const router = useRouter();
  const [tipe,setTipe]= useState("");
useEffect(() => {
  const loadFiles = async () => {
    const timestamp = sessionStorage.getItem("timestamp");
    const storedList = JSON.parse(sessionStorage.getItem("filesMetadata")) || [];
    setMetadata(storedList);
      const tipe = sessionStorage.getItem("tipeDokumen")
      setTipe(tipe);
    if (!storedList) return;

    const filesResp = await RetrieveAPI.getFiles(timestamp);
    console.log("FILERESP",filesResp);
    const formattedFiles = filesResp.data.map((file, index) => ({
      name: file.filename,
      data: `${file.url}`, // full public file URL
  meta: storedList.find(m => m.file === file.filename) || {}
    }));
    console.log("FORMATTED",formattedFiles);

    setFiles(formattedFiles);
  };

  loadFiles();
}, []);



  const handleBack = () => {
    // ✅ Clear only document data
    sessionStorage.removeItem("filesMetadata");
    router.push("/login/home");
  };

  const handleSubmit = () => {
    setIsSubmit(true);
  };

  if (files.length === 0) {
    return (
      <Layout
        className="flex justify-center items-center w-screen min-h-screen"
        style={{ background: "#f0f0f0" }}
      >
        <div className="text-center">
          <p className="text-xl mb-4">No PDF files to display</p>
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
          <Tabs defaultActiveKey="0" type="card" size="large">
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
                    {file.meta?.file.split('_')[1] || "Unknown"}
                  </p>

                  <div
                    className="w-full mt-2"
                    style={{ height: "calc(100vh - 400px)" }}
                  >
                    <iframe
                      src={encodeURI(file.data)}
                      className="w-full h-full border-0"
                      title={file.name}
                    />
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

      {/* PIN Modal */}
      <PinCard isSubmit={isSubmit} setIsSubmit={setIsSubmit} />
    </Layout>
  );
};

export default PDFViewer;

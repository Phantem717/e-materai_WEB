"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Layout, Form, Select, DatePicker } from "antd";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Add, Close } from "@mui/icons-material";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Swal from "sweetalert2";
import Image from "next/image";
import { useRouter } from "next/navigation";

import instructions from "@/public/images/instructions.jpg";
import StampingAPI from "@/utils/api/stamping";
import RetrieveAPI from "@/utils/api/retrieve";
import { TokenStorage } from "@/utils/tokenStorage";

dayjs.extend(customParseFormat);

const Home = () => {
  const [form] = Form.useForm();
  const [date, setDate] = useState("");
  const [files, setFiles] = useState([]);
  const [types, setTypes] = useState([]);
  const [tipeDokumen, setTipeDokumen] = useState("");
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dateFormat = "YYYY-MM-DD";
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  // Memoize getTypes to avoid infinite loop
  const getTypes = useCallback(async () => {
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const typesResp = await RetrieveAPI.getTypes(token);

      if (typesResp.statusCode === "00") {
        setTypes(typesResp.result);
      } else {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Please login again",
        });
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching types:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load document types",
      });
    }
  }, [router]);

  useEffect(() => {
    getTypes();
  }, [getTypes]);

  const changeDate = (date, dateString) => {
    setDate(dateString);
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      // Check file type
      if (file.type !== "application/pdf") {
        errors.push(`${file.name}: Only PDF files are allowed`);
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check for duplicates
      const isDuplicate = files.some(
        (existingFile) => existingFile.name === file.name && existingFile.size === file.size
      );

      if (isDuplicate) {
        errors.push(`${file.name}: File already uploaded`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Some files were not added",
        html: errors.join("<br>"),
        confirmButtonText: "OK",
      });
    }

    // Add valid files
    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }

    // Reset input
    event.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    console.log("Form submitted with values:", values);

    try {
      // Validate files
      if (files.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Files",
          text: "Please upload at least 1 PDF file",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        return;
      }

      // Validate date
      if (!date) {
        Swal.fire({
          icon: "warning",
          title: "Date Required",
          text: "Please select a date",
        });
        return;
      }

      setLoading(true);
      const token = TokenStorage.getToken();
      const timestamp = Date.now();

      Swal.fire({
        title: "Processing...",
        text: `Uploading ${files.length} file(s)...`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Prepare metadata
      const allPayloads = files.map((file, index) => {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 30);

        return {
          idfile: `${timestamp}_${cleanName}_${index + 1}`,
          file: file.name,
          nodoc: index,
          tgldoc: date,
          nilaidoc: "10000",
          namejidentitas: "KTP",
          noidentitas: "1234567890123456",
          namedipungut: "TEST",
        };
      });

      // Create FormData
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("metadata", JSON.stringify(allPayloads));
      formData.append("spesimenPath", "/app/sharefolder/STAMP/default.png");
      formData.append("tipeDokumen", tipeDokumen);
      formData.append("kode", kode);

      console.log("Sending FormData with", files.length, "files");

      // Send to API
      const batchResponse = await StampingAPI.BatchProcess(token, formData);

      Swal.close();
      setLoading(false);

      if (batchResponse.statusCode === 0) {
        // Store minimal data in session storage
        sessionStorage.setItem("filesPayload", JSON.stringify(allPayloads));
        sessionStorage.setItem("batchProcessResponse", JSON.stringify(batchResponse));

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${files.length} document(s) processed successfully.`,
          confirmButtonText: "View Results",
        }).then(() => {
          router.push("/login/pdfViewer");
        });
      } else {
        throw new Error(batchResponse.message || "Processing failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.close();
      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Processing Failed",
        text: error.message || "Failed to process documents. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Layout
      className="flex justify-center items-center w-screen"
      style={{ background: "transparent", minHeight: "60vh", padding: "20px" }}
    >
      <div className="w-full max-w-2xl">
        <h6 className="text-4xl font-bold mb-6 text-center">Pembubuhan E-Materai</h6>
        <Box className="bg-white rounded-lg p-10 shadow-md">
          <Image
            src={instructions}
            alt="Upload instructions"
            className="mb-5 rounded-lg shadow-md"
            priority
          />

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Upload Section */}
            <Form.Item label="Upload File Dokumen (PDF)">
              <Button
                component="label"
                variant="contained"
                startIcon={<Add />}
                disabled={loading}
                fullWidth
                style={{
                  backgroundColor: loading ? "#E0E0E0" : "#A7A7A7",
                  height: "100px",
                  borderRadius: "15px",
                }}
              >
                {loading ? "Processing..." : "Upload Files"}
                <VisuallyHiddenInput
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  multiple
                  disabled={loading}
                />
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Maximum file size: 10MB per file. Only PDF files are accepted.
              </p>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold">
                    Uploaded Files ({files.length}):
                  </p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-3 rounded hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        size="small"
                        onClick={() => removeFile(index)}
                        disabled={loading}
                        style={{
                          minWidth: "30px",
                          padding: "4px",
                          marginLeft: "8px",
                        }}
                      >
                        <Close fontSize="small" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Item>

            {/* Date Picker */}
            <Form.Item
              label="Tanggal"
              name="tanggal"
              rules={[{ required: true, message: "Please select a date!" }]}
            >
              <DatePicker
                size="large"
                onChange={changeDate}
                format={dateFormat}
                disabled={loading}
                style={{ width: "100%", height: "50px" }}
                disabledDate={(current) => current && current > dayjs()}
                placeholder="Select date"
              />
            </Form.Item>

            {/* Document Type */}
            <Form.Item
              label="Tipe Dokumen"
              name="tipeDokumen"
              rules={[{ required: true, message: "Please select document type!" }]}
            >
              <Select
                placeholder="Select document type"
                size="large"
                disabled={loading}
                onChange={(value) => {
                  const selectedType = types.find((item) => item.nama === value);
                  setTipeDokumen(value);
                  setKode(selectedType?.kode || "");
                }}
              >
                {types.map((item, index) => (
                  <Select.Option key={index} value={item.nama}>
                    {item.nama}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <button
                type="submit"
                disabled={loading || files.length === 0}
                className={`w-full rounded-lg p-3 font-bold text-2xl text-white transition-colors ${
                  loading || files.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </Form.Item>
          </Form>
        </Box>
      </div>
    </Layout>
  );
};

export default Home;
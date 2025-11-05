"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Form, Layout, Select } from 'antd';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Add, Close } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Swal from "sweetalert2";

import instructions from "@/public/images/instructions.jpg";
import StampingAPI from "@/utils/api/stamping";
import RetrieveAPI from "@/utils/api/retrieve";
import { TokenStorage } from '@/utils/tokenStorage';

dayjs.extend(customParseFormat);

const Home = () => {
        const dateFormat = "YYYY-MM-DD";

    const [form] = Form.useForm();
    const [date, setDate] = useState(dayjs(new Date().toISOString(), dateFormat));
    const [files, setFiles] = useState([]);
    const [types, setTypes] = useState([]);
    const [tipeDokumen, setTipeDokumen] = useState("");
    const [kode, setKode] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    // ✅ Fix: Memoize getTypes to prevent infinite loop
    const getTypes = useCallback(async () => {
        try {
            const token = TokenStorage.getToken();
            if (!token) {
                router.push('/login');
                return;
            }

            const typesResp = await RetrieveAPI.getTypes(token);
            
            if (typesResp.statusCode === '00') {
                setTypes(typesResp.result);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Session Expired",
                    text: "Please login again",
                });
                router.push('/login');
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
        console.log("Date selected:", dateString);
        setDate(dateString);
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        const validFiles = [];
        const errors = [];

        selectedFiles.forEach(file => {
            // Check file type
            if (file.type !== 'application/pdf') {
                errors.push(`${file.name}: Only PDF files allowed`);
                return;
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: Exceeds 10MB limit`);
                return;
            }

            // Check duplicates
            const isDuplicate = files.some(
                f => f.name === file.name && f.size === file.size
            );
            if (isDuplicate) {
                errors.push(`${file.name}: Already uploaded`);
                return;
            }

            validFiles.push(file);
        });

        if (errors.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Some files not added",
                html: errors.join("<br>"),
            });
        }

        if (validFiles.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...validFiles]);
        }

        // Reset input
        event.target.value = "";
    };

    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    // Helper function to convert file to base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };
const handleSubmit = async (values) => {
    try {
        // Validate files
        if (files.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Upload Minimal 1 File",
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
            title: 'Processing...',
            text: `Uploading ${files.length} file(s)...`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // ✅ Build metadata only - NO base64 conversion!
        const allPayloads = files.map((file, index) => {
            const cleanName = file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9]/g, "_")
                .substring(0, 30);

            return {
                idfile: `${timestamp}_${cleanName}_${index + 1}`,
                file: file.name,
                nodoc: index + 1,
                namadoc: kode,
                tgldoc: dayjs(date).format('YYYY-MM-DD'),
                nilaidoc: "10000",
                namejidentitas: "KTP",
                noidentitas: "1234567890123456",
                namedipungut: "TEST"
            };
        });
                        console.log("PAYLOADS",allPayloads);


        // ✅ Create FormData for upload
        const formData = new FormData();


        files.forEach((file) => {
            formData.append('files', file);
        });

        formData.append('metadata', JSON.stringify(allPayloads));
        formData.append('tipeDokumen', tipeDokumen);
        formData.append('kode', kode);

        console.log("📤 Sending", files.length, "files to API");

        // Send to API
        const batchResponse = await StampingAPI.BatchProcess(token, formData);

        console.log("=== API RESPONSE ===");
        console.log("Response:", batchResponse);

        Swal.close();
        setLoading(false);

        // Handle response
        if (batchResponse.statusCode === 0 || batchResponse.statusCode === "00") {
            const batchId = batchResponse.result?.batchId;
            
            if (!batchId) {
                throw new Error('No batchId received from server');
            }

            // Fetch processed files info
            const fileResp = await RetrieveAPI.getJSON(batchId);
            console.log("File Response:", fileResp);

            if (fileResp.status === 200) {
                console.log("TEST");
                // ✅ Store ONLY small metadata - NO files!
                sessionStorage.setItem('filesMetadata', JSON.stringify(allPayloads));
                sessionStorage.setItem('batchId', batchId);
                sessionStorage.setItem('tipeDokumen', tipeDokumen);
                sessionStorage.setItem('kode', kode);

                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: `${files.length} dokumen berhasil diproses.`,
                    confirmButtonText: "View Results"
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.push('/login/pdfViewer');
                    }
                });
            } else {
                throw new Error('Failed to retrieve processed files');
            }
        } else {
            throw new Error(batchResponse.message || 'Processing failed');
        }

    } catch (error) {
        console.error("❌ Submit Error:", error);
        Swal.close();
        setLoading(false);

        Swal.fire({
            icon: "error",
            title: "Gagal Process Data!",
            text: error.message || "An error occurred",
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
            style={{ background: 'transparent', minHeight: '60vh', padding: '20px' }}
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

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            tanggal: dayjs()
                        }}
                    >
                        {/* Upload Section */}
                        <Form.Item label={<span className="font-bold text-xl">Upload File Dokumen (PDF)</span>}>
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
                                    fontSize: "18px"
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
                                Max 10MB per file. PDF only.
                            </p>

                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="font-semibold">Uploaded Files ({files.length}):</p>
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
                                                style={{ minWidth: '30px', padding: '4px', marginLeft: '8px' }}
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
                            label={<span className="font-bold text-xl">Tanggal</span>}
                            name="tanggal"
                            rules={[{ required: true, message: 'Please select a date!' }]}
                        >
                            <DatePicker
                                size="large"
                                format={dateFormat}
                                onChange={changeDate}
                                disabled={loading}
                                disabledDate={(current) => current && current > dayjs()}
                                value={date}
                                style={{ width: '100%', height: "50px" }}
                                placeholder="Select date"
                            />
                        </Form.Item>

                        {/* Document Type */}
                        <Form.Item
                            label={<span className="font-bold text-xl">Tipe Dokumen</span>}
                            name="tipeDokumen"
                            rules={[{ required: true, message: 'Please select document type!' }]}
                        >
                            <Select
                                placeholder="Select document type"
                                size="large"
                                disabled={loading}
                                style={{ width: "100%", height: "50px" }}
                                onChange={(value) => {
                                    const selectedType = types.find(item => item.nama === value);
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

                        {/* Submit Button */}
                        <Form.Item>
                            <button
                                type="submit"
                                disabled={loading || files.length === 0}
                                className={`w-full rounded-lg p-3 font-bold text-2xl text-white transition-colors ${loading || files.length === 0
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

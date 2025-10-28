"use client";
import {React,useState,useEffect} from "react";
import { Flex, Form, Layout, Select } from 'antd';
import { Box, FormControl,Button,InputLabel, MenuItem } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { DatePicker } from "antd";
import instructions from "@/public/images/instructions.jpg"
import dayjs from 'dayjs';
import StampingAPI from "@/utils/api/stamping";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Add, Close } from "@mui/icons-material";
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@/utils/tokenStorage';
import RetrieveAPI from "@/utils/api/retrieve";
import Image from "next/image";
import Swal from "sweetalert2";
const Home= () => {
    const [date,setDate]= useState("");
    const [files, setFiles] = useState([]);
    const [filesPayload,setFilesPayload] = useState([]);
    const [nomorDokumen, setNomorDokumen] = useState("");
    const [tipeDokumen, setTipeDokumen] = useState("");
    const router = useRouter();
    const [types,setTypes]= useState([]);
    const [kode,setKode] = useState("");

    dayjs.extend(customParseFormat);
    const dateFormat="YYYY-MM-DD"

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

    const getTypes = async()=>{
        const token = TokenStorage.getToken();

        const typesResp = await RetrieveAPI.getTypes(token);
        console.log("TYPES",typesResp.result);

        setTypes(typesResp.result);
    }

    useEffect(() => {
        getTypes();
        
    },[])

    const changeDate = (date,dateString) => {
        console.log("date",date,dateString);
        setDate(dateString);
    }

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        // Filter only PDF files
        const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
        console.log("PDF",pdfFiles);
        setFiles(prevFiles => [...prevFiles, ...pdfFiles]);

    }

    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    }

    const handleSubmit = async (values) => {
        try {
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
        const token = TokenStorage.getToken();

        // Convert files to base64 for passing through router
            const timestamp = Date.now();

        const fileData = await Promise.all(
        files.map(async (file, index) => {
            const base64 = await convertToBase64(file);
            const cleanName = file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9]/g, "_")
                .substring(0, 30);

            const payload = {
                idfile: `${timestamp}_${cleanName}_${index + 1}`,
                file: file.name,
                nodoc: index,
                tgldoc: date,
                nilaidoc:"10000",
                namejidentitas: "-",
                noidentitas: "-",
                namedipungut: "-"
            };
            
            return {
                name: file.name,
                size: file.size,
                data: base64,
                payload: payload,  // Include payload in each file object
                meta: {
                    date: values.tanggal.format('YYYY-MM-DD'),
                    tipeDokumen: values.tipeDokumen,
                    nomorDokumen: file.name
                }
            };
        })
    );

    // Build the complete payloads array
    const allPayloads = fileData.map(item => item.payload);
    console.log("ALLPAYLOADS",allPayloads);
    
    // Update state with all payloads
    setFilesPayload(allPayloads);  // ✅ Set entire array at once
    
    // Store in sessionStorage
    sessionStorage.setItem('documentDataList', JSON.stringify(fileData));
    sessionStorage.setItem('filesPayload', JSON.stringify(allPayloads));  // Store payloads separately if needed

    const batchResponse = await StampingAPI.BatchProcess(token,allPayloads)
    console.log("RESP",batchResponse);

    if(batchResponse.statusCode == 0){
          Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data berhasil diproses.`,
        timer: 1500,
        showConfirmButton: true,
      }).then((result) => {
        if(result.isConfirmed){
        router.push('/login/pdfViewer');

        }
      });

    }
        // Navigate to PDF viewer page

        } catch (error) {
            console.error("❌ Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Process Data!",
        text: error.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
        }
       
    }

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    

    return (
        <Layout className="flex justify-center items-center w-screen " style={{background:'transparent', minHeight: '60vh'}}>
            <h6 className="text-4xl font-bold mb-6 text-center">Pembubuhan E - Materai</h6>
            
            <Box className="w-1/3 h-1/2 bg-white rounded-lg p-10 shadow-md ">
                <Image
                         src={instructions}
                         alt="instructions"
                        className="mb-5 rounded-lg shadow-md"
                       />
                <Form 
                    layout="vertical" 
                    onFinish={handleSubmit}
                    initialValues={{
                        tanggal: dayjs(new Date().toISOString(), dateFormat)
                    }}
                >
                    <Form.Item > 
                        <div className="flex flex-col">
                            <label className="font-bold text-xl mb-2">
                                Upload File Dokumen (PDF)
                            </label>
                            <Button
                                component="label"
                                style={{
                                    color:"black",
                                    fontWeight:"superbold",
                                    fontSize:"20px",
                                    backgroundColor:"#A7A7A7",
                                    padding:"10px",
                                    height:"100px",
                                    borderRadius:"15px"
                                }}
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<Add/>}
                            >
                                Upload files
                                <VisuallyHiddenInput
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    multiple
                                />
                            </Button>

                            {/* Display uploaded files */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="font-semibold">Uploaded Files ({files.length}):</p>
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                            <span className="text-sm truncate flex-1">{file.name}</span>
                                            <Button 
                                                size="small" 
                                                onClick={() => removeFile(index)}
                                                style={{minWidth: '30px', padding: '4px'}}
                                            >
                                                <Close fontSize="small" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Form.Item>

                    <div className="flex justify-between w-full flex-row gap-5">
                        <div className="flex flex-col flex-1">
                            <label className="font-bold text-xl mb-2">
                                Tanggal
                            </label>
                            <Form.Item name="tanggal" rules={[{ required: true, message: 'Please select a date!' }]}>
                                <DatePicker 
                                    size="large"
                                    onChange={changeDate} 
                                    maxDate={dayjs(new Date().toISOString(), dateFormat)}
                                    style={{ width: '100%', height:"50px"}} 
                                />                    
                            </Form.Item>
                        </div>
                        
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-xl mb-2">
                           Tipe Dokumen
                        </label>
                        <Form.Item 
                            name="tipeDokumen" 
                            rules={[{ required: true, message: 'Please select document type!' }]}
                        >                     
                        <Select
                            placeholder="Select document type"
                            style={{ width: "100%", height: "50px" }}
                            onChange={(value) => {
                                const selectedType = types.find(item => item.nama === value);
                                setTipeDokumen(value);
                                setKode(selectedType?.kode || ""); // ✅ sets kode based on selection
                            }}
                        >
                            {types.map((item, index) => (
                                <Select.Option key={index} value={item.nama}>
                                    {item.nama}
                                </Select.Option>
                            ))}
                        </Select>
                        </Form.Item>
                    </div>
                    
                    <Form.Item >
                        <button 
                            type="submit" 
                            className="w-full bg-green-500 rounded-lg p-3 font-bold text-2xl text-white hover:bg-green-600"
                        >
                            Submit
                        </button>
                    </Form.Item>
                </Form>
            </Box>
        </Layout>
    )
}

export default Home;
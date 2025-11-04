"use client";
import {React,useState,useEffect} from "react";
import { Flex, Form, Layout, Select } from 'antd';
import { Box, TextField, Typography, Button } from '@mui/material';

import ReturnAPI from "@/utils/api/return";
import { TokenStorage } from "@/utils/tokenStorage";
const Return= () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = TokenStorage.getToken();
            const response = await ReturnAPI.getData(token);
            setData(response);
        } catch (error) {
            console.error('Error:', error);
            setData({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

 
   
    return (
        <Layout style={{ background: '#f0f0f0', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '10px' }}>
                <h1>📋 Stamping Results</h1>
                
                <Button onClick={fetchData} loading={loading} style={{ marginBottom: '20px' }}>
                    🔄 Refresh
                </Button>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '20px', 
                        borderRadius: '5px',
                        overflow: 'auto',
                        maxHeight: '600px'
                    }}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
            </div>
        </Layout>
    )
}

export default Return;

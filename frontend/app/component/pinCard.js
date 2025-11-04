"use client";
import React, { useState } from "react";
import { Form } from 'antd';
import { Box, Modal, Backdrop, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PinCard = ({ isSubmit, setIsSubmit }) => {
    const [pin, setPin] = useState("");

    const handleClose = () => {
        setIsSubmit(false);
    };

    const handleSubmit = (values) => {
        console.log("PIN submitted:", values.pin);
        // Add your PIN validation logic here
        // After validation, close modal
        handleClose();
    };

    return (
        <Modal 
            open={isSubmit}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 300 }}
            className="flex justify-center items-center z-100"

        >
            <Fade in={isSubmit}>
                <Box className="bg-white rounded-lg p-10 shadow-md" style={{ width: '400px', maxWidth: '90%' }}>
                    {/* Close Button */}
                    <div className="flex justify-end mb-4">
                        <CloseIcon 
                            onClick={handleClose} 
                            className="cursor-pointer hover:text-gray-600"
                        />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-center">Enter PIN</h2>

                    {/* Form */}
                    <Form 
                        layout="vertical" 
                        onFinish={handleSubmit}
                    >
                        <Form.Item 
                            name="pin" 
                            rules={[{ required: true, message: 'Please input your PIN!' }]}
                        >
                            <label className="font-bold text-xl mb-2 block">
                                PIN
                            </label>
                            <input 
                                type="password" 
                                className="w-full border p-2 rounded" 
                                style={{ height: '50px', fontSize: '16px' }}
                                maxLength={6}
                                placeholder="Enter your PIN"
                            />
                        </Form.Item>
                        
                        <Form.Item>
                            <button 
                                type="submit" 
                                className="w-full bg-green-500 rounded-lg p-3 font-bold text-2xl text-white hover:bg-green-600"
                            >
                                Submit
                            </button>
                        </Form.Item>
                    </Form>
                </Box>
            </Fade>
        </Modal>
    );
}

export default PinCard;
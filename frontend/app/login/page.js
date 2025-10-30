"use client";
import React, { useState } from "react";
import { Box, TextField, Typography, Button } from '@mui/material';
import Swal from "sweetalert2";
import { useRouter } from 'next/navigation';
import loginAPI from "@/utils/api/login";
import { TokenStorage } from "@/utils/tokenStorage";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ username: "", password: "" });
    const router = useRouter();

    const validateForm = () => {
        let isValid = true;
        const newErrors = { username: "", password: "" };

        if (!username) {
            newErrors.username = "Please input your username!";
            isValid = false;
        }

        if (!password) {
            newErrors.password = "Please input your password!";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const loginResponse = await loginAPI.checkLogin(username, password);
            console.log("LOGINRESP", loginResponse);

            if (loginResponse) {
                // localStorage.setItem('token', loginResponse.data.token);
                // localStorage.setItem("refresh_token", loginResponse.data.refresh_token);
                TokenStorage.setToken(loginResponse.result.data.login.token);
                
                await Swal.fire({
                    icon: "success",
                    title: "Login Berhasil",
                    showConfirmButton: true,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                }).then((result) => {
                    if(result.isConfirmed){
                        router.push("/login/home");

                    }
                });

            }
        } catch (error) {
            console.error("Error During Login", error.message);
            await Swal.fire({
                icon: "error",
                title: "Login Gagal",
                text: error.message || "Terjadi kesalahan saat login",
                showConfirmButton: true,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    return (
        <Box 
            className="flex justify-center items-center w-screen" 
            style={{ background: 'transparent', minHeight: '60vh' }}
        >
            {/* Login Card/Panel */}
            <Box className="w-1/4 bg-white rounded-lg p-10 shadow-md" sx={{ minWidth: '350px' }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h4" className="font-bold mb-6 text-center">
                        Login Portal
                    </Typography>

                    {/* Username Field */}
                    <Box sx={{ mb: 3 }}>
                        <Typography className="font-bold text-xl mb-2">
                            Username
                        </Typography>
                        <TextField
                            fullWidth
                            type="text"
                            variant="outlined"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (errors.username) {
                                    setErrors({ ...errors, username: "" });
                                }
                            }}
                            error={!!errors.username}
                            helperText={errors.username}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '50px',
                                }
                            }}
                        />
                    </Box>

                    {/* Password Field */}
                    <Box sx={{ mb: 3 }}>
                        <Typography className="font-bold text-xl mb-2">
                            Password
                        </Typography>
                        <TextField
                            fullWidth
                            type="password"
                            variant="outlined"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors({ ...errors, password: "" });
                                }
                            }}
                            error={!!errors.password}
                            helperText={errors.password}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '50px',
                                }
                            }}
                        />
                    </Box>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            padding: '12px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#45a049',
                            }
                        }}
                    >
                        Log in
                    </Button>
                </form>
            </Box>
        </Box>
    );
};

export default Login;
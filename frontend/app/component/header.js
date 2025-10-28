"use client"
import {React,useState} from "react";
import { Box, Button } from '@mui/material';
import Image from 'next/image'; // Impor komponen Image dari Next.js
import logo from '@/public/images/logo.png';
import LiveClock from './liveclock'; // Impor komponen LiveClock
import { usePathname, useRouter } from 'next/navigation';
import { TokenStorage } from "@/utils/tokenStorage";
import Swal from "sweetalert2";
const Header = () => {
  const pathname = usePathname();
    const router = useRouter();

    const pagesWithLogout = ['/login/home', '/login/pdf-viewer'];
      const showLogout = pagesWithLogout.includes(pathname);

      const handleLogout = async () => {
        TokenStorage.removeToken();
        await Swal.fire({
        icon: 'success',
        title: 'Berhasil Logout',
        showConfirmButton: false,
        timer: 1500,
      });
      router.push('/login');
      }
return (
    <Box className="header bg-green-600 shadow-2xl"       
    sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 1,
        width: '100%',
      }}
      
      >
      <Box
        sx={{
          flex: '0 0 auto',
          paddingRight: 1,
          marginLeft: '20px', // Tambahkan margin kiri untuk menggeser logo lebih ke kanan
        }}
      >
        <Image
          src={logo}
          alt="Logo"
          width={300} // Sesuaikan ukuran jika perlu
          height={100}
        />
      </Box>   
           <Box
        sx={{
          flex: '1 1 auto', // Memastikan LiveClock berada di tengah
          display: 'center',
          justifyContent: 'center',
        }}
      >
        <LiveClock />
      </Box> 

        {showLogout && 
        <Box
      sx={{
          flex: '0 0 auto',
          paddingRight: 1,
          marginLeft: '20px', // Tambahkan margin kiri untuk menggeser logo lebih ke kanan
        }}
        >
        <Button
        variant="contained"
        color="error"
        onClick={handleLogout}>
          Logout
        </Button>
      </Box>
        }
      
      </Box>
)
}

export default Header;
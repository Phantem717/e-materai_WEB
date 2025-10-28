// components/LiveClock.js
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval saat komponen di-unmount
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}, ${dateNum} ${month} ${year}`;
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      position="absolute"
      top={30}  // Menempatkan elemen di bagian atas halaman
      left={10}
      bottom={40}
      width="100%"  // Memastikan elemen memenuhi lebar halaman
      display="flex"
      flexDirection="column"
      alignItems="center"
      marginBottom={0}
    >
      <Typography variant="h4" gutterBottom sx={{ fontSize: '40px', fontWeight:'bold', marginBottom: 0  }}>
        {formatTime(currentTime)}
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ fontSize: '25px'}}>
        {formatDate(currentTime)}
      </Typography>
    </Box>
  );
};

export default LiveClock;

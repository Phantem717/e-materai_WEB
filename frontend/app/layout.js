"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/component/header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* ❌ The old Header location was invalid HTML */}
 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} 
        style={{
          backgroundImage: 'url("/images/login_screen.png")', 
          backgroundSize: 'cover',        // Scales the image to cover the entire container
          backgroundRepeat: 'no-repeat',  // Prevents tiling
          backgroundPosition: 'center center', // Centers the image
          minHeight: '100vh',   
        }}
      >
        {/* ✅ CORRECT: The Header is placed inside the body. 
             It will render at the top of every page. */}
        
                        <Header /> 

        {children} {/* This renders the content of the current page */}
      </body>
    </html>
  );
}
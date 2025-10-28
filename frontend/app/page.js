"use client";

import { useEffect } from "react";
export default function Home() {

  useEffect(() => {
    window.location.href = `http://172.16.158.22:3000/login`; // 🔀 Redirect langsung ke login RBAC
  }, []);

  return null;
  
}

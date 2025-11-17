"use client";

import { useEffect } from "react";
export default function Home() {

  useEffect(() => {

    window.location.href = `http://192.168.6.87:3000/login`; // 🔀 Redirect langsung ke login RBAC
  }, []);

  return null;
  
}

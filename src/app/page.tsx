"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    // check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/home"); 
    } else {
      router.replace("/landing"); 
    }
  }, [router]);

  return null; 
}

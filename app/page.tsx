"use client";

import Furdle from "@/components/Furdle";
import { useEffect, useState } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  return <Furdle />;
}

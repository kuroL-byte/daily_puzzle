"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginButton() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const token = await result.user.getIdToken();

    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-white text-black rounded"
    >
      Sign in with Google
    </button>
  );
}

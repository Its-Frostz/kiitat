"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        router.push("/dashboard");
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        router.push("/dashboard");
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          hd: process.env.ALLOWED_EMAIL_DOMAIN || "kiit.ac.in",
        },
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-3xl font-bold">Attendance Web App</h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}

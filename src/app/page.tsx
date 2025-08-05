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
    <>
    {/* <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-3xl font-bold">Attendance Web App</h1>
    </div> */}

    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
        @import url('https://unpkg.com/normalize.css');

        :root {
          --font-size-min: 14;
          --font-size-max: 20;
          --font-ratio-min: 1.1;
          --font-ratio-max: 1.33;
          --font-width-min: 375;
          --font-width-max: 1500;
        }

        h2,
        li:last-of-type {
          background: linear-gradient(
            canvasText 50%,
            color-mix(in oklch, canvas, canvasText 25%)
          );
          background-clip: text;
          color: #0000;
        }

        header {
          min-height: 100vh;
          display: flex;
          place-items: center;
          width: 100%;
          padding-inline: 5rem;
        }

        h1 {
          --font-size-min: 24;
          --font-level: 8;
          text-wrap: pretty;
          line-height: 0.98;
          margin: 0;
          background: linear-gradient(
            170deg,
            canvasText 5%,
            color-mix(in oklch, canvas, canvasText 15%)
          );
          padding: 18px 0;
          background-clip: text;
          color: #0000;
        }

        .fluid {
          --fluid-min: calc(
            var(--font-size-min) * pow(var(--font-ratio-min), var(--font-level, 0))
          );
          --fluid-max: calc(
            var(--font-size-max) * pow(var(--font-ratio-max), var(--font-level, 0))
          );
          --fluid-preferred: calc(
            (var(--fluid-max) - var(--fluid-min)) /
              (var(--font-width-max) - var(--font-width-min))
          );
          --fluid-type: clamp(
            (var(--fluid-min) / 16) * 1rem,
            ((var(--fluid-min) / 16) * 1rem) -
              (((var(--fluid-preferred) * var(--font-width-min)) / 16) * 1rem) +
              (var(--fluid-preferred) * var(--variable-unit, 100vi)),
            (var(--fluid-max) / 16) * 1rem
          );
          font-size: var(--fluid-type);
        }

        *,
        *:after,
        *:before {
          box-sizing: border-box;
        }`}</style>
    
    <header>
      <h1 className="fluid">
        you can
        <br />
        do Anything.
      </h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </header>
  </>
  );
}

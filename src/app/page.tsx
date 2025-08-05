"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Headertext from "@/components/ui/Headertext";
import { Button } from "@/components/ui/button";
import { IconBrandGoogle } from '@tabler/icons-react';
import { IconMail } from '@tabler/icons-react';
import ShinyText from "@/components/ShinyText";
// import LoadingAnimation from "@/components/ui/Loading";
import useIsMobile from "@/util";

export default function Home() {
  const [, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/dashboard`,
        queryParams: {
          hd: process.env.ALLOWED_EMAIL_DOMAIN || "kiit.ac.in",
        },
      },
    });
    if (error) setError(error.message);
  };
  const signInWithEmail = async () => {
    alert("Email Implementation is under progress");
  };

  return (
    <>
      <Headertext title={
        isMobile ? "KIITAT say   No to Proxies" : "KIITAT say       No to Proxies"
      }>
        <div className="flex gap-4 ml-0 md:ml-3">
          <Button variant="outline" size="lg" onClick={signInWithGoogle}>
            <IconBrandGoogle stroke={1.25} /><ShinyText text="Google" />
          </Button>
          <Button variant="outline" size="lg" onClick={signInWithEmail}>
            <IconMail stroke={1.25} /><ShinyText text="Email" />
          </Button>
          {error && <div className="text-red-600">{error}</div>}
        </div>

      </Headertext>
      {/* <LoadingAnimation /> */}
    </>
  );
}

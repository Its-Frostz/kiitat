"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [role, setRole] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!role || (role === "STUDENT" && (!year || !section))) {
      setError("Please fill all required fields.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      return;
    }

    // Save onboarding info to user metadata
    const updates: { role: string; year?: string; section?: string } = { role };
    if (role === "STUDENT") {
      updates.year = year;
      updates.section = section;
    }
    
    const { error: updateError } = await supabase.auth.updateUser({ data: updates });
    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Sync user to database
    try {
      const syncResponse = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0],
          role,
          year: role === "STUDENT" ? year : null,
          section: role === "STUDENT" ? section : null,
        }),
      });

      const syncResult = await syncResponse.json();
      if (!syncResult.success) {
        console.error('User sync failed:', syncResult.error);
        // Continue anyway - we'll handle this gracefully
      }
    } catch (syncError) {
      console.error('User sync error:', syncError);
      // Continue anyway - we'll handle this gracefully
    }

    // Redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-2xl font-bold">Onboarding</h1>
      <form className="flex flex-col gap-4 w-80" onSubmit={handleSubmit}>
        <label className="font-medium">Select your role:</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="p-2 border rounded" required>
          <option value="">-- Select Role --</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
        {role === "STUDENT" && (
          <>
            <label className="font-medium">Year:</label>
            <input type="number" min="1" max="5" value={year} onChange={e => setYear(e.target.value)} className="p-2 border rounded" required={role === "STUDENT"} />
            <label className="font-medium">Section:</label>
            <input type="text" value={section} onChange={e => setSection(e.target.value)} className="p-2 border rounded" required={role === "STUDENT"} />
          </>
        )}
        <button type="submit" className="bg-blue-600 text-white py-2 rounded mt-4">Continue</button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}

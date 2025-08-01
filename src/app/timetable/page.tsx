"use client";
import { useState } from "react";

export default function TimetablePage() {
  const [json, setJson] = useState("");
  const [timetable, setTimetable] = useState<any>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setTimetable(data);
        setJson(JSON.stringify(data, null, 2));
        setError("");
      } catch {
        setError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (!year || !section || !timetable) {
      setError("Year, section, and timetable are required.");
      return;
    }
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: Number(year), section, timetable }),
    });
    const result = await res.json();
    if (result.success) setSuccess("Timetable saved!");
    else setError(result.error || "Failed to save timetable.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-2xl font-bold">Timetable Upload & View</h1>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <input
        type="file"
        accept="application/json"
        onChange={handleUpload}
        className="mb-4"
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSave}
        disabled={!timetable}
      >
        Save Timetable
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      {timetable && (
        <pre className="bg-gray-100 p-4 rounded w-full max-w-2xl overflow-x-auto text-xs text-left">
          {json}
        </pre>
      )}
    </div>
  );
}

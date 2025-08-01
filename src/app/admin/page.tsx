"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'timetable' | 'analytics'>('users');

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <div className="flex gap-4 mb-4">
        <button className={`px-4 py-2 rounded ${tab==='users'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setTab('users')}>Users</button>
        <button className={`px-4 py-2 rounded ${tab==='timetable'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setTab('timetable')}>Timetable</button>
        <button className={`px-4 py-2 rounded ${tab==='analytics'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setTab('analytics')}>Analytics</button>
      </div>
      {tab === 'users' && <UsersTab />}
      {tab === 'timetable' && <TimetableTab />}
      {tab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  useEffect(() => {
    let url = "/api/users";
    const params = [];
    if (role) params.push(`role=${role}`);
    if (year) params.push(`year=${year}`);
    if (section) params.push(`section=${section}`);
    if (params.length) url += `?${params.join("&")}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, [role, year, section]);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-2xl">
      <div className="flex gap-2 mb-4">
        <select value={role} onChange={e=>setRole(e.target.value)} className="p-2 border rounded">
          <option value="">All Roles</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
        <input type="number" placeholder="Year" value={year} onChange={e=>setYear(e.target.value)} className="p-2 border rounded" />
        <input type="text" placeholder="Section" value={section} onChange={e=>setSection(e.target.value)} className="p-2 border rounded" />
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Year</th>
            <th className="p-2">Section</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && <tr><td colSpan={4} className="p-2 text-gray-500">No users found.</td></tr>}
          {users.map((u, i) => (
            <tr key={i}>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.year || '-'}</td>
              <td className="p-2">{u.section || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimetableTab() {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [editing, setEditing] = useState<{ year: number, section: string } | null>(null);
  const [editJson, setEditJson] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTimetables = () => {
    fetch('/api/timetable/all')
      .then(res => res.json())
      .then(data => setTimetables(data.timetables || []));
  };
  useEffect(fetchTimetables, []);

  const handleEdit = (tt: any) => {
    setEditing({ year: tt.year, section: tt.section });
    setEditJson(JSON.stringify(tt.data, null, 2));
    setError("");
    setSuccess("");
  };
  const handleSave = async () => {
    if (!editing) return;
    try {
      const data = JSON.parse(editJson);
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: editing.year, section: editing.section, timetable: data }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess('Timetable updated!');
        setEditing(null);
        fetchTimetables();
      } else {
        setError(result.error || 'Failed to update timetable.');
      }
    } catch {
      setError('Invalid JSON');
    }
  };
  const handleDelete = async (year: number, section: string) => {
    if (!window.confirm('Delete timetable for this year/section?')) return;
    const res = await fetch(`/api/timetable?year=${year}&section=${section}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setSuccess('Timetable deleted!');
      fetchTimetables();
    } else {
      setError(result.error || 'Failed to delete timetable.');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-2xl">
      <h3 className="font-semibold mb-4">Timetables</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {editing ? (
        <div className="mb-4">
          <div className="mb-2">Editing timetable for Year {editing.year}, Section {editing.section}</div>
          <textarea className="w-full h-40 p-2 border rounded font-mono text-xs" value={editJson} onChange={e=>setEditJson(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      ) : null}
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Year</th>
            <th className="p-2">Section</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {timetables.length === 0 && <tr><td colSpan={3} className="p-2 text-gray-500">No timetables found.</td></tr>}
          {timetables.map((tt, i) => (
            <tr key={i}>
              <td className="p-2">{tt.year}</td>
              <td className="p-2">{tt.section}</td>
              <td className="p-2 flex gap-2">
                <button className="bg-yellow-400 px-2 py-1 rounded" onClick={()=>handleEdit(tt)}>Edit</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={()=>handleDelete(tt.year, tt.section)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsTab() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);
  const handleExport = async () => {
    const res = await fetch('/api/attendance/export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-2xl">
      <h3 className="font-semibold mb-4">Analytics</h3>
      {!stats && <div>Loading...</div>}
      {stats && (
        <div className="space-y-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded mb-4" onClick={handleExport}>Export Attendance CSV</button>
          <div>Total Users: <b>{stats.totalUsers}</b></div>
          <div>Total Attendance Records: <b>{stats.totalAttendance}</b></div>
          <div className="mt-4">
            <h4 className="font-semibold">Attendance by Year/Section</h4>
            <table className="w-full text-xs mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Year</th>
                  <th className="p-2">Section</th>
                  <th className="p-2">Attendance Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.bySection.length === 0 && <tr><td colSpan={3} className="p-2 text-gray-500">No data</td></tr>}
                {stats.bySection.map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2">{row.year}</td>
                    <td className="p-2">{row.section}</td>
                    <td className="p-2">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

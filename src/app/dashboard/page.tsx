"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import type { User } from "@supabase/supabase-js";

interface Session {
  id: string;
  createdAt: string;
  year: number;
  section: string;
  teacherId: string;
  latitude: number;
  longitude: number;
  validFrom: string;
  validTo: string;
  attendances?: {
    id: string;
    userId: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }[];
}

interface Student {
  user: {
    id: string;
    email: string;
    name: string;
    year?: number;
    section?: string;
  };
  email?: string;
  year?: number;
  section?: string;
  timestamp?: string;
}

interface AttendanceRecord {
  qrSessionId: string;
  timestamp?: string;
  createdAt?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
      
      // If not onboarded, redirect to onboarding
      if (data.user && (!data.user.user_metadata.role || (data.user.user_metadata.role === "STUDENT" && (!data.user.user_metadata.year || !data.user.user_metadata.section)))) {
        router.push("/onboarding");
        return;
      }

      // Auto-sync user to database if they have completed onboarding
      if (data.user && data.user.user_metadata.role) {
        try {
          const syncResponse = await fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata.full_name || data.user.user_metadata.name || data.user.email?.split('@')[0],
              role: data.user.user_metadata.role,
              year: data.user.user_metadata.year,
              section: data.user.user_metadata.section,
            }),
          });
          
          const syncResult = await syncResponse.json();
          if (!syncResult.success) {
            console.warn('User sync failed:', syncResult.error);
          }
        } catch (error) {
          console.error('Auto-sync failed:', error);
          // Continue anyway - we'll handle gracefully in APIs
        }
      }
    };
    getUser();
  }, [router]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <div className="flex items-center justify-center min-h-screen">Not authenticated</div>;

  const role = user.user_metadata.role;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {role === "TEACHER" ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />}
    </div>
  );
}

function TeacherDashboard({ user }: { user: User }) {
  const [qrValue, setQrValue] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  // QR generation form state
  const [selectedYear, setSelectedYear] = useState<number>(user.user_metadata.year || 1);
  const [selectedSection, setSelectedSection] = useState<string>(user.user_metadata.section || 'A');
  const [showQRForm, setShowQRForm] = useState(false);
  
  useEffect(() => {
    fetch(`/api/qr-session?teacherId=${user.id}`)
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []));
  }, [user.id]);

  const generateQR = async () => {
    setLoading(true);
    setInfo('');
    
    // Get teacher location
    if (!navigator.geolocation) {
      setInfo('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      try {
        // Create QR session via API
        const response = await fetch('/api/qr-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: user.id,
            year: selectedYear,
            section: selectedSection,
            latitude,
            longitude,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Production-ready URL generation with proper encoding
          const baseUrl = window.location.origin;
          const sessionData = JSON.stringify(result.qrPayload);
          const encodedData = encodeURIComponent(sessionData);
          
          // Create clean, scannable URL
          const attendanceUrl = `${baseUrl}/attendance?session=${result.sessionId}&data=${encodedData}`;
          
          // Set the QR value
          setQrValue(attendanceUrl);
          
          console.log('Generated QR URL:', attendanceUrl);
          console.log('URL length:', attendanceUrl.length);
          console.log('QR generated for Year:', selectedYear, 'Section:', selectedSection);
          console.log('QR Payload contains:', result.qrPayload);
          
          // Show appropriate message
          if (window.location.hostname === 'localhost') {
            setInfo(`QR code generated for Year ${selectedYear}, Section ${selectedSection}! Note: localhost URLs only work on the same device. Deploy to test with phones.`);
          } else {
            setInfo(`QR code generated for Year ${selectedYear}, Section ${selectedSection}! Valid for 5 minutes.`);
          }
          
          // Refresh sessions list
          fetch(`/api/qr-session?teacherId=${user.id}`)
            .then(res => res.json())
            .then(data => setSessions(data.sessions || []));
        } else {
          setInfo(result.error || 'Failed to generate QR code');
        }
      } catch (error) {
        console.error('QR generation error:', error);
        setInfo('Failed to generate QR code');
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Location error:', error);
      setInfo('Location permission denied');
      setLoading(false);
    });
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    // Students are already included in the session data
    const attendeesData = session.attendances?.map(att => ({
      user: att.user,
      email: att.user.email,
      timestamp: att.timestamp,
    })) || [];
    setStudents(attendeesData);
  };

  const handleExport = async (session: Session) => {
    try {
      // Create CSV data from session attendances
      const attendances = session.attendances || [];
      const csvHeader = 'Email,Name,Timestamp,Latitude,Longitude\n';
      const csvRows = attendances.map(att => 
        `${att.user.email},${att.user.name},${att.timestamp},${att.latitude},${att.longitude}`
      ).join('\n');
      const csvContent = csvHeader + csvRows;
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-session-${session.id.slice(0, 8)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setInfo('Failed to export attendance data');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">Teacher Panel</h2>
      <p>Welcome, {user.user_metadata.full_name}</p>
      
      {!showQRForm ? (
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded" 
          onClick={() => setShowQRForm(true)}
        >
          Generate Attendance QR
        </button>
      ) : (
        <div className="bg-grey-800 p-6 rounded-lg shadow-md w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Generate QR Code</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Year</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Section</label>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
              <option value="E">Section E</option>
              <option value="F">Section F</option>
              <option value="G">Section G</option>
              <option value="H">Section H</option>
              <option value="I">Section I</option>
              <option value="J">Section J</option>
              <option value="K">Section K</option>
              <option value="L">Section L</option>
              <option value="M">Section M</option>
              <option value="N">Section N</option>
              <option value="O">Section O</option>
              <option value="P">Section P</option>
              <option value="Q">Section Q</option>
              <option value="R">Section R</option>
              <option value="S">Section S</option>
              <option value="T">Section T</option>
              <option value="U">Section U</option>
              <option value="V">Section V</option>
              <option value="W">Section W</option>
              <option value="X">Section X</option>
              <option value="Y">Section Y</option>
              <option value="Z">Section Z</option>
              <option value="A1">Section A1</option>
              <option value="A2">Section A2</option>
              <option value="A3">Section A3</option>
              <option value="A4">Section A4</option>
              <option value="A5">Section A5</option>
              <option value="A6">Section A6</option>
              <option value="A7">Section A7</option>
              <option value="A8">Section A8</option>
              <option value="A9">Section A9</option>
              <option value="A10">Section A10</option>
              <option value="A11">Section A11</option>
              <option value="A12">Section A12</option>
              <option value="A13">Section A13</option>
              <option value="A14">Section A14</option>
              <option value="A15">Section A15</option>
              <option value="A16">Section A16</option>
              <option value="A17">Section A17</option>
              <option value="A18">Section A18</option>
              <option value="A19">Section A19</option>
              <option value="A20">Section A20</option>
              <option value="A21">Section A21</option>
              <option value="A22">Section A22</option>
              <option value="A23">Section A23</option>
              <option value="A24">Section A24</option>
              <option value="A25">Section A25</option>
              <option value="A26">Section A26</option>
              <option value="A27">Section A27</option>
              <option value="A28">Section A28</option>
              <option value="A29">Section A29</option>
              <option value="A30">Section A30</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded flex-1" 
              onClick={generateQR} 
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate QR'}
            </button>
            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded" 
              onClick={() => {
                setShowQRForm(false);
                setQrValue('');
                setInfo('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {qrValue && (
        <div className="mt-4 flex flex-col items-center">
          <QRCodeCanvas 
            value={qrValue} 
            size={280}
            level="L"
            includeMargin={true}
            marginSize={4}
            imageSettings={{
              src: "",
              x: undefined,
              y: undefined,
              height: 0,
              width: 0,
              excavate: false,
            }}
          />
          <div className="text-sm mt-3 font-medium">Show this QR to your students</div>
          <div className="text-xs mt-2 p-2 bg-gray-100 rounded max-w-sm break-all text-center">
            {qrValue}
          </div>
        </div>
      )}
      {info && <div className="text-red-600">{info}</div>}
      <div className="mt-8 w-full max-w-xl">
        <h3 className="font-semibold mb-2">Attendance Sessions</h3>
        <ul className="bg-grey-800 rounded shadow divide-y">
          {sessions.length === 0 && <li className="p-2 text-gray-500">No sessions yet.</li>}
          {sessions.map((s, i) => (
            <li key={s.id || i} className="p-2 text-sm flex justify-between items-center">
              <span>
                {new Date(s.createdAt).toLocaleString()} | Year {s.year} Section {s.section} | {s.attendances?.length || 0} present
              </span>
              <span className="flex gap-2">
                <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={()=>handleSessionClick(s)}>View</button>
                <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={()=>handleExport(s)}>Export CSV</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      {selectedSession && (
        <div className="mt-6 w-full max-w-xl">
          <h4 className="font-semibold mb-2">Students Present for Session {new Date(selectedSession.createdAt).toLocaleString()}</h4>
          <ul className="bg-gray-50 rounded p-2 text-xs">
            {students.length === 0 && <li className="text-gray-500">No students present.</li>}
            {students.map((stu, i) => (
              <li key={i} className="py-1">
                {stu.user.email} - {stu.user.name}
                {stu.timestamp && <span className="text-gray-500 ml-2">({new Date(stu.timestamp).toLocaleTimeString()})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StudentDashboard({ user }: { user: User }) {
  const [scanResult, setScanResult] = useState('');
  const [info, setInfo] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<{ total: number, present: number, percentage: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setInfo('Location permission denied')
      );
    } else {
      setInfo('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    fetch(`/api/attendance?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setHistory(data.attendance || []));
  }, [user.id]);

  useEffect(() => {
    if (user.user_metadata.year && user.user_metadata.section) {
      fetch(`/api/attendance/summary?userId=${user.id}&year=${user.user_metadata.year}&section=${user.user_metadata.section}`)
        .then(res => res.json())
        .then(data => setSummary(data.summary || null));
    }
  }, [user.id, user.user_metadata.year, user.user_metadata.section]);

  const handleScan = async (data: string | null) => {
    if (!data) return;
    
    setScanResult(data);
    setInfo('Processing QR code...');
    
    try {
      // Check if it's a URL (new format)
      if (data.startsWith('http')) {
        // Redirect to attendance page
        window.location.href = data;
        return;
      }

      // Handle legacy JSON format
      const qr = JSON.parse(data);
      
      // Validate QR structure
      if (!qr.sessionId || !qr.year || !qr.section) {
        setInfo('Invalid QR code format.');
        return;
      }
      
      // Validate year/section
      if (qr.year !== user.user_metadata.year || qr.section !== user.user_metadata.section) {
        setInfo('This QR is not for your section/year.');
        return;
      }
      
      // Check if QR is expired
      const now = Date.now();
      if (qr.validTo && now > qr.validTo) {
        setInfo('QR code has expired.');
        return;
      }
      
      // Validate location (within 50 meters)
      if (!location) {
        setInfo('Location not available. Please enable location services.');
        return;
      }
      
      const dist = getDistanceFromLatLonInMeters(location.lat, location.lng, qr.latitude, qr.longitude);
      if (dist > 50) {
        setInfo(`You are too far from the attendance location (${dist.toFixed(0)}m away). Please move closer.`);
        return;
      }
      
      // Send attendance to backend
      setInfo('Marking attendance...');
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          qrPayload: qr,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        setInfo('✅ Attendance marked successfully!');
        // Refresh attendance history
        fetch(`/api/attendance?userId=${user.id}`)
          .then(res => res.json())
          .then(data => setHistory(data.attendance || []));
      } else {
        setInfo(`❌ ${result.error || 'Attendance failed.'}`);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setInfo('Invalid QR code format.');
    }
  };

  // Haversine formula for distance in meters
  function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">Student Panel</h2>
      <p>Welcome, {user.user_metadata.full_name}</p>
      <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
        <Scanner
          onScan={(detectedCodes) => {
            if (detectedCodes && detectedCodes.length > 0) {
              handleScan(detectedCodes[0].rawValue);
            }
          }}
          onError={() => setInfo('Camera error')}
          constraints={{ facingMode: 'environment' }}
        />
      </div>
      {scanResult && <div className="text-xs break-all">Scanned: {scanResult}</div>}
      {info && <div className={info.includes('success') ? 'text-green-600' : 'text-red-600'}>{info}</div>}
      <div className="mt-8 w-full max-w-xl">
        <h3 className="font-semibold mb-2">My Attendance</h3>
        <ul className="bg-grey-800 rounded shadow divide-y">
          {history.length === 0 && <li className="p-2 text-gray-500">No attendance yet.</li>}
          {history.map((a, i) => (
            <li key={i} className="p-2 text-sm">
              Session: {a.qrSessionId} | Date: {new Date(a.timestamp || a.createdAt || Date.now()).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
      {summary && (
        <div className="mt-8 w-full max-w-xl">
          <h3 className="font-semibold mb-2">Attendance Summary</h3>
          <div className="flex gap-8">
            <div>Total Sessions: <b>{summary.total}</b></div>
            <div>Present: <b>{summary.present}</b></div>
            <div>Attendance %: <b>{summary.percentage.toFixed(1)}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}

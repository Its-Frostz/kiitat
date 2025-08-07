"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function AttendanceContent() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const markAttendance = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        // Check if user has completed onboarding
        if (!user.user_metadata.role) {
          router.push('/onboarding');
          return;
        }

        // Get session data from URL
        const sessionId = searchParams.get('session');
        const data = searchParams.get('data');
        
        if (!sessionId || !data) {
          setError('Invalid QR code');
          setLoading(false);
          return;
        }

        // Parse QR data
        let qrPayload;
        try {
          qrPayload = JSON.parse(decodeURIComponent(data));
        } catch {
          setError('Invalid QR code format');
          setLoading(false);
          return;
        }

        // Validate user role and year/section
        if (user.user_metadata.role !== 'STUDENT') {
          setError('Only students can mark attendance');
          setLoading(false);
          return;
        }

        if (!user.user_metadata.year || !user.user_metadata.section) {
          setError('Please complete your profile with year and section');
          setLoading(false);
          return;
        }

        // Check year/section match
        console.log('QR Payload:', qrPayload);
        console.log('User metadata year:', user.user_metadata.year, 'type:', typeof user.user_metadata.year);
        console.log('User metadata section:', user.user_metadata.section, 'type:', typeof user.user_metadata.section);
        console.log('QR year:', qrPayload.year, 'type:', typeof qrPayload.year);
        console.log('QR section:', qrPayload.section, 'type:', typeof qrPayload.section);
        
        // Convert both to numbers for year comparison, and strings for section comparison
        const userYear = parseInt(user.user_metadata.year);
        const qrYear = parseInt(qrPayload.year);
        const userSection = String(user.user_metadata.section);
        const qrSection = String(qrPayload.section);
        
        console.log('Converted comparison - User Year:', userYear, 'QR Year:', qrYear, 'Match:', userYear === qrYear);
        console.log('Converted comparison - User Section:', userSection, 'QR Section:', qrSection, 'Match:', userSection === qrSection);
        
        if (qrYear !== userYear || qrSection !== userSection) {
          setError(`This QR code is not for your year/section. QR: Year ${qrYear}, Section ${qrSection}. Your profile: Year ${userYear}, Section ${userSection}`);
          setLoading(false);
          return;
        }

        // Get user location
        if (!navigator.geolocation) {
          setError('Location services not supported');
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          
          // Calculate distance from QR location
          const distance = getDistanceFromLatLonInMeters(
            latitude, 
            longitude, 
            qrPayload.latitude, 
            qrPayload.longitude
          );

          if (distance > 10) {
            setError(`You are too far from the attendance location (${distance.toFixed(0)}m away). Please move closer.`);
            setLoading(false);
            return;
          }

          // Mark attendance
          try {
            const response = await fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                qrPayload,
                latitude,
                longitude,
              }),
            });

            const result = await response.json();

            if (result.success) {
              setMessage('✅ Attendance marked successfully!');
              setTimeout(() => {
                router.push('/dashboard');
              }, 2000);
            } else {
              setError(`❌ ${result.error || 'Failed to mark attendance'}`);
            }
          } catch (error) {
            console.error('Attendance error:', error);
            setError('❌ Network error. Please try again.');
          }
          
          setLoading(false);
        }, (error) => {
          console.error('Location error:', error);
          setError('❌ Could not get your location. Please enable location services.');
          setLoading(false);
        });

      } catch (error) {
        console.error('Attendance process error:', error);
        setError('❌ An unexpected error occurred');
        setLoading(false);
      }
    };

    markAttendance();
  }, [router, searchParams]);

  // Distance calculation function
  function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-2xl font-bold">Attendance Check-in</h1>
      
      {loading && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p>Processing attendance...</p>
        </div>
      )}

      {message && (
        <div className="text-center">
          <div className="text-2xl text-green-600 mb-4">{message}</div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-2xl font-bold">Attendance Check-in</h1>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <AttendanceContent />
    </Suspense>
  );
}

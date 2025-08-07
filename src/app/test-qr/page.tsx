"use client";
import { QRCodeCanvas } from 'qrcode.react';

export default function TestQR() {
  const testUrls = [
    'https://google.com',
    'http://localhost:3000/attendance?test=123',
    'https://kiitat-three.vercel.app/attendance?test=123'
  ];

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-2xl font-bold">QR Code Test Page</h1>
      
      {testUrls.map((url, index) => (
        <div key={index} className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold">Test {index + 1}</h2>
          <QRCodeCanvas value={url} size={200} />
          <p className="text-sm break-all max-w-md text-center">{url}</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Click to test link
          </a>
        </div>
      ))}
    </div>
  );
}

// src/app/seller/dashboard/page.tsx
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/db';

export default async function SellerDashboard() {
  // Optionally fetch appointments server-side
  // For simplicity: show link to availability editor + appointments
  return (
    <main style={{ padding: 24 }}>
      <h2>Seller Dashboard</h2>
      <p>Here you will show calendar & availability editor (client side)</p>
      <a href="/seller/availability">Edit / View Availability</a>
      <div>
        <a href="/appointments">View Appointments</a>
      </div>
    </main>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function BookPage() {
  const params = useParams();
  const sellerId = params!.sellerId;
  const [busy, setBusy] = useState<any>(null);
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');

  useEffect(() => {
    const tmin = new Date().toISOString();
    const tmax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    fetch(`/api/availability?sellerId=${sellerId}&timeMin=${tmin}&timeMax=${tmax}`)
      .then(r=>r.json()).then(setBusy);
  }, [sellerId]);

  async function book() {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, start: slotStart, end: slotEnd })
    });
    if (res.ok) alert('Booked');
    else alert('Booking failed');
  }

  return (
    <main style={{ padding: 24 }}>
      <h3>Book with seller {sellerId}</h3>
      <div>
        <p>Busy ranges (example):</p>
        <pre>{JSON.stringify(busy, null, 2)}</pre>
      </div>
      <div>
        <label>Start ISO:</label>
        <input value={slotStart} onChange={e=>setSlotStart(e.target.value)} />
      </div>
      <div>
        <label>End ISO:</label>
        <input value={slotEnd} onChange={e=>setSlotEnd(e.target.value)} />
      </div>
      <button onClick={book}>Book</button>
    </main>
  );
}

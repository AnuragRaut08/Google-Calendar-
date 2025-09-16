'use client';
import React, { useEffect, useState } from 'react';

export default function BuyerList() {
  const [sellers, setSellers] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/sellers').then(r => r.json()).then(setSellers);
  }, []);
  return (
    <main style={{ padding: 24 }}>
      <h2>Sellers</h2>
      <ul>
        {sellers.map(s => (
          <li key={s.id}>
            <img src={s.picture} width={40} style={{ borderRadius: 20 }} />
            <strong>{s.name}</strong> — <a href={`/buyer/book/${s.id}`}>Book</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Next.js Scheduler</h1>
      <p>Choose role to sign in</p>
      <div>
        <a href="/api/auth/google?role=SELLER">Sign in as Seller</a>
      </div>
      <div>
        <a href="/api/auth/google?role=BUYER">Sign in as Buyer</a>
      </div>
    </main>
  );
}

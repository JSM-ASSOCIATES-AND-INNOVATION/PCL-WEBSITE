import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function DummyPage({ title, subtitle }) {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '800px' }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', color: 'var(--text-color)', marginBottom: '20px' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', fontStyle: 'italic' }}>{subtitle}</p>}
          <div style={{ padding: '30px', border: '1px solid var(--card-border)', borderRadius: '12px', backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(10px)', display: 'inline-block' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>This section is currently under development. Please check back later.</p>
            <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid var(--primary-color)', paddingBottom: '5px' }}>
              Return to Home ➔
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

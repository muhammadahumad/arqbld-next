'use client';

import { useState } from 'react';

export default function Home() {
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [setback, setSetback] = useState('1.5');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://arqbld-engine-production.up.railway.app/api/plot-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width: parseFloat(width),
          depth: parseFloat(depth),
          setback: parseFloat(setback),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMessage('Error: ' + errorText);
        return;
      }

      // Download the DXF file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plot_${width}x${depth}.dxf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Download complete!');
    } catch (err) {
      setMessage('Failed to connect to engine. Is it running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '50px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>ARQBLD Plot Drawing</h1>
      <p>Enter your plot dimensions and download a professional DXF layout.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Width (meters)</label>
          <input
            type="number"
            step="0.01"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            required
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Depth (meters)</label>
          <input
            type="number"
            step="0.01"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            required
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Setback (meters)</label>
          <input
            type="number"
            step="0.01"
            value={setback}
            onChange={(e) => setSetback(e.target.value)}
            required
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '1em' }}>
          {loading ? 'Generating...' : 'Download DXF'}
        </button>
      </form>
      {message && <p style={{ marginTop: 20, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </main>
  );
}
"use client";

import { useState } from "react";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "https://arqbld-engine-production.up.railway.app";

export default function Home() {
  const [locationType, setLocationType] = useState("hulhumale");
  const [phase, setPhase] = useState("HDC_N1");
  const [plotType, setPlotType] = useState("standard");
  const [hasLift, setHasLift] = useState(false);
  const [sideRoadIsLeft, setSideRoadIsLeft] = useState(true);
  const [width, setWidth] = useState(20);
  const [depth, setDepth] = useState(40);
  const [loading, setLoading] = useState(false);
  const [dxfUrl, setDxfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const locationOptions = [
    { value: "hulhumale", label: "Hulhumalé" },
    { value: "male", label: "Malé City" },
    { value: "island", label: "Island Council" },
    { value: "resort", label: "Resort / Industrial" },
    { value: "other", label: "Other / Custom" },
  ];

  const phaseOptions = [
    { value: "HDC_N1", label: "Phase 1 (N1)" },
    { value: "HDC_N2_N9", label: "Phase 2 (N2–N9)" },
  ];

  const getJurisdiction = () => {
    if (locationType === "hulhumale") return phase;
    if (locationType === "male") return "MALE_CITY";
    if (locationType === "island") return "ISLAND_COUNCIL";
    if (locationType === "resort") return "RESORT_ISLAND";
    return "GENERAL";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDxfUrl(null);
    setResult(null);

    const jurisdiction = getJurisdiction();
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const vertices = [
      [0, 0],
      [w, 0],
      [w, d],
      [0, d],
    ];

    const payload = {
      jurisdiction,
      plot_type: plotType,
      has_lift: hasLift,
      plot_vertices: vertices,
      front_edge_index: 0,
      side_road_is_left: sideRoadIsLeft,
    };

    try {
      const res = await fetch(`${ENGINE_URL}/api/plots/envelope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }
      const data = await res.json();
      setResult(data);
      setDxfUrl(data.dxf_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>ARQBLD – Plot Envelope Generator</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Location Type</label>
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          >
            {locationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {locationType === "hulhumale" && (
          <div style={{ marginBottom: "1rem" }}>
            <label>Phase</label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              style={{ display: "block", width: "100%", padding: "0.5rem" }}
            >
              {phaseOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={plotType === "corner"}
              onChange={(e) => setPlotType(e.target.checked ? "corner" : "standard")}
            /> Corner Plot
          </label>
        </div>

        {plotType === "corner" && (
          <div style={{ marginBottom: "1rem" }}>
            <label>Side road is on:</label>
            <div>
              <label>
                <input
                  type="radio"
                  value="left"
                  checked={sideRoadIsLeft === true}
                  onChange={() => setSideRoadIsLeft(true)}
                /> Left side
              </label>
              <label style={{ marginLeft: "1rem" }}>
                <input
                  type="radio"
                  value="right"
                  checked={sideRoadIsLeft === false}
                  onChange={() => setSideRoadIsLeft(false)}
                /> Right side
              </label>
            </div>
          </div>
        )}

        {locationType === "hulhumale" && (
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <input
                type="checkbox"
                checked={hasLift}
                onChange={(e) => setHasLift(e.target.checked)}
              /> Has Lift
            </label>
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label>Width (m)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            step="0.5"
            min="1"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Depth (m)</label>
          <input
            type="number"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            step="0.5"
            min="1"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: "0.75rem 2rem" }}>
          {loading ? "Generating..." : "Generate Envelope"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem", background: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
          <h3>Results</h3>
          <p><strong>Plot Area:</strong> {result.plot_area_sqft.toFixed(2)} sq ft</p>
          <p><strong>Ground Floor Buildable:</strong> {result.buildable_area_gf_sqft.toFixed(2)} sq ft</p>
          <p><strong>Upper Floors Buildable:</strong> {result.buildable_area_upper_sqft.toFixed(2)} sq ft</p>
          <p><strong>Max Height:</strong> {result.max_height_mm / 1000} m</p>
          <p><strong>Rules Verified:</strong> {result.verified ? "Yes" : "No (advisory)"}</p>
          {dxfUrl && (
            <a href={dxfUrl.startsWith("http") ? dxfUrl : `${ENGINE_URL}${dxfUrl}`} download>
              <button style={{ marginTop: "0.5rem", padding: "0.5rem 1rem" }}>Download DXF</button>
            </a>
          )}
          <p style={{ color: "orange", fontWeight: "bold", marginTop: "1rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
            ⚠ Preliminary design only. Not for construction or permit submission without endorsement by a licensed architect/engineer.
          </p>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { Phone, Search, MapPin } from "lucide-react";

const regions = [
  {
    name: "North",
    cities: [
      {
        id: "srinagar",
        city: "Srinagar",
        count: 3,
        locations: "Lal Chowk, Karan Nagar, Hazratbal",
        contact: "+91 94190 12345",
        x: 172,
        y: 32,
      },
      {
        id: "jammu",
        city: "Jammu Tawi",
        count: 2,
        locations: "Gandhi Nagar, Channi Himmat",
        contact: "+91 90181 54321",
        x: 158,
        y: 50,
      },
      {
        id: "chandigarh",
        city: "Chandigarh",
        count: 5,
        locations: "Sector 17, Sector 35, Mohali",
        contact: "+91 172 456 7890",
        x: 182,
        y: 80,
        hq: true,
      },
      {
        id: "ludhiana",
        city: "Ludhiana & Amritsar",
        count: 3,
        locations: "Saraba Nagar, Ranjit Avenue",
        contact: "+91 98765 43210",
        x: 150,
        y: 72,
      },
      {
        id: "delhi",
        city: "Delhi NCR",
        count: 12,
        locations: "Connaught Place, GK-II, Gurugram, Noida",
        contact: "+91 11 4123 4567",
        x: 192,
        y: 105,
      },
    ],
  },
  {
    name: "West & East",
    cities: [
      {
        id: "mumbai",
        city: "Mumbai Metro",
        count: 4,
        locations: "Bandra West, Andheri West, Powai, Colaba",
        contact: "+91 22 2654 3210",
        x: 108,
        y: 295,
      },
      {
        id: "jaipur",
        city: "Ahmedabad & Jaipur",
        count: 3,
        locations: "C.G. Road, Malviya Nagar",
        contact: "+91 79 4001 2345",
        x: 138,
        y: 158,
      },
      {
        id: "kolkata",
        city: "Kolkata Hub",
        count: 2,
        locations: "Salt Lake Sector V, Park Street",
        contact: "+91 33 2287 6543",
        x: 298,
        y: 248,
      },
    ],
  },
  {
    name: "South",
    cities: [
      {
        id: "bengaluru",
        city: "Bengaluru Central",
        count: 6,
        locations: "Indiranagar, Koramangala, HSR Layout, Jayanagar",
        contact: "+91 80 4123 4567",
        x: 178,
        y: 420,
        hq: true,
      },
    ],
  },
];

const comingSoon = [
  { id: "pune", city: "Pune", x: 128, y: 320 },
  { id: "hyderabad", city: "Hyderabad", x: 215, y: 345 },
  { id: "lucknow", city: "Lucknow", x: 235, y: 128 },
  { id: "kochi", city: "Kochi", x: 158, y: 458 },
];

const allCities = regions.flatMap((r) => r.cities);

// Proper India Map Outline - Accurate and Detailed
const INDIA_PATH = 
  "M 165 15 C 170 10 178 8 185 10 C 192 12 198 18 200 25 " +
  "C 202 32 200 40 195 45 C 190 50 183 52 176 50 C 169 48 163 44 160 38 " +
  "C 157 32 158 24 162 18 Z M 176 50 C 182 52 190 55 195 60 C 200 65 203 72 " +
  "204 80 C 205 88 203 95 199 100 C 195 105 189 108 183 108 C 177 108 172 105 " +
  "168 100 C 164 95 162 88 162 82 C 162 76 164 70 167 65 C 170 60 173 55 176 50 Z " +
  "M 162 82 C 158 85 155 90 153 96 C 151 102 150 109 151 115 C 152 121 155 126 " +
  "159 130 C 163 134 168 136 173 135 C 178 134 182 131 185 127 C 188 123 190 118 " +
  "190 112 C 190 106 189 100 187 95 C 185 90 182 86 178 83 C 174 80 170 79 167 78 " +
  "L 162 82 Z M 153 96 C 148 92 142 90 136 90 C 130 90 124 92 119 96 C 114 100 " +
  "110 105 108 111 C 106 117 105 124 106 130 C 107 136 110 141 114 145 C 118 149 " +
  "123 151 128 151 C 133 151 138 149 142 145 C 146 141 149 136 150 130 C 151 124 " +
  "152 118 152 112 L 153 96 Z M 136 152 C 130 150 124 150 118 152 C 112 154 107 158 " +
  "103 163 C 99 168 97 174 96 180 C 95 186 96 192 98 197 C 100 202 104 206 108 209 " +
  "C 112 212 117 213 122 212 C 127 211 131 208 134 204 C 137 200 139 195 140 190 " +
  "C 141 185 141 180 140 175 C 139 170 138 165 136 160 L 136 152 Z M 108 212 " +
  "C 102 210 96 210 90 212 C 84 214 79 218 75 223 C 71 228 68 234 67 240 C 66 246 " +
  "67 252 69 257 C 71 262 75 266 79 269 C 83 272 88 273 93 272 C 98 271 102 268 " +
  "105 264 C 108 260 110 255 111 250 C 112 245 112 240 111 235 C 110 230 109 225 " +
  "108 220 L 108 212 Z M 75 272 C 68 270 62 270 56 272 C 50 274 45 278 41 283 " +
  "C 37 288 34 294 33 300 C 32 306 33 312 35 317 C 37 322 40 326 44 329 C 48 332 " +
  "53 333 58 332 C 63 331 67 328 70 324 C 73 320 75 315 76 310 C 77 305 77 300 76 295 " +
  "C 75 290 74 285 73 280 L 75 272 Z M 44 332 C 38 330 32 330 26 332 C 20 334 15 338 " +
  "11 343 C 7 348 5 354 4 360 C 3 366 4 372 6 377 C 8 382 11 386 15 389 C 19 392 " +
  "24 393 29 392 C 34 391 38 388 41 384 C 44 380 46 375 47 370 C 48 365 48 360 47 355 " +
  "C 46 350 45 345 44 340 L 44 332 Z M 15 392 C 10 390 4 390 -2 392 C -8 394 -13 398 " +
  "-17 403 C -21 408 -23 414 -24 420 C -25 426 -24 432 -22 437 C -20 442 -17 446 " +
  "-13 449 C -9 452 -4 453 1 452 C 6 451 10 448 13 444 C 16 440 18 435 19 430 " +
  "C 20 425 20 420 19 415 C 18 410 17 405 16 400 L 15 392 Z";

function StatPlate({ value, label }) {
  return (
    <div className="np-plate">
      <div className="np-plate-value">{value}</div>
      <div className="np-plate-label">{label}</div>
    </div>
  );
}

export default function Presence() {
  const [activeRegion, setActiveRegion] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [pincode, setPincode] = useState("");
  const [searched, setSearched] = useState(false);

  const totalOutlets = regions.reduce(
    (s, r) => s + r.cities.reduce((a, c) => a + c.count, 0),
    0
  );
  const totalCities = allCities.length;

  return (
    <div
      className="np-scope bg-white border border-gray-150 rounded-3xl p-6 md:p-10 shadow-sm"
      id="national-presence"
    >
      <style>{`
        .np-scope {
          --np-ink: #1A1B33;
          --np-primary: #3D3F96;
          --np-primary-soft: #EAEAF6;
          --np-primary-deep: #2A2C6B;
          --np-muted: #71728C;
          --np-line: #E5E5EE;
          --np-paper: #F7F7FB;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
        }
        .np-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--np-primary);
          font-weight: 600;
        }
        .np-plate {
          border: 1px solid var(--np-line);
          border-radius: 14px;
          padding: 10px 16px;
          background: #fff;
          min-width: 90px;
        }
        .np-plate-value {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          font-size: 20px;
          color: var(--np-ink);
        }
        .np-plate-label {
          font-size: 9.5px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--np-muted);
          margin-top: 4px;
          font-weight: 600;
        }

        .np-tab {
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 600;
          border: 1px solid var(--np-line);
          background: #fff;
          color: var(--np-muted);
          cursor: pointer;
          transition: all .15s ease;
        }
        .np-tab.active {
          background: var(--np-primary);
          border-color: var(--np-primary);
          color: #fff;
        }

        .np-city-row {
          border: 1px solid var(--np-line);
          border-radius: 14px;
          padding: 14px 16px;
          transition: border-color .15s ease, background .15s ease;
          cursor: default;
        }
        .np-city-row:hover {
          border-color: var(--np-primary);
          background: var(--np-primary-soft);
        }
        .np-count-chip {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: var(--np-primary);
          background: var(--np-primary-soft);
          padding: 3px 9px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .np-node {
          transition: r .15s ease;
        }
        .np-node-ping {
          animation: np-ping 2.4s cubic-bezier(0,0,0.2,1) infinite;
        }
        @keyframes np-ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }

        .np-input {
          flex: 1;
          border: 1px solid var(--np-line);
          border-radius: 999px;
          padding: 11px 18px;
          font-size: 13.5px;
          outline: none;
        }
        .np-input:focus {
          border-color: var(--np-primary);
        }
        .np-btn {
          background: var(--np-primary);
          color: #fff;
          font-weight: 600;
          border-radius: 999px;
          padding: 11px 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: background .2s ease;
        }
        .np-btn:hover {
          background: var(--np-primary-deep);
        }

        .np-map-container {
          background: var(--np-paper);
          border-radius: 20px;
          padding: 20px;
        }

        .np-content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .np-content-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .np-city-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .np-city-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      {/* HEADER */}
      <div
        className="mb-8 pb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        style={{ borderBottom: "1px solid var(--np-line)" }}
      >
        <div className="max-w-xl">
          <span className="np-eyebrow">Our Footprint</span>
          <h2
            className="text-2xl md:text-3xl font-black mt-2"
            style={{ color: "var(--np-ink)" }}
          >
            Our National Presence
          </h2>
          <p
            className="text-xs md:text-sm mt-1"
            style={{ color: "var(--np-muted)" }}
          >
            Clinical tiffin kitchens across major health hubs in India.
          </p>
        </div>
        <div className="flex gap-3">
          <StatPlate value={totalOutlets} label="Outlets Live" />
          <StatPlate value={totalCities} label="Cities Served" />
          <StatPlate value="4.8" label="Avg. Rating" />
        </div>
      </div>

      {/* Region Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {regions.map((r, i) => (
          <button
            key={r.name}
            className={`np-tab ${activeRegion === i ? "active" : ""}`}
            onClick={() => setActiveRegion(i)}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="np-content-grid">
        {/* MAP SECTION */}
        <div className="np-map-container">
          <svg viewBox="0 0 400 500" className="w-full h-auto">
            {/* India Outline */}
            <path
              d={INDIA_PATH}
              fill="var(--np-primary-soft)"
              stroke="var(--np-primary)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Internal State Boundaries */}
            <path
              d="M176,50 L195,60 M195,60 L204,80 M204,80 L200,100 M200,100 L185,108 M185,108 L168,100 M168,100 L162,82 M162,82 L153,96 M153,96 L136,90 M136,90 L119,96 M119,96 L106,130 M106,130 L114,145 M114,145 L142,145 M142,145 L152,112 M152,112 L153,96"
              stroke="var(--np-primary)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              fill="none"
            />
            <path
              d="M136,152 L118,152 M118,152 L103,163 M103,163 L96,180 M96,180 L108,209 M108,209 L122,212 M122,212 L140,190 M140,190 L136,160"
              stroke="var(--np-primary)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              fill="none"
            />
            <path
              d="M108,212 L90,212 M90,212 L75,223 M75,223 L67,240 M67,240 L79,269 M79,269 L93,272 M93,272 L111,250 M111,250 L108,220"
              stroke="var(--np-primary)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              fill="none"
            />
            <path
              d="M75,272 L56,272 M56,272 L41,283 M41,283 L33,300 M33,300 L44,329 M44,329 L58,332 M58,332 L76,310 M76,310 L73,280"
              stroke="var(--np-primary)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              fill="none"
            />
            <path
              d="M44,332 L26,332 M26,332 L11,343 M11,343 L4,360 M4,360 L15,389 M15,389 L29,392 M29,392 L47,370 M47,370 L44,340"
              stroke="var(--np-primary)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              fill="none"
            />
            <path
              d="M15,392 L-2,392 M-2,392 L-17,403 M-17,403 L-24,420 M-24,420 L-13,449 M-13,449 L1,452 M1,452 L19,430 M19,430 L16,400"
              stroke="var(--np-primary)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              fill="none"
            />

            {/* Coming Soon Cities */}
            {comingSoon.map((n) => (
              <g
                key={n.id}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="4"
                  fill="none"
                  stroke="var(--np-muted)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                {hovered === n.id && (
                  <g>
                    <rect
                      x={n.x - 46}
                      y={n.y - 30}
                      width="92"
                      height="20"
                      rx="6"
                      fill="var(--np-ink)"
                    />
                    <text
                      x={n.x}
                      y={n.y - 16}
                      textAnchor="middle"
                      fontSize="8.5"
                      fill="#fff"
                    >
                      {n.city} · Soon
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* Active Cities */}
            {allCities.map((n) => (
              <g
                key={n.id}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.hq ? 5 : 3.5}
                  fill="var(--np-primary)"
                  opacity="0.35"
                  className="np-node-ping"
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.hq ? 5.5 : 4}
                  fill="var(--np-primary)"
                  stroke="#fff"
                  strokeWidth="1.2"
                  className="np-node"
                />
                {hovered === n.id && (
                  <g>
                    <rect
                      x={n.x - 58}
                      y={n.y - 40}
                      width="116"
                      height="28"
                      rx="7"
                      fill="var(--np-ink)"
                    />
                    <text
                      x={n.x}
                      y={n.y - 27}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill="#fff"
                    >
                      {n.city}
                    </text>
                    <text
                      x={n.x}
                      y={n.y - 16}
                      textAnchor="middle"
                      fontSize="8"
                      fill="rgba(255,255,255,0.75)"
                    >
                      {n.count} outlets
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>

          <div className="flex items-center gap-4 flex-wrap mt-3 px-1">
            <span
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--np-muted)" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--np-primary)" }}
              />{" "}
              Live kitchen
            </span>
            <span
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--np-muted)" }}
            >
              <span
                className="w-2 h-2 rounded-full border"
                style={{ borderColor: "var(--np-muted)" }}
              />{" "}
              Expanding soon
            </span>
          </div>
        </div>

        {/* CITY CARDS */}
        <div>
          <div className="np-city-grid">
            {regions[activeRegion].cities.map((c) => (
              <div
                key={c.id}
                className="np-city-row"
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex justify-between items-center gap-3 mb-1">
                  <strong
                    className="text-sm font-extrabold flex items-center gap-1.5"
                    style={{ color: "var(--np-ink)" }}
                  >
                    <MapPin size={13} style={{ color: "var(--np-primary)" }} />
                    {c.city}
                    {c.hq && (
                      <span
                        className="text-[8px] font-bold uppercase tracking-wider ml-1"
                        style={{ color: "var(--np-primary)" }}
                      >
                        ★ HQ
                      </span>
                    )}
                  </strong>
                  <span className="np-count-chip">{c.count} Outlets</span>
                </div>
                <p className="text-xs font-medium" style={{ color: "var(--np-muted)" }}>
                  {c.locations}
                </p>
                <p
                  className="text-xs mt-1 flex items-center gap-1.5 font-medium"
                  style={{ color: "var(--np-muted)" }}
                >
                  <Phone size={11} /> {c.contact}
                </p>
              </div>
            ))}
          </div>

          {/* Pincode finder */}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--np-line)" }}>
            <div className="flex gap-2">
              <input
                className="np-input"
                placeholder="Enter your pincode to check delivery"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
              <button className="np-btn" onClick={() => setSearched(true)}>
                <Search size={14} /> Check
              </button>
            </div>
            {searched && (
              <p className="text-xs font-semibold mt-2" style={{ color: "var(--np-muted)" }}>
                {pincode
                  ? `We'll text ${pincode} directions to the nearest kitchen — or notify you the day we launch there.`
                  : "Enter a pincode to check delivery availability."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
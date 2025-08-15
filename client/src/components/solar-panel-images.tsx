export const MonocrystallinePanelSVG = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="monoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Panel Frame */}
    <rect x="10" y="10" width="280" height="180" rx="4" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
    {/* Solar Cells - Monocrystalline Pattern */}
    {Array.from({ length: 6 }, (_, row) => 
      Array.from({ length: 10 }, (_, col) => (
        <rect
          key={`${row}-${col}`}
          x={20 + col * 27}
          y={20 + row * 27}
          width="25"
          height="25"
          fill="url(#monoGradient)"
          stroke="#ffffff"
          strokeWidth="1"
          rx="2"
        />
      ))
    )}
    {/* Grid Lines */}
    {Array.from({ length: 9 }, (_, i) => (
      <line
        key={`v-${i}`}
        x1={47 + i * 27}
        y1="20"
        x2={47 + i * 27}
        y2="182"
        stroke="#94a3b8"
        strokeWidth="0.5"
      />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <line
        key={`h-${i}`}
        x1="20"
        y1={47 + i * 27}
        x2="290"
        y2={47 + i * 27}
        stroke="#94a3b8"
        strokeWidth="0.5"
      />
    ))}
  </svg>
);

export const PolycrystallinePanelSVG = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="polyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Panel Frame */}
    <rect x="10" y="10" width="280" height="180" rx="4" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
    {/* Solar Cells - Polycrystalline Pattern with crystal-like appearance */}
    {Array.from({ length: 6 }, (_, row) => 
      Array.from({ length: 10 }, (_, col) => (
        <g key={`${row}-${col}`}>
          <rect
            x={20 + col * 27}
            y={20 + row * 27}
            width="25"
            height="25"
            fill="url(#polyGradient)"
            stroke="#ffffff"
            strokeWidth="1"
            rx="1"
          />
          {/* Crystal pattern */}
          <path
            d={`M ${22 + col * 27} ${22 + row * 27} L ${30 + col * 27} ${25 + row * 27} L ${35 + col * 27} ${22 + row * 27}`}
            stroke="#94a3b8"
            strokeWidth="0.3"
            fill="none"
          />
          <path
            d={`M ${22 + col * 27} ${40 + row * 27} L ${30 + col * 27} ${37 + row * 27} L ${35 + col * 27} ${40 + row * 27}`}
            stroke="#94a3b8"
            strokeWidth="0.3"
            fill="none"
          />
        </g>
      ))
    )}
    {/* Grid Lines */}
    {Array.from({ length: 9 }, (_, i) => (
      <line
        key={`v-${i}`}
        x1={47 + i * 27}
        y1="20"
        x2={47 + i * 27}
        y2="182"
        stroke="#94a3b8"
        strokeWidth="0.5"
      />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <line
        key={`h-${i}`}
        x1="20"
        y1={47 + i * 27}
        x2="290"
        y2={47 + i * 27}
        stroke="#94a3b8"
        strokeWidth="0.5"
      />
    ))}
  </svg>
);

export const BifacialPanelSVG = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bifacialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="bifacialBack" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#475569', stopOpacity: 0.3 }} />
        <stop offset="100%" style={{ stopColor: '#64748b', stopOpacity: 0.3 }} />
      </linearGradient>
    </defs>
    {/* Back Panel Shadow (showing bifacial nature) */}
    <rect x="15" y="15" width="280" height="180" rx="4" fill="url(#bifacialBack)"/>
    {/* Main Panel Frame */}
    <rect x="10" y="10" width="280" height="180" rx="4" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
    {/* Solar Cells - Bifacial Pattern (darker, more premium look) */}
    {Array.from({ length: 6 }, (_, row) => 
      Array.from({ length: 10 }, (_, col) => (
        <g key={`${row}-${col}`}>
          <rect
            x={20 + col * 27}
            y={20 + row * 27}
            width="25"
            height="25"
            fill="url(#bifacialGradient)"
            stroke="#ffffff"
            strokeWidth="1"
            rx="2"
          />
          {/* Center dot to show premium nature */}
          <circle
            cx={32.5 + col * 27}
            cy={32.5 + row * 27}
            r="2"
            fill="#3b82f6"
            opacity="0.6"
          />
        </g>
      ))
    )}
    {/* Grid Lines */}
    {Array.from({ length: 9 }, (_, i) => (
      <line
        key={`v-${i}`}
        x1={47 + i * 27}
        y1="20"
        x2={47 + i * 27}
        y2="182"
        stroke="#cbd5e1"
        strokeWidth="0.5"
      />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <line
        key={`h-${i}`}
        x1="20"
        y1={47 + i * 27}
        x2="290"
        y2={47 + i * 27}
        stroke="#cbd5e1"
        strokeWidth="0.5"
      />
    ))}
  </svg>
);

// Generic solar panel for other products
export const GenericSolarPanelSVG = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="genericGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="280" height="180" rx="4" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
    {Array.from({ length: 6 }, (_, row) => 
      Array.from({ length: 10 }, (_, col) => (
        <rect
          key={`${row}-${col}`}
          x={20 + col * 27}
          y={20 + row * 27}
          width="25"
          height="25"
          fill="url(#genericGradient)"
          stroke="#ffffff"
          strokeWidth="1"
          rx="1"
        />
      ))
    )}
  </svg>
);
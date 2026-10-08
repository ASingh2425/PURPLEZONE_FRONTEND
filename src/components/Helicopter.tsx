import React from 'react';
import { HelicopterStatus } from '../types/protocol';

interface HelicopterProps {
  status: HelicopterStatus;
}

export const Helicopter: React.FC<HelicopterProps> = ({ status }) => {
  if (status === 'HIDDEN' || status === 'DEPARTED') {
    return null;
  }

  // Determine animation classes based on status
  // APPROACHING: enters from top-right offscreen, banks, and lands
  // LANDED / READY: parked firmly on the pad with rotor idle / fast
  // DEPARTING: lifts off upward, accelerates left-to-top-right into the dark mist
  const getContainerClasses = () => {
    switch (status) {
      case 'APPROACHING':
        return 'animate-[helicopterApproach_4s_cubic-bezier(0.16,1,0.3,1)_forwards]';
      case 'LANDED':
      case 'READY':
        return 'translate-x-0 translate-y-0';
      case 'DEPARTING':
        return 'animate-[helicopterDepart_4.2s_cubic-bezier(0.4,0,0.2,1)_forwards]';
      default:
        return '';
    }
  };

  const isRotorFast = status === 'READY' || status === 'DEPARTING';
  const isRotorActive = true;

  return (
    <div
      className={`relative w-80 h-44 sm:w-96 sm:h-52 transition-transform duration-700 pointer-events-none select-none z-20 ${getContainerClasses()}`}
    >
      {/* Downward Searchlight Projection Cone onto Helipad */}
      <div
        className={`absolute top-28 left-20 w-48 h-36 origin-top bg-gradient-to-b from-[#a855f7]/30 via-[#7e22ce]/10 to-transparent blur-sm pointer-events-none transition-opacity duration-1000 ${
          status === 'READY' || status === 'DEPARTING' ? 'opacity-90' : 'opacity-40'
        }`}
        style={{ clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)' }}
      />

      {/* SVG Industrial Vector Extraction Aircraft */}
      <svg
        viewBox="0 0 400 220"
        className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for Industrial Metal Fuselage */}
          <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#282038" />
            <stop offset="40%" stopColor="#1a1426" />
            <stop offset="100%" stopColor="#0f0c17" />
          </linearGradient>

          <linearGradient id="panelHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4c3b69" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#241b33" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="metalSkid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5b4878" />
            <stop offset="50%" stopColor="#322646" />
            <stop offset="100%" stopColor="#1e162d" />
          </linearGradient>

          {/* Rotor Disc blur filter */}
          <filter id="rotorBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* 1. Main Rotor Blades & Mast */}
        {/* Rotor Mast */}
        <rect x="176" y="44" width="8" height="18" fill="#44355e" rx="1" />
        <rect x="174" y="40" width="12" height="6" fill="#69538f" rx="1" />

        {/* Rotor Blade Disc Animation */}
        {isRotorActive && (
          <g transform="translate(180, 42)">
            {/* Spinning Blades with dynamic speed */}
            <g className={isRotorFast ? 'animate-rotor-blur' : 'animate-rotor-idle'}>
              {/* Rotor Blade 1 & 2 */}
              <line x1="-150" y1="0" x2="150" y2="0" stroke="#7e5da8" strokeWidth="3.5" strokeLinecap="round" filter="url(#rotorBlur)" />
              <line x1="-150" y1="0" x2="150" y2="0" stroke="#e9d5ff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              {/* Rotor Blade 3 & 4 (cross blades) */}
              <line x1="-106" y1="-106" x2="106" y2="106" stroke="#4c346c" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <line x1="106" y1="-106" x2="-106" y2="106" stroke="#4c346c" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              {/* Rotor Hub Cap */}
              <circle cx="0" cy="0" r="6" fill="#a855f7" />
              <circle cx="0" cy="0" r="2.5" fill="#f5f3ff" />
            </g>

            {/* Rotor Wash Glow Disk */}
            <ellipse
              cx="0"
              cy="0"
              rx="155"
              ry="7"
              fill="rgba(168, 85, 247, 0.08)"
              className={isRotorFast ? 'opacity-80' : 'opacity-25'}
            />
          </g>
        )}

        {/* 2. Tail Boom & Fin */}
        {/* Tail Boom connecting to main body */}
        <polygon points="180,95 330,86 330,96 180,118" fill="url(#fuselageGrad)" stroke="#392a52" strokeWidth="1" />
        <line x1="200" y1="98" x2="310" y2="92" stroke="#4c396e" strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />

        {/* Tail Fin Vertical Stabilizer */}
        <polygon points="325,92 346,45 358,45 348,102" fill="#251c36" stroke="#433261" strokeWidth="1" />
        <polygon points="334,60 348,50 345,62" fill="#7e3af2" opacity="0.8" />

        {/* Tail Horizontal Stabilizer Wing */}
        <path d="M 315,90 L 338,87 L 340,94 L 316,95 Z" fill="#32244a" stroke="#4a366e" strokeWidth="0.8" />

        {/* Tail Rotor Hub & Blades */}
        <g transform="translate(352, 54)">
          <circle cx="0" cy="0" r="3" fill="#a855f7" />
          <g className={isRotorFast ? 'animate-rotor-blur' : 'animate-rotor-idle'}>
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" />
            <line x1="-16" y1="-16" x2="16" y2="16" stroke="#4a366e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </g>
        </g>

        {/* 3. Main Fuselage Body */}
        {/* Heavy armored fuselage shape */}
        <path
          d="M 85,138 
             C 72,132 64,118 64,102 
             C 64,82 82,68 115,64 
             L 185,62 
             C 215,62 235,76 220,110 
             L 190,136 
             Z"
          fill="url(#fuselageGrad)"
          stroke="#41305c"
          strokeWidth="1.5"
        />

        {/* Upper Engine Cowling / Turbine Intakes */}
        <path
          d="M 125,64 L 180,62 L 182,78 L 122,80 Z"
          fill="#1c1529"
          stroke="#4a3769"
          strokeWidth="1"
        />
        {/* Turbine Vent Grate */}
        <line x1="135" y1="68" x2="148" y2="68" stroke="#7e5ba8" strokeWidth="1.5" />
        <line x1="135" y1="72" x2="148" y2="72" stroke="#7e5ba8" strokeWidth="1.5" />
        <line x1="135" y1="76" x2="148" y2="76" stroke="#7e5ba8" strokeWidth="1.5" />

        {/* Cockpit Canopy Glass */}
        <path
          d="M 68,98 
             C 68,85 82,73 105,70 
             L 125,69 
             L 122,108 
             L 80,116 
             Z"
          fill="url(#canopyGrad)"
          stroke="#473463"
          strokeWidth="1.2"
        />
        {/* Canopy Window Reflection Highlight */}
        <path
          d="M 78,88 C 88,78 102,74 116,73 L 114,84 C 102,86 90,91 82,97 Z"
          fill="#e0f2fe"
          opacity="0.25"
        />

        {/* Tactical Fuselage Panel Seams & Markings */}
        <line x1="125" y1="78" x2="125" y2="134" stroke="#36264d" strokeWidth="1.2" />
        <line x1="158" y1="64" x2="158" y2="136" stroke="#36264d" strokeWidth="1.2" />
        <line x1="125" y1="102" x2="185" y2="102" stroke="#36264d" strokeWidth="1" />

        {/* Aircraft Identifier Stencil */}
        <text
          x="132"
          y="118"
          fill="#b39ddb"
          fontSize="8"
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="1"
        >
          EX-09 PROTOCOL
        </text>

        <rect x="132" y="122" width="28" height="2" fill="#7e3af2" />

        {/* Rescue/Emergency Hazard Chevron on door */}
        <g transform="translate(166, 110)">
          <rect x="0" y="0" width="12" height="6" fill="#1b1429" stroke="#5b437e" strokeWidth="0.6" />
          <line x1="2" y1="5" x2="5" y2="1" stroke="#f59e0b" strokeWidth="1" />
          <line x1="6" y1="5" x2="9" y2="1" stroke="#f59e0b" strokeWidth="1" />
        </g>

        {/* 4. Landing Gear (Reinforced Heavy Industrial Skids) */}
        {/* Front Skid Strut */}
        <line x1="105" y1="130" x2="95" y2="158" stroke="#3e2d5c" strokeWidth="3" strokeLinecap="round" />
        {/* Rear Skid Strut */}
        <line x1="170" y1="132" x2="160" y2="158" stroke="#3e2d5c" strokeWidth="3" strokeLinecap="round" />
        {/* Cross Bracing */}
        <line x1="100" y1="144" x2="165" y2="144" stroke="#2c1f44" strokeWidth="2" />
        {/* Skid Runner Pipe with curved front lip */}
        <path
          d="M 72,154 
             C 76,158 84,159 90,159 
             L 190,159 
             C 194,159 198,157 200,154"
          stroke="url(#metalSkid)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* 5. Navigation & Strobe Lights */}
        {/* Nose Forward Headlamp / Searchlight Housing */}
        <circle cx="64" cy="105" r="4" fill="#1a1426" stroke="#4c396e" strokeWidth="1" />
        <circle cx="64" cy="105" r="2.5" fill="#f0abfc" className="animate-pulse" />

        {/* Upper Fuselage Anti-Collision Strobe */}
        <circle cx="188" cy="62" r="3" fill="#e11d48" className="animate-strobe" />

        {/* Tail Fin Strobe Beacon */}
        <circle cx="346" cy="46" r="2.5" fill="#38bdf8" className="animate-strobe" />

        {/* Skid Footing Shadow on Pad */}
        <ellipse cx="140" cy="164" rx="65" ry="3.5" fill="#000000" opacity="0.75" />
      </svg>
    </div>
  );
};

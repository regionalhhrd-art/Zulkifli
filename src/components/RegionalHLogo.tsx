/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface RegionalHLogoProps {
  className?: string;
  size?: number;
}

export default function RegionalHLogo({ className = "", size = 120 }: RegionalHLogoProps) {
  return (
    <div
      className={`relative inline-block shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outermost clean circle */}
        <circle cx="256" cy="256" r="248" fill="#009646" />
        
        {/* Outer white ring border */}
        <circle cx="256" cy="256" r="238" fill="none" stroke="white" strokeWidth="4" />
        
        {/* Inner white circular core background */}
        <circle cx="256" cy="256" r="184" fill="white" />
        
        {/* Text path for curved top text */}
        <defs>
          {/* Arc starting at 90 deg and going to 90 deg counter-clockwise would curve up */}
          {/* M 82,256 A 174,174 0 0 1 430,256 is perfect arc for the upper half inside the ring */}
          <path id="logoTextPath" d="M 86 256 A 170 170 0 0 1 426 256" fill="none" />
          
          {/* Clip path for the green H inside the core of r = 184 */}
          <clipPath id="coreClip">
            <circle cx="256" cy="256" r="184" />
          </clipPath>
        </defs>
        
        {/* Curved REGIONAL text inside the green band */}
        <text
          fontFamily='"Inter", "Space Grotesk", system-ui, sans-serif'
          fontSize="36"
          fontWeight="900"
          fill="white"
          letterSpacing="10"
        >
          <textPath href="#logoTextPath" startOffset="50%" textAnchor="middle">
            ★ REGIONAL ★
          </textPath>
        </text>
        
        {/* Large Green H shape inside the white core (Clipped beautifully) */}
        <g clipPath="url(#coreClip)">
          {/* 
            Coordinates:
            - Left stem outer edge: X = 138, top-left cut: Y = 210
            - Left stem inner edge: X = 208, top-right cut: Y = 160
            - Crossbar: top-edge Y = 310, bottom-edge Y = 365
            - Right stem inner edge: X = 304, top-left cut: Y = 160
            - Right stem outer edge: X = 374, top-right cut: Y = 210
            - Bottom center gap: X = 208 to X = 304, from Y = 365 down to bottom (clipped)
          */}
          <path
            d="M 138,512 L 138,210 L 208,160 L 208,310 L 304,310 L 304,160 L 374,210 L 374,512 L 304,512 L 304,365 L 208,365 L 208,512 Z"
            fill="#009646"
          />
          
          {/* 8-pointed Star (Rub el Hizb) Emblem above crossbar */}
          {/* Nested in the upper white bay of the H */}
          <g transform="translate(256, 224)">
            {/* Background 8-pt star made by rotating squares */}
            <rect x="-42" y="-42" width="84" height="84" fill="#009646" stroke="white" strokeWidth="2.5" />
            <rect x="-42" y="-42" width="84" height="84" fill="#009646" stroke="white" strokeWidth="2.5" transform="rotate(45)" />
            
            {/* Yellow inner-circle */}
            <circle cx="0" cy="0" r="32" fill="#FFE600" stroke="#009646" strokeWidth="1.5" />
            
            {/* Mountain peaks and structural frame inside yellow core */}
            {/* Mountain paths */}
            <path
              d="M -16,10 L -4,-6 L 6,4 L 16,-10 L 22,10 Z"
              fill="#111827"
            />
            <path
              d="M -8,10 L 2,-2 L 12,8 L 18,-4 L 22,10 Z"
              fill="#009646"
              opacity="0.9"
            />
            {/* Administrative / structural lines below mountain peaks */}
            <line x1="-18" y1="10" x2="18" y2="10" stroke="#111827" strokeWidth="1.5" />
            <path d="M -12,10 L -12,15 L 12,15 L 12,10" fill="none" stroke="#111827" strokeWidth="1.5" />
            <line x1="0" y1="10" x2="0" y2="15" stroke="#111827" strokeWidth="1.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}

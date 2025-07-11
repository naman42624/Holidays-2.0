'use client'

import React, { useEffect, useState } from 'react'

interface FlightLoaderProps {
  origin: string
  destination: string
  className?: string
}

export default function FlightLoader({ origin, destination, className = '' }: FlightLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0 // Reset animation
        }
        return prev + 1 // Increased speed from 0.5 to 1
      })
    }, 40) // Decreased interval from 50ms to 40ms for smoother, faster animation

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-[60vh] w-full flex flex-col justify-center items-center bg-gradient-to-br from-sky-100 via-sky-200 to-blue-300 rounded-xl p-8 ${className}`}>
      <div className="flight-component">
        <span className="location-text">{origin}</span>
        <input 
          type="range" 
          className="flight" 
          style={{ '--val': progress } as React.CSSProperties}
          value={progress} 
          min="0" 
          max="100" 
          readOnly
          aria-label="Flight progress" 
        />
        <span className="location-text">{destination}</span>
      </div>
      
      <div className="loading-text">
        <p>Searching for the best flights...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <style jsx>{`
        .flight-component {
          --w: min(700px, 90vw);
          width: var(--w);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5em;
          font-family: Helvetica, Arial, sans-serif;
          font-weight: 200;
          font-size: 1.25rem;
          margin-bottom: 3rem;
        }

        .location-text {
          color: #2d3748;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          min-width: 120px;
          text-align: center;
        }

        /*
        Didn't nest this one, in case I wanted to use the input by itself 
        without the div/span structure (in that case: add width!!)
        */
        .flight-component input,
        input.flight {
          --bg: #6c6c84;
          --scale: clamp(1, calc(1 + 0.5 * sin(3.14159 * var(--val) / 100)), 2);
          --shadow: clamp(0.15em, calc(1em * sin(3.14159 * var(--val) / 100)), 1em);
          --opacity: clamp(0.2, calc(1 - sin(3.14159 * var(--val) / 100)), 0.4);
          --color: rgb(0 0 0 / var(--opacity));
          --primary: #f0f4fc;
          --secondary: #b55;
          --val: 0;
          --height: 3em;
          appearance: none;
          flex: 1;
          height: var(--height);
          border: none; /* Firefox adds a default border */
          border-radius: 10em;
          position: relative;
          background: 
            radial-gradient(circle at 0.35em 50%, var(--bg) 0.35em, #0000 0) no-repeat,
            radial-gradient(circle at calc(100% - 0.35em) 50%, var(--bg) 0.35em, #0000 0) no-repeat,
            linear-gradient(#0000 45%, var(--bg) 0 55%, #0000 0) 50% 50% / 99% 100%,
            #f000;
          border: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* 
        the ::before and ::after won't work on Firefox for input range,
        so only use for decoration on the other browsers 
        */
        .flight-component input::before,
        input.flight::before {
          content: "";
          width: calc(var(--val) * 1%);
          min-width: 0.5em;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          background: 
            radial-gradient(circle at 0.35em 50%, #2563eb 0.35em, #0000 0) no-repeat,
            linear-gradient(#0000 45%, #2563eb 0 55%, #0000 0) 50% 50% / calc(100% - 1em) 100% no-repeat,
            #f000;
        }

        .flight-component input::after,
        input.flight::after {
          content: "";
          width: 100%;
          height: 12em;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translate(0, -50%);
          pointer-events: none;
          background:
            /* cloud 1 */
            radial-gradient(3% 20% at 50% 20%, #fff 40%, #0000 0),
            radial-gradient(3% 20% at 52.5% 13%, #fff 40%, #0000 0),
            radial-gradient(2% 20% at 51% 10%, #fff 40%, #0000 0),
            radial-gradient(2.5% 20% at 51.5% 27%, #fff 50%, #0000 0),
            radial-gradient(2% 20% at 53% 23%, #fff 60%, #0000 0),
            radial-gradient(4% 40% at 55% 20%, #fff 40%, #0000 0),
            /* cloud 2 */
            radial-gradient(3% 20% at 40% 80%, #fff 40%, #0000 0),
            radial-gradient(3% 20% at 42.5% 87%, #fff 40%, #0000 0),
            radial-gradient(2% 20% at 41% 90%, #fff 40%, #0000 0),
            radial-gradient(2.5% 20% at 41.5% 72%, #fff 50%, #0000 0),
            radial-gradient(2% 20% at 43% 73%, #fff 60%, #0000 0),
            radial-gradient(4% 40% at 40% 78%, #fff 40%, #0000 0);
          background-size: 300% 100%;
          background-position: calc(var(--val) * 1%) 0;
          -webkit-mask: linear-gradient(90deg, #0000, #0008 35% 65%, #0000);
          mask: linear-gradient(90deg, #0000, #0008 35% 65%, #0000);
        }

        /* track for Chrome and Safari (Firefox is ok) */
        .flight-component input::-webkit-slider-runnable-track,
        input.flight::-webkit-slider-runnable-track {
          height: 100%;
          /* so the plane is above the clouds */
          position: relative;
          z-index: 1; 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Thumb for Chrome and Safari */
        .flight-component input::-webkit-slider-thumb,
        input.flight::-webkit-slider-thumb {
          -webkit-appearance: none; /* Override default look */
          appearance: none;
          transform: translateY(calc(-50% + var(--height) / 2)) scale(var(--scale));
          width: 4em;
          aspect-ratio: 1;
          pointer-events: none;
          background: 
            linear-gradient(var(--secondary) 0 0) 2% 50% / 13% 2.5% no-repeat,
            /* main frame */
            conic-gradient(at -40% 50%, #0000 84.75deg, var(--primary) 85deg 95deg, #0000 95.25deg) 0 0 / 80% 100%,
            /* pilot */
            radial-gradient(closest-side circle at calc(100% - 0.85em) 50%, #9cf 0.3em, #0000 0),
            radial-gradient(20% 10% at 80% 50%, var(--primary) 99%, #0000),
            /* tail */
            conic-gradient(at 45% -45%, #0000 150deg, var(--secondary) 151deg 174deg, #0000 175deg) -50% 40% / 53% 20%,
            conic-gradient(at 45% 145%, #0000 5deg, var(--secondary) 6deg 29deg, #0000 30deg) -50% 60% / 53% 20%,
            /* wings */
            conic-gradient(at 38% -45%, #0000 158deg, var(--secondary) 158.5deg 174deg, #0000 174.5deg) 0 0 / 100% 50%,
            conic-gradient(at 38% 145%, #0000 5deg, var(--secondary) 5.5deg 21deg, #0000 21.5deg) 0 100% / 100% 50%,
            /* engines */
            radial-gradient(80% 50%, #000 99%, #0000) 51% 22% / 21% 11%,
            radial-gradient(80% 50%, #000 99%, #0000) 51% 78% / 21% 11%;
          background-repeat: no-repeat;
          border-radius: 20% / 100%;
          filter: drop-shadow(calc(var(--shadow) * 2) calc(var(--shadow) * 1.25) var(--shadow) var(--color));
          box-shadow: none; /* Safari adds a box-shadow when using drop-shadow on iOS, remove manually */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Thumb for Firefox */
        .flight-component input::-moz-range-thumb,
        input.flight::-moz-range-thumb {
          -webkit-appearance: none; /* Override default look */
          appearance: none;
          transform: scale(var(--scale));
          width: 4em;
          height: 4em;
          border: none;
          pointer-events: none;
          background: 
            linear-gradient(var(--secondary) 0 0) 2% 50% / 13% 2.5% no-repeat,
            /* main frame */
            conic-gradient(at -40% 50%, #0000 84.75deg, var(--primary) 85deg 95deg, #0000 95.25deg) 0 0 / 80% 100%,
            /* pilot */
            radial-gradient(closest-side circle at calc(100% - 0.85em) 50%, #9cf 0.3em, #0000 0),
            radial-gradient(20% 10% at 80% 50%, var(--primary) 99%, #0000),
            /* tail */
            conic-gradient(at 45% -45%, #0000 150deg, var(--secondary) 151deg 174deg, #0000 175deg) -50% 40% / 53% 20%,
            conic-gradient(at 45% 145%, #0000 5deg, var(--secondary) 6deg 29deg, #0000 30deg) -50% 60% / 53% 20%,
            /* wings */
            conic-gradient(at 38% -45%, #0000 158deg, var(--secondary) 158.5deg 174deg, #0000 174.5deg) 0 0 / 100% 50%,
            conic-gradient(at 38% 145%, #0000 5deg, var(--secondary) 5.5deg 21deg, #0000 21.5deg) 0 100% / 100% 50%,
            /* engines */
            radial-gradient(80% 50%, #000 99%, #0000) 51% 22% / 21% 11%,
            radial-gradient(80% 50%, #000 99%, #0000) 51% 78% / 21% 11%;
          background-repeat: no-repeat;
          border-radius: 20% / 100%;
          filter: drop-shadow(calc(var(--shadow) * 2) calc(var(--shadow) * 1.25) var(--shadow) var(--color));
          box-shadow: none;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media (prefers-contrast: more) {
          .flight-component input::-webkit-slider-runnable-track,
          input.flight::-webkit-slider-runnable-track {
            border: 2px solid #666;
            height: 0;
          }

          .flight-component input::-webkit-slider-thumb,
          input.flight::-webkit-slider-thumb {
            transform: translateY(-50%) scale(var(--scale));
            box-sizing: border-box;
            border: 2em solid Highlight;
            clip-path: polygon(0.00% 47.00%,3.00% 46.62%,0.88% 31.62%,5.38% 31.25%,13.38% 45.75%,44.38% 42.50%,43.00% 29.50%,40.25% 29.00%,40.00% 21.50%,42.75% 20.88%,40.00% 0.00%,47.12% 0.12%,55.00% 19.88%,60.88% 19.88%,60.88% 29.12%,58.88% 29.38%,63.75% 40.62%,81.75% 39.75%,88.00% 40.38%,93.00% 42.00%,97.25% 44.38%,99.25% 46.62%,100.00% 50.00%,99.25% 53.38%,97.25% 55.62%,93.00% 58.00%,88.00% 59.62%,81.75% 60.25%,63.75% 59.38%,58.88% 70.62%,60.88% 70.88%,60.88% 80.12%,55.00% 80.12%,47.12% 100.00%,40.00% 100.00%,42.75% 79.12%,40.00% 78.50%,40.25% 71.00%,43.00% 70.50%,44.38% 57.50%,13.38% 54.25%,5.38% 68.75%,0.88% 68.38%,3.00% 53.38%,0.00% 53.00%);
          }
          
          .flight-component input::-moz-range-track,
          input.flight::-moz-range-track {
            border: 2px solid #000;
            height: 0;
          }
          
          .flight-component input::-moz-range-thumb,
          input.flight::-moz-range-thumb {
            box-sizing: border-box;
            border: 2em solid Highlight;
            clip-path: polygon(0.00% 47.00%,3.00% 46.62%,0.88% 31.62%,5.38% 31.25%,13.38% 45.75%,44.38% 42.50%,43.00% 29.50%,40.25% 29.00%,40.00% 21.50%,42.75% 20.88%,40.00% 0.00%,47.12% 0.12%,55.00% 19.88%,60.88% 19.88%,60.88% 29.12%,58.88% 29.38%,63.75% 40.62%,81.75% 39.75%,88.00% 40.38%,93.00% 42.00%,97.25% 44.38%,99.25% 46.62%,100.00% 50.00%,99.25% 53.38%,97.25% 55.62%,93.00% 58.00%,88.00% 59.62%,81.75% 60.25%,63.75% 59.38%,58.88% 70.62%,60.88% 70.88%,60.88% 80.12%,55.00% 80.12%,47.12% 100.00%,40.00% 100.00%,42.75% 79.12%,40.00% 78.50%,40.25% 71.00%,43.00% 70.50%,44.38% 57.50%,13.38% 54.25%,5.38% 68.75%,0.88% 68.38%,3.00% 53.38%,0.00% 53.00%);
          }
        }

        /* the clouds look bad in smaller screens, hide them */
        @media (max-width: 640px) {
          .flight-component input::after,
          input.flight::after {
            display: none;
          }

          /* replace the plane with a helicopter */
          .flight-component input::-webkit-slider-thumb,
          input.flight::-webkit-slider-thumb {    
            width: 3em;
            background:
              /* rotors */
              radial-gradient(closest-side circle at 50% 50%, var(--secondary) 10%, #0001 11% 90%, #0000 91%) 100% 50% / 90% 90%,
              radial-gradient(closest-side circle at 50% 50%, #0000 0 20%, #0001 0 40%, #0000 0 60%, #0001 0 80%, #0000 0) 100% 50% / 91% 91%,
              /* main frame */
              conic-gradient(at -65% 50%, #0000 84.75deg, var(--primary) 85deg 95deg, #0000 95.25deg) 0 0 / 80% 100%,
              /* pilot */
              radial-gradient(farthest-side circle at calc(100% - 0.5em) 50%, #9cf 0.4em, #0000 0),
              radial-gradient(25% 20% at 75% 50%, var(--primary) 99%, #0000),
              /* tail */
              conic-gradient(at 45% -45%, #0000 150deg, var(--secondary) 151deg 174deg, #0000 175deg) -49% 40% / 53% 25%,
              conic-gradient(at 45% 145%, #0000 5deg, var(--secondary) 6deg 29deg, #0000 30deg) -49% 60% / 53% 25%,
              /* legs? */
              linear-gradient(#000 0 0) 100% 33% / 60% 4%,
              linear-gradient(#000 0 0) 100% 67% / 60% 4%;
            background-repeat: no-repeat;
          }
          
          .flight-component input::-moz-range-thumb,
          input.flight::-moz-range-thumb {
            width: 3em;
            height: 3em;
            background:
              /* rotors */
              radial-gradient(closest-side circle at 55% 50%, var(--secondary) 10%, #0001 11% 90%, #0000 91%),
              radial-gradient(closest-side circle at 50% 50%, #0000 0 20%, #0001 0 40%, #0000 0 60%, #0001 0 80%, #0000 0) 50% 50% / 91% 91%,
              /* main frame */
              conic-gradient(at -65% 50%, #0000 84.75deg, var(--primary) 85deg 95deg, #0000 95.25deg) 0 0 / 80% 100%,
              /* pilot */
              radial-gradient(farthest-side circle at calc(100% - 0.5em) 50%, #9cf 0.4em, #0000 0),
              radial-gradient(25% 20% at 75% 50%, var(--primary) 99%, #0000),
              /* tail */
              conic-gradient(at 45% -45%, #0000 150deg, var(--secondary) 151deg 174deg, #0000 175deg) -49% 40% / 53% 25%,
              conic-gradient(at 45% 145%, #0000 5deg, var(--secondary) 6deg 29deg, #0000 30deg) -49% 60% / 53% 25%,
              /* legs? */
              linear-gradient(#000 0 0) 100% 33% / 60% 4%,
              linear-gradient(#000 0 0) 100% 67% / 60% 4%;
            background-repeat: no-repeat;
          }
        }

        .loading-text {
          text-align: center;
          color: #2d3748;
        }

        .loading-text p {
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 1rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          animation: bounce 1.5s infinite ease-in-out;
        }

        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

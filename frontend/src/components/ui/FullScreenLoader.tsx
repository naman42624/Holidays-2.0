'use client';

import React from 'react';

interface FullScreenLoaderProps {
  message?: string;
  isVisible?: boolean;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ 
  message = "Loading...", 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100">
      {/* Earth Loader Container */}
      <div className="earth-container mb-8">
        <div className="earth-loader">
          {/* Land masses as SVG paths */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="land-mass land-1">
            <path
              transform="translate(100 100)"
              d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
              fill="#7CC133"
            />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="land-mass land-2">
            <path
              transform="translate(100 100)"
              d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
              fill="#7CC133"
            />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="land-mass land-3">
            <path
              transform="translate(100 100)"
              d="M30.6,-49.2C42.5,-46.1,57.1,-43.7,67.6,-35.7C78.1,-27.6,84.6,-13.8,80.3,-2.4C76.1,8.9,61.2,17.8,52.5,29.1C43.8,40.3,41.4,53.9,33.7,64C26,74.1,13,80.6,2.2,76.9C-8.6,73.1,-17.3,59,-30.6,52.1C-43.9,45.3,-61.9,45.7,-74.1,38.2C-86.4,30.7,-92.9,15.4,-88.6,2.5C-84.4,-10.5,-69.4,-20.9,-60.7,-34.6C-52.1,-48.3,-49.8,-65.3,-40.7,-70C-31.6,-74.8,-15.8,-67.4,-3.2,-61.8C9.3,-56.1,18.6,-52.3,30.6,-49.2Z"
              fill="#7CC133"
            />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="land-mass land-4">
            <path
              transform="translate(100 100)"
              d="M39.4,-66C48.6,-62.9,51.9,-47.4,52.9,-34.3C53.8,-21.3,52.4,-10.6,54.4,1.1C56.3,12.9,61.7,25.8,57.5,33.2C53.2,40.5,39.3,42.3,28.2,46C17,49.6,8.5,55.1,1.3,52.8C-5.9,50.5,-11.7,40.5,-23.6,37.2C-35.4,34,-53.3,37.5,-62,32.4C-70.7,27.4,-70.4,13.7,-72.4,-1.1C-74.3,-15.9,-78.6,-31.9,-73.3,-43C-68.1,-54.2,-53.3,-60.5,-39.5,-60.9C-25.7,-61.4,-12.9,-56,1.1,-58C15.1,-59.9,30.2,-69.2,39.4,-66Z"
              fill="#7CC133"
            />
          </svg>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center">
        <p className="text-gray-800 text-xl font-medium tracking-wide mb-4 animate-pulse">
          {message}
        </p>

        {/* Subtle dots animation */}
        <div className="flex space-x-2 justify-center">
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      <style jsx>{`
        .earth-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .earth-loader {
          --watercolor: #3344c1;
          --landcolor: #7cc133;
          width: 8rem;
          height: 8rem;
          background-color: var(--watercolor);
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          box-shadow:
            inset 0 0.5rem rgba(255, 255, 255, 0.25),
            inset 0 -0.5rem rgba(0, 0, 0, 0.25),
            0 0 2rem rgba(59, 130, 246, 0.4),
            0 0 4rem rgba(59, 130, 246, 0.2);
          border: solid 0.15rem #e5e7eb;
          animation: startround 1s ease-out;
          animation-iteration-count: 1;
        }

        .land-mass {
          position: absolute;
          width: 7rem;
          height: auto;
        }

        .land-1 {
          bottom: -2rem;
          animation: round1 6s infinite linear 0.75s;
        }

        .land-2 {
          top: -3rem;
          animation: round1 6s infinite linear;
        }

        .land-3 {
          top: -2.5rem;
          animation: round2 6s infinite linear;
        }

        .land-4 {
          bottom: -2.2rem;
          animation: round2 6s infinite linear 0.75s;
        }

        @keyframes startround {
          0% {
            filter: brightness(300%);
            box-shadow: 
              inset 0 0.5rem rgba(255, 255, 255, 0.5),
              0 0 3rem rgba(59, 130, 246, 0.6),
              0 0 5rem rgba(59, 130, 246, 0.3);
            transform: scale(0.8);
          }
          50% {
            filter: brightness(200%);
            box-shadow: 
              inset 0 0.5rem rgba(255, 255, 255, 0.4),
              0 0 2.5rem rgba(59, 130, 246, 0.5),
              0 0 4rem rgba(59, 130, 246, 0.25);
            transform: scale(1.1);
          }
          100% {
            filter: brightness(100%);
            box-shadow:
              inset 0 0.5rem rgba(255, 255, 255, 0.25),
              inset 0 -0.5rem rgba(0, 0, 0, 0.25),
              0 0 2rem rgba(59, 130, 246, 0.4),
              0 0 4rem rgba(59, 130, 246, 0.2);
            transform: scale(1);
          }
        }

        @keyframes round1 {
          0% {
            left: -2rem;
            opacity: 100%;
            transform: skewX(0deg) rotate(0deg);
          }
          30% {
            left: -6rem;
            opacity: 100%;
            transform: skewX(-25deg) rotate(25deg);
          }
          31% {
            left: -6rem;
            opacity: 0%;
            transform: skewX(-25deg) rotate(25deg);
          }
          35% {
            left: 7rem;
            opacity: 0%;
            transform: skewX(25deg) rotate(-25deg);
          }
          45% {
            left: 7rem;
            opacity: 100%;
            transform: skewX(25deg) rotate(-25deg);
          }
          100% {
            left: -2rem;
            opacity: 100%;
            transform: skewX(0deg) rotate(0deg);
          }
        }

        @keyframes round2 {
          0% {
            left: 5rem;
            opacity: 100%;
            transform: skewX(0deg) rotate(0deg);
          }
          75% {
            left: -7rem;
            opacity: 100%;
            transform: skewX(-25deg) rotate(25deg);
          }
          76% {
            left: -7rem;
            opacity: 0%;
            transform: skewX(-25deg) rotate(25deg);
          }
          77% {
            left: 8rem;
            opacity: 0%;
            transform: skewX(25deg) rotate(-25deg);
          }
          80% {
            left: 8rem;
            opacity: 100%;
            transform: skewX(25deg) rotate(-25deg);
          }
          100% {
            left: 5rem;
            opacity: 100%;
            transform: skewX(0deg) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FullScreenLoader;

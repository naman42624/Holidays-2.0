import React from 'react'
import '../styles/hotel-loader.css'

interface HotelLoaderProps {
  location?: string
}

export default function HotelLoader({ location }: HotelLoaderProps) {
  return (
    <div className="hotel-loader-container">
      <div className="hotel-loader">
        {/* Generate 25 windows */}
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="window" />
        ))}
        <div className="door" />
        <div className="hotel-sign">
          <span>H</span>
          <span>O</span>
          <span>T</span>
          <span>E</span>
          <span>L</span>
        </div>
      </div>
      <div className="hotel-loader-text">
        Searching for hotels
        {location && (
          <>
            {' '}in <span className="hotel-loader-location">{location}</span>
          </>
        )}
        ...
      </div>
    </div>
  )
}

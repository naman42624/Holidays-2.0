'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image 
                src="/logo.png" 
                alt="Holidays by Bells" 
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Crafting unforgettable travel experiences for over 5 years. From dream destinations to seamless bookings, we&apos;re your trusted travel partner.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/flights" className="text-gray-300 hover:text-white transition-colors">
                  Flight Booking
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="text-gray-300 hover:text-white transition-colors">
                  Hotel Reservations
                </Link>
              </li>
              <li>
                <Link href="/activities" className="text-gray-300 hover:text-white transition-colors">
                  Activities & Tours
                </Link>
              </li>
              <li>
                <Link href="/tour-packages" className="text-gray-300 hover:text-white transition-colors">
                  Holiday Packages
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-yellow-400" />
                <span className="text-gray-300">(+91) 9988805805 </span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-yellow-400" />
                <span className="text-gray-300">info@holidaysbybells.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 text-yellow-400 mt-1" />
                <span className="text-gray-300">
                  174 Garha Road<br />
                  Opp. Bus Stand Gate no. 6 <br />
                  Jalandhar, Punjab 144001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Holidays by Bells. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

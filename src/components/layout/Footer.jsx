import { MessageCircleHeart, Phone, PinIcon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="py-8 bg-blue-900 rounded-t-3xl text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* QUICK LINKS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">QUICK LINKS</h3>
            <ul className="space-y-3">
              <Link to="/customer/about" className="hover:text-blue-300 transition-colors duration-200">
                About
              </Link><br />
              <Link to="/customer/bookings" className="hover:text-blue-300 transition-colors duration-200">
                Booking
              </Link><br />
              <Link to="/customer/gallery" className="hover:text-blue-300 transition-colors duration-200">
                Gallery
              </Link><br />
              <Link to="/customer/rooms" className="hover:text-blue-300 transition-colors duration-200">
                Rooms
              </Link><br />
              <Link to="/customer/restaurant" className="hover:text-blue-300 transition-colors duration-200">
                Restaurant
              </Link><br />

            </ul>
          </div>

          {/* CONTACT US */}
          <div>
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">CONTACT US</h3>
            <ul className="space-y-3">
              <Link className="flex items-start">
                <span className="mr-3 mt-1">
                  <Phone />
                </span>
                <span>0906 231 4236</span>
              </Link>
              <Link className="flex items-start">
                <span className="mr-3 mt-1">
                  <MessageCircleHeart />
                </span>
                <span>demirenhotel@yahoo.com.ph</span>
              </Link>
              <Link className="flex items-start">
                <span className="mr-3 mt-1">
                  <PinIcon />
                </span>
                <span>Tiano Kalambaguhan Street, Brgy 14, Cagayan de Oro, Philippines </span>
              </Link>
            </ul>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white pt-6 text-center text-sm">
          <p>Copyright © 2025 by Demiren Hotel and Restaurant. All rights reserved.</p>
        </div>
      </div>

    </footer>
  )
}


export default Footer
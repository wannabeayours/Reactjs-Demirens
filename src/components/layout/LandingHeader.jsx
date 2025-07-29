import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from '../ui/button';
import ThemeToggle from './ThemeToggle';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '../ui/menubar';


const components = [
  {
    title: "About",
    href: "/customer/about",
    description: "Learn more about our hotel.",
  },
  {
    title: "Gallery",
    href: "/customer/gallery",
    description: "View our photo gallery.",
  },
  {
    title: "Rooms",
    href: "/customer/rooms",
    description: "Explore room options.",
  },
  {
    title: "Restaurant",
    href: "/customer/restaurant",
    description: "Discover our dining menu.",
  },
  {
    title: "Contact Us",
    href: "/customer/contact",
    description: "Reach out to us.",
  },
];

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);


  return (
    <div
      className={`sticky top-0 left-0 w-full flex items-center justify-between px-8 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'bg-[#0D1423]  shadow-md py-2 text-white' : 'bg-transparent py-4 text-white'
        }`} >
      <div className="flex items-center gap-10">
        <div className="font-bold text-lg uppercase">LOGO</div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/customer/about" className="hover:text-blue-600 transition">About</Link>
          <Link to="/customer/rooms" className="hover:text-blue-600 transition">Rooms</Link>
          <Link to="/customer/gallery" className="hover:text-blue-600 transition">Gallery</Link>
          <Link to="/contact" className="hover:text-blue-600 transition">Contact</Link>
        </nav>
      </div>


      <div className="hidden lg:block text-sm font-bold ">
        Demiren Hotel and Restaurant
      </div>


      <div className="flex items-center gap-3">
        <Link to="/customer/bookings">
          <Button className="mr-4 bg-[#bba008]  hover:bg-yellow-600">
            Book Now
          </Button>
        </Link>
        <Link to="/login">
          <Button variant={"secondary"} className={"mr-4"}>
            Sign In
          </Button>
        </Link>

        {/* <ThemeToggle /> */}
      </div>


    </div>
  )
}

export default LandingHeader
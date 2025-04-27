import React from 'react'
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
  return (
    <div className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-8 py-8 z-50 shadow">

      <div className="flex-shrink-0 font-bold uppercase text-sm">
        LOGO
      </div>

      <h1 className="text-lg font-semibold text-center   flex-grow">
        Demiren Hotel and Restaurant
      </h1>


      <NavigationMenu >
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                {components.map((item) => (
                  <div key={item.title}>
                    <Link
                      to={item.href} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {item.title}
                    </Link>
                    <p className="px-4 py-1 text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>



          <NavigationMenuItem>
            <Link to="/customer/bookings">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Book Now
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link to="/login">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Sign In
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>



        </NavigationMenuList>
      </NavigationMenu>

    </div>
  )
}

export default LandingHeader
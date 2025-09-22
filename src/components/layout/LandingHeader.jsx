import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { MenuSquareIcon } from 'lucide-react'

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={` fixed top-0 left-0 right-0 w-full  flex items-center justify-between p-7 duration-500 ${scrolled ? 'bg-white' : 'bg-transparent'
        }`}>

        {/* Left - Logo */}
        <div className="flex items-center">
          <img src="/assets/images/logs.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Center - Menu Links (Hidden on Mobile) */}

        <div className="hidden md:block bg-black/70 text-white  rounded-full px-6 py-2 ">
          <nav className="flex gap-x-8">
            <a href="#home" className="hover:text-black">Home</a>
            <a href="#about" className="hover:text-black">About</a>
            <a href="#contact" className="hover:text-black">Contact</a>
          </nav>
        </div>



        {/* Right - Login Button */}
        <div >
          <Button onClick={() => window.location.href = '/login'} className="bg-black/70 text-white rounded-full px-6 py-2 hover:bg-black/80 md:px-10 md:py-4 md:text-sm">
            Log In
          </Button>
        </div>

        {/* Hamburger Menu - Mobile View */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <MenuSquareIcon className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className=" text-white">
              <div className="flex items-center mt-5">
                <img src="/assets/images/logs.png" alt="Logo" className="h-10 w-auto" />
              </div>
              <Button variant="ghost" asChild className="hover:bg-gray-200 text-black rounded">
                <a href="#home">Home</a>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-gray-200 text-black rounded">
                <a href="#about">About</a>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-gray-200 text-black rounded">
                <a href="#contact">Contact</a>
              </Button>
              <div className="flex justify-center">
                <Button
                  variant="default"
                  className=" px-5 py-2 text-sm rounded-full w-min flex justify-center items-center"
                >
                  Log In
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </header>
    </>
  )
}

export default LandingHeader
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  MenuSquareIcon, Home, User, BedIcon, File, CreditCard, User2Icon, Calendar1Icon,
  StarIcon, LogOutIcon, PillBottleIcon, HistoryIcon, Bed, MinusCircleIcon,
  PlusSquareIcon, Percent, ChevronDown, Package, NotebookPen, Laptop, ReceiptText, Wallet
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

function Sidebar({ onCollapse }) {
  const [openMasters, setOpenMasters] = useState(false)
  const [openPayments, setOpenPayments] = useState(false)
  const [openBookings, setOpenBookings] = useState(false) // New state for bookings
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const desktopScrollRef = useRef(null)
  const mobileScrollRef = useRef(null)

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Load dropdown states from localStorage on component mount
  useEffect(() => {
    const savedOpenMasters = localStorage.getItem('sidebar-openMasters')
    const savedOpenPayments = localStorage.getItem('sidebar-openPayments')
    const savedOpenBookings = localStorage.getItem('sidebar-openBookings')

    if (savedOpenMasters !== null) {
      setOpenMasters(JSON.parse(savedOpenMasters))
    }
    if (savedOpenPayments !== null) {
      setOpenPayments(JSON.parse(savedOpenPayments))
    }
    if (savedOpenBookings !== null) {
      setOpenBookings(JSON.parse(savedOpenBookings))
    }
  }, [])

  // Save scroll position before navigation
  const saveScrollPosition = useCallback(() => {
    if (desktopScrollRef.current) {
      const scrollTop = desktopScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')?.scrollTop || 0
      localStorage.setItem('sidebar-scroll-position', scrollTop.toString())
    }
    if (mobileScrollRef.current) {
      const scrollTop = mobileScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')?.scrollTop || 0
      localStorage.setItem('sidebar-mobile-scroll-position', scrollTop.toString())
    }
  }, [])

  // Save dropdown states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sidebar-openMasters', JSON.stringify(openMasters))
  }, [openMasters])

  useEffect(() => {
    localStorage.setItem('sidebar-openPayments', JSON.stringify(openPayments))
  }, [openPayments])

  useEffect(() => {
    localStorage.setItem('sidebar-openBookings', JSON.stringify(openBookings))
  }, [openBookings])

  // Restore scroll position after navigation
  useEffect(() => {
    const restoreScrollPosition = () => {
      const savedPosition = localStorage.getItem('sidebar-scroll-position')
      const savedMobilePosition = localStorage.getItem('sidebar-mobile-scroll-position')

      if (desktopScrollRef.current && savedPosition) {
        const viewport = desktopScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (viewport) {
          viewport.scrollTop = parseInt(savedPosition)
        }
      }

      if (mobileScrollRef.current && savedMobilePosition) {
        const viewport = mobileScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (viewport) {
          viewport.scrollTop = parseInt(savedMobilePosition)
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(restoreScrollPosition, 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  // Access check - allow Admin and Front-Desk; block others
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const userType = (localStorage.getItem('userType') || '').toLowerCase()

    if (!userId || !['admin', 'employee', 'front-desk', 'frontdesk'].includes(userType)) {
      console.log('Unauthorized access detected in Sidebar')
      toast.error('Employee access required')
      navigate('/employee/login')
    }
  }, [navigate])

  // Logout function
  const handleLogout = useCallback(() => {
    try {
      // Clear local auth state regardless of backend
      localStorage.removeItem('userId')
      localStorage.removeItem('fname')
      localStorage.removeItem('lname')
      localStorage.removeItem('userType')
      localStorage.removeItem('userLevel')

      toast.success('Successfully logged out')
      navigate('/employee/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error during logout')
    }
  }, [navigate])

  const mainLinks = [
    { path: "/admin/dashboard", icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { path: "/admin/profile", icon: <User className="w-4 h-4" />, label: "Profile" },
    { path: "/admin/roomslist", icon: <BedIcon className="w-4 h-4" />, label: "Rooms List" },
    { path: "/admin/bookinglist", icon: <File className="w-4 h-4" />, label: "Bookings List" },
    { path: "/admin/transactionhistory", icon: <HistoryIcon className="w-4 h-4" />, label: "Transaction History" },
    { path: "/admin/requestedamenities", icon: <PillBottleIcon className="w-4 h-4" />, label: "Amenity Requests" },
    { path: "/admin/choose-rooms", icon: <NotebookPen className="w-4 h-4" />, label: "Add Walk In" },
    { path: "/admin/visitorslog", icon: <User2Icon className="w-4 h-4" />, label: "Visitors" },
  ]

  const bookingLinks = [
    { path: "/admin/choose-rooms", icon: <NotebookPen className="w-4 h-4" />, label: "Add Walk In" },
  ]

  const paymentLinks = [
    { path: "/admin/invoice", icon: <ReceiptText className="w-4 h-4" />, label: "Invoice" },
    { path: "/admin/billings", icon: <Wallet className="w-4 h-4" />, label: "Billings" },
  ]


// Admin-only links
  const adminOnlyLinks = [
    { path: "/admin/employeelist", icon: <User className="w-4 h-4" />, label: "Employee List" },
    { path: "/admin/reviews", icon: <StarIcon className="w-4 h-4" />, label: "Reviews" },
    { path: "/admin/guestprofile", icon: <User className="w-4 h-4" />, label: "Customers List" },
  ];

  const masterLinks = [
    { path: "/admin/roomtypemaster", icon: <Bed className="w-4 h-4" />, label: "Room Types" },
    { path: "/admin/amenitymaster", icon: <PillBottleIcon className="w-4 h-4" />, label: "Amenities" },
    { path: "/admin/chargemaster", icon: <MinusCircleIcon className="w-4 h-4" />, label: "Charges" },
    { path: "/admin/chargescategory", icon: <PlusSquareIcon className="w-4 h-4" />, label: "Charges Masters" },
    { path: "/admin/discountmaster", icon: <Percent className="w-4 h-4" />, label: "Discount" },
  ]

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (onCollapse) {
      onCollapse(open);
    }
  };


  // Render navigation links
  const renderNavigationLinks = useCallback(() => (
    <>
      {/* Main Links */}
      {mainLinks.map((item, index) => (
        <Link to={item.path} key={index} className="block w-full" onClick={saveScrollPosition}>
          <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white">
            {item.icon}
            {item.label}
          </Button>
        </Link>
      ))}

      {/* Admin-only Links */}
      {(localStorage.getItem("userLevel") || "").toLowerCase() === "admin" && (
        adminOnlyLinks.map((item, index) => (
          <Link to={item.path} key={`admin-${index}`} className="block w-full" onClick={saveScrollPosition}>
            <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white">
              {item.icon}
              {item.label}
            </Button>
          </Link>
        ))
      )}

      {/* Add Walk-In */}
      <Link to="/admin/choose-rooms" className="block w-full" onClick={saveScrollPosition}>
        <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white">
          <NotebookPen className="w-4 h-4" />
          Add Walk In
        </Button>
      </Link>

      {/* Collapsible: Payments */}
      <Collapsible open={openPayments} onOpenChange={(open) => {
        // Save current scroll position before state change
        saveScrollPosition()
        setOpenPayments(open)
        // Restore scroll position after DOM update
        setTimeout(() => {
          const savedPosition = localStorage.getItem('sidebar-scroll-position')
          const savedMobilePosition = localStorage.getItem('sidebar-mobile-scroll-position')

          if (desktopScrollRef.current && savedPosition) {
            const viewport = desktopScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
              viewport.scrollTop = parseInt(savedPosition)
            }
          }

          if (mobileScrollRef.current && savedMobilePosition) {
            const viewport = mobileScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
              viewport.scrollTop = parseInt(savedMobilePosition)
            }
          }
        }, 50)
      }}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between items-center text-white hover:bg-white/10 hover:text-white">
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openPayments ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-2 mt-1">
          {paymentLinks.map((item, index) => (
            <Link to={item.path} key={index} className="block w-full" onClick={saveScrollPosition}>
              <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white">
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Collapsible: Master Group */}
      {(localStorage.getItem("userLevel") || "").toLowerCase() === "admin" && (
        <Collapsible open={openMasters} onOpenChange={(open) => {
          // Save current scroll position before state change
          saveScrollPosition()
          setOpenMasters(open)
          // Restore scroll position after DOM update
          setTimeout(() => {
            const savedPosition = localStorage.getItem('sidebar-scroll-position')
            const savedMobilePosition = localStorage.getItem('sidebar-mobile-scroll-position')

            if (desktopScrollRef.current && savedPosition) {
              const viewport = desktopScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
              if (viewport) {
                viewport.scrollTop = parseInt(savedPosition)
              }
            }

            if (mobileScrollRef.current && savedMobilePosition) {
              const viewport = mobileScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
              if (viewport) {
                viewport.scrollTop = parseInt(savedMobilePosition)
              }
            }
          }, 50)
        }}>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between items-center text-white hover:bg-white/10 hover:text-white">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Masters
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openMasters ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pl-4 space-y-2 mt-1">
            {masterLinks.map((item, index) => (
              <Link to={item.path} key={index} className="block w-full" onClick={saveScrollPosition}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white">
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  ), [openBookings, openPayments, openMasters, saveScrollPosition])

  // Mobile sidebar (Sheet)
  const MobileSidebar = useCallback(() => (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-sm">
          <MenuSquareIcon className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-[#34699a] border-none">
        <SheetHeader>
          <SheetTitle className="text-white">DEMIREN HOTEL AND RESTAURANT</SheetTitle>
          <SheetDescription className="text-gray-200">Hotel Management System</SheetDescription>
        </SheetHeader>


        <ScrollArea ref={mobileScrollRef} className="h-[calc(100vh-100px)] mt-2 pr-2">
          <div className="mt-2 space-y-3 pb-32">
            {renderNavigationLinks()}
          </div>
        </ScrollArea>

        <div className="absolute bottom-4 left-4 right-4 border-t border-gray-300 pt-4 bg-[#34699a]">
          <Button
            onClick={handleLogout}
            className="w-full bg-[#dd474c] hover:bg-[#c73e42] text-white border-0"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ), [isOpen, handleOpenChange, mobileScrollRef, renderNavigationLinks, handleLogout])

  // Desktop sidebar (Fixed)
  const DesktopSidebar = useCallback(() => (
    <div className="fixed left-0 top-0 h-full w-72 bg-[#34699a] shadow-lg z-40">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">DEMIREN HOTEL AND RESTAURANT</h1>
          <p className="text-sm text-gray-200">Hotel Management System</p>
        </div>


        <ScrollArea ref={desktopScrollRef} className="h-[calc(100vh-120px)]">
          <div className="space-y-2 pb-32">
            {renderNavigationLinks()}
          </div>
        </ScrollArea>

        <div className="absolute bottom-4 left-6 right-6 border-t border-gray-300 pt-4 bg-[#34699a]">
          <Button
            onClick={handleLogout}
            className="w-full bg-[#dd474c] hover:bg-[#c73e42] text-white border-0"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  ), [desktopScrollRef, renderNavigationLinks, handleLogout])

  return (
    <div>
      {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
    </div>
  )
}

export default Sidebar

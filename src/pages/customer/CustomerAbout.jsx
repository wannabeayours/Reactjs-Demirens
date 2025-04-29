import { Card } from '@/components/ui/card'
import { BookOpen, Building2, HandshakeIcon } from 'lucide-react'
import React from 'react'


function CustomerAbout() {
  return (

    <div >
      <div>

      
        <section className="flex items-center justify-center h-screen bg-gray-100">
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            About Demiren Hotel
          </h1>
          <p className="mt-4 text-xl max-w-3xl mx-auto">
            Discover luxury and comfort at its finest
          </p>
        </section>

        <section className="h-screen flex items-center">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">

            <div className="text-left">
              <h2 className="text-2xl font-bold mb-4">Demiren Hotel</h2>
              <p className="mb-4">
                Founded in 1990, Demiren Hotel has been the epitome of luxury and hospitality.
                Our mission is to provide unforgettable experiences for every guest.
              </p>
              <p>
                From our world-class facilities to our impeccable service, everything is designed for your comfort.
              </p>
            </div>

            <div className="rounded-xl shadow-lg p-6">
              <img
                src=""
                alt="Hotel"
                className="rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-2">Luxury Redefined</h3>
              <p>
                Experience unparalleled comfort in our suites with breathtaking views and top-class service.
              </p>
            </div>

          </div>
        </section>

        
        <section className="h-screen flex items-center">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 md:gap-8 w-full">

            <Card className="p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <BookOpen />
              <h2 className="text-2xl font-bold mb-4">Our History</h2>
              <p >
                Founded in 2010, Demiren Hotel has grown from a small boutique hotel to a premier luxury destination.
                Our commitment to exceptional service and attention to detail has earned us numerous awards and
                a loyal clientele from around the world.
              </p>
            </Card>

            <Card className="p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Building2 />
              <h2 className="text-2xl font-bold mb-4">Our Facilities</h2>
              <p >
                Founded in 2010, Demiren Hotel has grown from a small boutique hotel to a premier luxury destination.
                Our commitment to exceptional service and attention to detail has earned us numerous awards and
                a loyal clientele from around the world.
              </p>
            </Card>

            <Card className="p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <HandshakeIcon />
              <h2 className="text-2xl font-bold mb-4">Our Promise</h2>
              <p >
                Founded in 2010, Demiren Hotel has grown from a small boutique hotel to a premier luxury destination.
                Our commitment to exceptional service and attention to detail has earned us numerous awards and
                a loyal clientele from around the world.
              </p>
            </Card>

          </div>
        </section>

      </div>
    </div>

  )
}

export default CustomerAbout
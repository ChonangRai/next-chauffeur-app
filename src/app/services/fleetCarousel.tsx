// components/fleet-carousel.tsx
"use client"

import Image from "next/image"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Car {
  name: string
  image: string
  description: string
}

interface FleetCarouselProps {
  title: string
  cars: Car[]
  capacity: string
}

export function FleetCarousel({ title, cars, capacity }: FleetCarouselProps) {
  return (
    <div className="bg-background rounded-lg overflow-hidden shadow-lg">

      <div className="fleet-carousel">
        <Swiper
          modules={[Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          autoplay={{
            delay: 3000, // Auto-swiping delay in milliseconds
            disableOnInteraction: false, // Ensure it continues to autoplay even after interaction
          }}
          pagination
          loop={true}
          className="w-full"
        >
          {cars.map((car, index) => (
            <SwiperSlide key={index}>
              <div className="p-1">
                <div className="h-32 sm:h-40 lg:h-48 bg-gray-300 overflow-hidden rounded-t-lg">
                  <Image
                    src={car.image || "/placeholder.svg?height=192&width=384"}
                    alt={car.name}
                    width={384}
                    height={350}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="px-4 sm:px-6">
        <h3 className="text-lg sm:text-xl font-bold mb-1">{title}</h3>
        <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
          {cars[0].description}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground pb-3 sm:pb-4">
          <strong>Capacity:</strong> {capacity}
        </p>
      </div>
    </div>
  )
}

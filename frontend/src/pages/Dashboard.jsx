import { useSelector } from "react-redux"
import Navbar from "@/components/Navbar"
import Autoplay from "embla-carousel-autoplay"
import * as React from "react"

import { Play, Briefcase, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export default function Dashboard() {
  const { user } = useSelector((state) => state.user)

  const companies = [
    "Google",
    "Meta",
    "Amazon",
    "Microsoft",
    "Netflix",
    "Adobe",
    "Flipkart",
    "Swiggy",
  ]

  const plugin = React.useRef(
    Autoplay({ delay: 1500, stopOnInteraction: false })
  )

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r p-4 hidden md:block">
        <h2 className="text-xl font-bold text-blue-600 mb-6">Place-Mentors</h2>

        <nav className="space-y-3">
          {["Dashboard", "Companies", "Practice", "Jobs"].map((item) => (
            <div
              key={item}
              className={`p-2 rounded-lg cursor-pointer ${
                item === "Dashboard"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1">
        <Navbar />

        <div className="p-6 space-y-6">

          {/* 🔥 TOP */}
          <div className="grid md:grid-cols-3 gap-6">

            <div className="md:col-span-2 bg-linear-to-r from-blue-500 to-purple-500 text-white p-6 rounded-2xl shadow">
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.fullName} 👋
              </h1>

              <p className="mt-2 text-sm opacity-90">
                Keep going 🚀
              </p>

              <button className="mt-4 bg-white text-black px-4 py-2 rounded-lg">
                Resume →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl">
              <p className="text-sm text-gray-500">Progress</p>

              <h2 className="text-3xl font-bold text-blue-600">
                740 /1000
              </h2>

              <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
                <div className="bg-blue-500 h-2 rounded-full w-[74%]"></div>
              </div>
            </div>
          </div>

          {/* 🔥 ACTION */}
          <div className="grid md:grid-cols-2 gap-6">

            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-xl shadow">
              <div className="flex items-center gap-3">
                <Play className="text-blue-500" />
                <div>
                  <h3 className="font-semibold">Practice</h3>
                  <p className="text-sm text-gray-500">Daily quiz</p>
                </div>
              </div>
              →
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-xl shadow">
              <div className="flex items-center gap-3">
                <Briefcase className="text-purple-500" />
                <div>
                  <h3 className="font-semibold">Jobs</h3>
                  <p className="text-sm text-gray-500">Openings</p>
                </div>
              </div>
              →
            </div>
          </div>

          {/* 🔥 GRAPH */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Weekly Performance
            </h3>

            <div className="h-40 bg-linear-to-r from-blue-200 to-blue-100 rounded-xl flex items-end p-4">
              <div className="w-full h-[60%] bg-blue-500 rounded-lg"></div>
            </div>
          </div>

          {/* 🔥 COMPANIES AUTO CAROUSEL */}
          <div>
            <h3 className="font-semibold mb-4">Recommended Companies</h3>

            <Carousel
              plugins={[plugin.current]}
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {companies.map((company, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-1/2 sm:basis-1/3 lg:basis-1/5"
                  >
                    <div className="p-2">
                      <Card className="hover:scale-105 transition">
                        <CardContent className="flex items-center justify-center h-24">
                          <span className="font-semibold text-lg">
                            {company}
                          </span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          

        </div>
      </div>
    </div>
  )
}
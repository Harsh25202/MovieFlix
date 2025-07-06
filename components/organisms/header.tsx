"use client"

import type React from "react"

import Link from "next/link"
import { Search, Film, Database, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter, usePathname } from "next/navigation"
import { LoadingSpinner } from "@/components/atoms/loading-spinner"

function DataSourceIndicator() {
  const [isMongoConnected, setIsMongoConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setIsMongoConnected(data.database?.status === "connected")
      })
      .catch(() => {
        setIsMongoConnected(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingSpinner size="sm" />

  return (
    <Badge variant={isMongoConnected ? "default" : "secondary"} className="hidden lg:flex items-center gap-1">
      <Database className="h-3 w-3" />
      {isMongoConnected ? "Live" : "Demo"}
    </Badge>
  )
}

export function Header() {
  const { user, logout, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Handle navigation loading state
  useEffect(() => {
    const handleStart = () => setNavigating(true)
    const handleComplete = () => setNavigating(false)

    // Listen for route changes
    const originalPush = router.push
    router.push = (...args) => {
      handleStart()
      return originalPush.apply(router, args).finally(handleComplete)
    }

    return () => {
      router.push = originalPush
    }
  }, [router])

  const handleLogout = async () => {
    setNavigating(true)
    await logout()
    window.location.href = "/"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setNavigating(true)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery("")
    }
  }

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      setNavigating(true)
      router.push(href)
    }
    setMobileMenuOpen(false)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
      {/* Navigation Loading Bar */}
      {navigating && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-red-600">
          <div className="h-full bg-red-400 animate-pulse" />
        </div>
      )}

      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-red-500" onClick={() => handleNavigation("/")}>
              <Film className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                MovieFlix
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => handleNavigation("/")}
                className="text-white hover:text-red-400 transition-colors font-medium"
              >
                Home
              </button>
              {user && (
                <>
                  <button
                    onClick={() => handleNavigation("/movies")}
                    className="text-white hover:text-red-400 transition-colors font-medium"
                  >
                    Movies
                  </button>
                  <button
                    onClick={() => handleNavigation("/series")}
                    className="text-white hover:text-red-400 transition-colors font-medium"
                  >
                    TV Shows
                  </button>
                  <button
                    onClick={() => handleNavigation("/watchlist")}
                    className="text-white hover:text-red-400 transition-colors font-medium"
                  >
                    My List
                  </button>
                </>
              )}
              <button
                onClick={() => handleNavigation("/theaters")}
                className="text-white hover:text-red-400 transition-colors font-medium"
              >
                Theaters
              </button>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <DataSourceIndicator />

              {/* Search */}
              <div className="hidden md:block">
                {showSearch ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <Input
                      type="text"
                      placeholder="Search movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSearch(false)}
                      className="ml-2 text-white hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSearch(true)}
                    className="text-white hover:text-red-400"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:text-red-400"
                onClick={() => handleNavigation("/search")}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 bg-red-600">
                        <AvatarFallback className="bg-red-600 text-white font-semibold">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                        <p className="text-xs leading-none text-gray-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/profile")}
                      className="text-white hover:bg-gray-800"
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/watchlist")}
                      className="text-white hover:bg-gray-800"
                    >
                      My List
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/account")}
                      className="text-white hover:bg-gray-800"
                    >
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-gray-800">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation("/login")}
                    className="text-white hover:text-red-400"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleNavigation("/signup")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:text-red-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-800">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => handleNavigation("/")}
                  className="text-white hover:text-red-400 transition-colors font-medium text-left"
                >
                  Home
                </button>
                {user && (
                  <>
                    <button
                      onClick={() => handleNavigation("/movies")}
                      className="text-white hover:text-red-400 transition-colors font-medium text-left"
                    >
                      Movies
                    </button>
                    <button
                      onClick={() => handleNavigation("/series")}
                      className="text-white hover:text-red-400 transition-colors font-medium text-left"
                    >
                      TV Shows
                    </button>
                    <button
                      onClick={() => handleNavigation("/watchlist")}
                      className="text-white hover:text-red-400 transition-colors font-medium text-left"
                    >
                      My List
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleNavigation("/theaters")}
                  className="text-white hover:text-red-400 transition-colors font-medium text-left"
                >
                  Theaters
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

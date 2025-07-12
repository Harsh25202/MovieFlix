export const runtime = "edge";
"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Settings, CreditCard, Shield, Bell } from "lucide-react"

export default function AccountPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription className="text-gray-400">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Edit Profile Information
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Language & Region
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  View Subscription
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Payment Methods
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Billing History
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription className="text-gray-400">Control your privacy and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Privacy Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Two-Factor Authentication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Download My Data
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-gray-400">Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Email Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Push Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Marketing Preferences
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-red-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-gray-400">Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

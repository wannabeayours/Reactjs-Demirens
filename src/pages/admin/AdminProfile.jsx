import React from 'react'
import AdminHeader from './components/AdminHeader'

// Shad CN
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function AdminProfile() {
  return (
    <>
      <div>
        <AdminHeader />

        <main id="MainPage" className="p-4 space-y-6">
          <h1 className="text-2xl font-semibold">Admin Profile</h1>

          {/* Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side: Menu */}
            <div className="w-full lg:w-1/3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Profile Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">Menu Here:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Profile</li>
                    <li>Role & Access</li>
                    <li>Security Settings</li>
                    <li>Notifications & Preferences</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">Use the menu to navigate admin settings.</p>
                </CardFooter>
              </Card>
            </div>

            {/* Right Side: Profile Info */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Admin Info Card */}
              <Card>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6">
                  <img
                    src="/adminProfile.jpg"
                    alt="Admin Profile"
                    className="w-32 h-32 rounded-full object-cover border"
                  />
                  <div>
                    <h2 className="text-lg font-medium">Junko Da Egg</h2>
                    <p className="text-sm text-muted-foreground">Administrator</p>
                    <p className="text-sm text-muted-foreground">admin@example.com</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info / Action Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>Details about this admin account.</CardDescription>
                  <CardAction>
                    {/* You can add buttons or action icons here */}
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>✔️ Last Login: July 31, 2025</p>
                  <p>✔️ Account Created: Jan 1, 2024</p>
                  <p>✔️ Permissions: Full Access</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">Review admin access logs in the system tab.</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>

  )
}

export default AdminProfile
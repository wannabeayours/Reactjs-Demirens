import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import Changepass from './modals/Changepass'
import Authentication from './modals/Authentication'
import { Settings } from 'lucide-react'

function CustomerSettings() {

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
                <div className="flex items-center justify-between w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-[#113f67] to-[#226597] rounded-xl shadow-lg">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-[#113f67]">Password & Security</h1>
                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Manage your account safety</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-1"></div>
                    <CardContent className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-[#113f67] mb-1">Account Protection</h2>
                            <p className="text-sm text-gray-600">Update your password and 2-step authentication</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-[#113f67] mb-2">Change Password</h3>
                                <Changepass />
                            </div>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-[#113f67] mb-2">Two-Factor Authentication</h3>
                                <Authentication />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>


    )
}

export default CustomerSettings
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import React from 'react'
import Changepass from './modals/Changepass'
import Authentication from './modals/Authentication'
import { Settings } from 'lucide-react'

function CustomerSettings() {

    return (

        <div className="flex items-center justify-center">
            <div className="max-w-4xl w-full flex items-center justify-center mt-20">


                <Card className="p-4 bg-[#34699A] border-none shadow-lg ">

                    <h3 className="mb-4 text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Password and Security
                    </h3>

                    <div className="flex gap-4">
                        <Changepass />
                        <Authentication />
                    </div>
                </Card>
            </div>

        </div>


    )
}

export default CustomerSettings
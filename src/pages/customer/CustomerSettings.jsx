import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import React from 'react'
import Changepass from './modals/Changepass'
import Authentication from './modals/Authentication'

function CustomerSettings() {

    return (

        <div className="flex items-center justify-center flex-col ">
            <div className="w-full max-w-4xl mt-20">
                <h3 className=" mb-4 text-lg font-bold">Password and Security</h3>

                <Card className="p-4">
                    <Changepass />
                    <Authentication />
                </Card>
            </div>

        </div>


    )
}

export default CustomerSettings
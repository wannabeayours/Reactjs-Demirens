import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import React from 'react'

function Authentication() {
    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline">
                    Two-Factor Authentication
                </Button>
            </DialogTrigger>
            <DialogContent>
                <div
                    className='text-lg font-bold flex justify-center'>
                    Two-Factor Authentication
                </div>
                <div className="p-2">
                    Enable 2FA
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default Authentication
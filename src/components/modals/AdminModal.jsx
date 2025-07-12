import React from "react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


function AdminModal({isVisible, onClose, modalTitle, children}) {

    if (!isVisible) return null;
    
    const closeModal = (e) => {
        if (e.target.id === "wrapper") onClose();
    }

    return (
        <>
            <div 
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center" 
            id="wrapper" onClick={closeModal}>
                <div className="w-[600px]">
                    <Card className="">
                        <CardHeader>
                            <CardTitle>{modalTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid text-3xl text-white">
                            <div>{children}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </>
    )

}

export default AdminModal;
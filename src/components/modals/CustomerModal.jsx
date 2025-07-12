import React from "react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


function CustomerModal({ isVisible, onClose, modalTitle, children }) {

    if (!isVisible) return null;

    const closeModal = (e) => {
        if (e.target.id === "wrapper") onClose();
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
                id="wrapper"
                onClick={closeModal}
            >
                <div className="w-[600px] h-full flex items-center justify-center">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>{modalTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-white">
                            <div>{children}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>


        </>
    )

}

export default CustomerModal;
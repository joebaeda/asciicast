"use client";

import { useState } from "react";

interface ShareCastProps {
    castMentions: number;
    tokenId: number;
}

const ShareCastButton = ({ castMentions, tokenId }: ShareCastProps) => {
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const sendCast = async () => {

        setIsSending(true);

        try {
            
            const castText = "Just in: One Masterpieces of Scratches has been minted on the  network by ";
            const siteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${tokenId}`;

            const message = { castText, siteUrl, castMentions };

            const response = await fetch("/api/share-cast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message),
            });

            if (response.ok) {
                setIsSuccess(true)
            } else {
                setIsSuccess(false)
                throw new Error("Failed to send cast.")
            }

            await response.json();
        } catch (error: unknown) {
            console.error("Error sending cast:", (error as Error).message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <button
            disabled={isSending || isSuccess}
            onClick={sendCast}
            className="w-full py-3 rounded-2xl bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-700 transition"
        >
           {isSending ? "Waiting..." : isSuccess ? "Shared! 🎉" : "Share"}
        </button>
    );
};

export default ShareCastButton;

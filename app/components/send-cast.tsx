"use client";

import { useState } from "react";

interface SendCastProps {
    castText: string;
    castMentions: number;
    getIPFSHash: () => Promise<string>;
}

const SendCastButton = ({ castText, castMentions, getIPFSHash }: SendCastProps) => {
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [noIpfs, setNoIpfs] = useState(false);

    const sendCast = async () => {

        setIsSending(true);

        try {
            const ipfsHash = await getIPFSHash();

            if (!ipfsHash) {
               setNoIpfs(true)
            }
            
            const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

            const message = { castText, castMentions, imageUrl };

            const response = await fetch("/api/send-cast", {
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
            disabled={noIpfs || isSending || isSuccess}
            onClick={sendCast}
            className="w-full py-3 rounded-2xl bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-700 transition"
        >
           {isSending ? "Casting..." : isSuccess ? "Casted! 🎉" : "Cast"}
        </button>
    );
};

export default SendCastButton;

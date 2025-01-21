import { NextRequest, NextResponse } from "next/server";
import {
    Message,
    NobleEd25519Signer,
    FarcasterNetwork,
    UserDataType,
    makeUserDataAdd,
    HubResult,
} from "@farcaster/core";
import { hexToBytes } from "@noble/hashes/utils";

const appFid = process.env.APP_FID;
const account = process.env.APP_PRIVATE_KEY || "";

export async function POST(request: NextRequest) {
    try {
        const { name, fname, bio, pfp } = await request.json();

        if (!name && !fname && !bio && !pfp) {
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }

        // Set up the signer
        const privateKeyBytes = hexToBytes(account);
        const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

        const dataOptions = {
            fid: Number(appFid),
            network: FarcasterNetwork.MAINNET,
        };

        const updateUserDataMessages: Message[] = [];

        // Helper function to add messages
        const addMessage = async (type: UserDataType, value: string) => {
            const result: HubResult<Message> = await makeUserDataAdd(
                { type, value },
                dataOptions,
                ed25519Signer
            );
            if (result.isOk()) {
                updateUserDataMessages.push(result.value); // Push the extracted message
            } else {
                console.error(`Failed to create message for ${type}:`, result.error);
            }
        };

        // Add user data messages
        if (name) await addMessage(UserDataType.DISPLAY, name);
        if (fname) await addMessage(UserDataType.USERNAME, fname);
        if (bio) await addMessage(UserDataType.BIO, bio);
        if (pfp) await addMessage(UserDataType.PFP, pfp);


        // Encode all messages
        const encodedMessages = updateUserDataMessages.map((message) =>
            Message.encode(message).finish()
        );

        // Submit messages
        const submitPromises = encodedMessages.map((messageBytes) =>
            fetch("https://hub.pinata.cloud/v1/submitMessage", {
                method: "POST",
                headers: { "Content-Type": "application/octet-stream" },
                body: Buffer.from(messageBytes),
            })
        );

        // Wait for all submissions
        const responses = await Promise.all(submitPromises);

        // Check for errors
        for (const response of responses) {
            if (!response.ok) {
                console.error(
                    "Failed to submit profile:",
                    response.status,
                    await response.text()
                );
                return NextResponse.json({ error: "Hub submission failed" }, { status: 500 });
            }
        }
        return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Error submitting profile:", (error as Error).message);
        return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
    }
}

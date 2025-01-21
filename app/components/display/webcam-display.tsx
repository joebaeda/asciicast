"use client"

import { Camera, CameraOff, Download, Eye, EyeOff } from "lucide-react";

import { useAsciiFrame } from "@/context/AsciiFrameProvider";
import { useWebcam } from "@/hooks/use-webcam";
import { useAscii } from "@/hooks/use-ascii";
import { cn } from "@/lib/utils";
import { DisplayActionButton } from "../../components/display/display-action-button";
import {
  DisplayActionsContainer,
  DisplayCanvas,
  DisplayCanvasContainer,
  DisplayContainer,
  DisplayFooterContainer,
  DisplayInset,
} from "../../components/display/display-containers";
import { DisplayCopyButton } from "../../components/display/display-copy-button";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { BaseError, useAccount, useChainId, useConnect, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { asciiCastAbi, asciiCastAddress } from "@/lib/contract";
import { parseEther } from "viem";
import { base } from "wagmi/chains";
import { wagmiConfig } from "@/lib/wagmiConfig";

interface ArtistProps {
  fname: string
  fid: number
  url: string
  token: string
}

export function WebcamDisplay({ fname, fid, url, token }: ArtistProps) {
  const { config } = useAsciiFrame();
  const {
    isLoading: isWebcamLoading,
    isActive: isWebcamActive,
    canvasRef: webcamCanvasRef,
    start: _startWebcam,
    stop: _stopWebcam,
  } = useWebcam();
  const {
    isActive: isAsciiActive,
    canvasRef: asciiCanvasRef,
    asciiColor: animationColor,
    asciiPreset: animationPreset,
    show: showAscii,
    hide: hideAscii,
    copy: copyAscii,
    download: freeDownload,
    saveImageHash: imageHash,
    saveAnimationHash: animationHash
  } = useAscii(webcamCanvasRef.current, {
    ...config,
    animate: true,
  });

  const [showError, setShowError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const chainId = useChainId();
  const { isConnected } = useAccount()
  const { connect } = useConnect();
  const { data: hash, error, isPending, writeContract } = useWriteContract()

  const { data: tokenId } = useReadContract({
    address: asciiCastAddress as `0x${string}`,
    abi: asciiCastAbi,
    functionName: "totalSupply",
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (isConfirmed) {
      // Notify user
      async function notifyUser() {
        try {
          await fetch('/api/send-notify', {
            method: 'POST',
            mode: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: 891914,
              notificationDetails: { url, token },
              title: `New ASCII Art by @${fname}`,
              body: "One Awesome ASCII Art has been minted on the @base Network.",
              targetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${Number(tokenId) + 1}`,
            }),
          });
        } catch (error) {
          console.error("Notification error:", error);
        }
      };
      notifyUser();
    }
  })

  useEffect(() => {
    if (error) {
      setShowError(true)
    }

  }, [error])

  function startWebcam() {
    _startWebcam();
    showAscii();
  }

  function stopWebcam() {
    _stopWebcam();
    hideAscii();
  }

  function toggleAscii() {
    if (isAsciiActive) {
      hideAscii();
    } else {
      if (webcamCanvasRef.current) showAscii();
    }
  }

  const handleMint = async () => {
    setIsGenerating(true)
    const ipfsImageHash = await imageHash()
    const ipfsAnimationHash = await animationHash()
    if (ipfsImageHash && ipfsAnimationHash) {

      setIsGenerating(false)

      writeContract({
        abi: asciiCastAbi,
        chainId: base.id,
        address: asciiCastAddress as `0x${string}`,
        functionName: "mint",
        value: parseEther("0.003"),
        args: [`ipfs://${ipfsImageHash}`, `ipfs://${ipfsAnimationHash}`, `@${fname}`, animationColor, animationPreset, String(fid)],
      });

    } else {
      console.error("Failed to mint animation to base");
      setIsGenerating(false)
    }
  };

  return (
    <DisplayContainer>
      <DisplayActionsContainer>
        <DisplayActionButton
          onClick={isWebcamActive ? stopWebcam : startWebcam}
          icon={isWebcamActive ? CameraOff : Camera}
          tooltip={isWebcamActive ? "Stop webcam" : "Start webcam"}
          loading={isWebcamLoading}
        />
        <DisplayActionButton
          onClick={toggleAscii}
          icon={!isWebcamActive || !isAsciiActive ? Eye : EyeOff}
          tooltip={
            !isWebcamActive || !isAsciiActive ? "Show ASCII" : "Hide ASCII"
          }
          disabled={!isWebcamActive}
        />
        <DisplayCopyButton
          onCopy={copyAscii}
          tooltip="Copy ASCII"
          disabled={!isWebcamActive || !isAsciiActive}
        />
        <DisplayActionButton
          onClick={freeDownload}
          icon={Download}
          tooltip="Download ASCII"
          disabled={!isWebcamActive || !isAsciiActive}
        />
        {isConnected ? (
          <Button
            onClick={handleMint}
            disabled={!isConnected || !isWebcamActive || !isAsciiActive || chainId !== base.id || isPending || isConfirming || isConfirmed || isGenerating}
            className="absolute right-12 px-4 py-2 rounded-full"
          >
            {isGenerating ? "Generating..." : isPending
              ? "Confirming..."
              : isConfirming
                ? "Waiting..."
                : isConfirmed ? "Minted! 🎉" : "Mint to Base"}
          </Button>
        ) : (
          <Button
            onClick={() => connect({ connector: wagmiConfig.connectors[0] })}
            className="absolute right-12 px-4 py-2 rounded-full"
          >
            Connect Wallet
          </Button>
        )}
      </DisplayActionsContainer>

      <DisplayCanvasContainer>
        <DisplayInset className={cn({ hidden: isWebcamActive })}>
          <Button
            variant="secondary"
            onClick={startWebcam}
            disabled={isWebcamLoading}
          >
            <Camera className="size-4 text-muted-foreground" />
            Start
          </Button>
        </DisplayInset>

        <div className="absolute inset-0 m-2 overflow-auto">
          <DisplayCanvas
            ref={webcamCanvasRef}
            className={cn({ hidden: isAsciiActive })}
          />
          <DisplayCanvas
            ref={asciiCanvasRef}
            className={cn({ hidden: !isAsciiActive })}
          />
        </div>
      </DisplayCanvasContainer>
      <DisplayFooterContainer>
        <div className="flex justify-center items-center">
          <span className="text-center py-2">Build with <span className="font-extrabold text-red-800">❤</span> by <a
            href="https://warpcast.com/joebaeda"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-500"
          >Joe</a></span>
        </div>
      </DisplayFooterContainer>

      {/* Transaction Error */}
      {showError && error && (
        <div className="fixed p-4 inset-0 items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="w-full p-4 flex flex-col max-w-[384px] mx-auto bg-red-500 space-y-4">
            <p className="text-center text-white">Error: {(error as BaseError).shortMessage || error.message}</p>
            <Button
              onClick={() => setShowError(false)}
              variant="secondary"
              disabled={isPending}
            >
              Close
            </Button>
          </div>
        </div>
      )}

    </DisplayContainer>
  );
}

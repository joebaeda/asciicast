"use client"

import { Camera, CameraOff, Eye, EyeOff } from "lucide-react";

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
import { useCallback, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";
import sdk from "@farcaster/frame-sdk";

interface WebcamProps {
  isAsciiBalanceLow: boolean
}

export function WebcamDisplay({ isAsciiBalanceLow }: WebcamProps) {
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
    show: showAscii,
    hide: hideAscii,
    copy: copyAscii,
    generateAnimation: generateVideo
  } = useAscii(webcamCanvasRef.current, {
    ...config,
    animate: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { isConnected } = useAccount()
  const { connect } = useConnect();

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

  const buyAsciiToken = useCallback(() => {
    sdk.actions.openUrl('https://clank.fun/t/0x0A5053E62B6a452300D18AeEf495C89DDF4C7B05')
  }, [])

  const handleSaveAsVideo = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Generate the video Blob using the generateVideo function
      const videoBlob = await generateVideo();
      setIsGenerating(false);

      // Check if the generated Blob is valid
      if (!videoBlob) {
        throw new Error("Video Blob is empty or undefined.");
      }

      // Create a URL for the Blob
      const videoUrl = URL.createObjectURL(videoBlob);

      // Save to localStorage
      localStorage.setItem("savedVideoUrl", videoUrl);
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to save As Video:", error);
      throw error; // Rethrow the error for higher-level handling
    }
  }, [generateVideo]);

  return (
    <DisplayContainer>
      <DisplayActionsContainer>
        <DisplayActionButton
          onClick={isWebcamActive ? stopWebcam : startWebcam}
          icon={isWebcamActive ? CameraOff : Camera}
          tooltip={isWebcamActive ? "Stop webcam" : "Start webcam"}
          loading={isWebcamLoading}
          disabled={!isConnected || isAsciiBalanceLow}
        />
        <DisplayActionButton
          onClick={toggleAscii}
          icon={!isWebcamActive || !isAsciiActive ? Eye : EyeOff}
          tooltip={
            !isWebcamActive || !isAsciiActive ? "Show ASCII" : "Hide ASCII"
          }
          disabled={!isConnected || !isWebcamActive || isGenerating || isAsciiBalanceLow}
        />
        <DisplayCopyButton
          onCopy={copyAscii}
          tooltip="Copy ASCII"
          disabled={!isConnected || !isWebcamActive || !isAsciiActive || isGenerating || isAsciiBalanceLow}
        />
        {isConnected ? (
          <Button
            onClick={handleSaveAsVideo}
            disabled={!isConnected || !isWebcamActive || !isAsciiActive || isGenerating || isAsciiBalanceLow}
            className="absolute right-12 px-4 py-2 rounded-full"
          >
            {isGenerating ? "Generating..." : isSuccess ? "Saved! 🎉" : "Generate"}
          </Button>
        ) : (
          <Button
            onClick={() => connect({ connector: wagmiConfig.connectors[0] })}
            className="absolute right-12 px-4 py-2 rounded-full"
          >
            Connect
          </Button>
        )}
      </DisplayActionsContainer>

      <DisplayCanvasContainer>
        <DisplayInset className={cn({ hidden: isWebcamActive })}>
          <Button
            variant="secondary"
            onClick={startWebcam}
            disabled={!isConnected || isWebcamLoading || isAsciiBalanceLow}
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
          >Joe bae</a></span>
        </div>
      </DisplayFooterContainer>

      {/* Download Video */}
      {isSuccess && (
        <div className="fixed p-4 flex flex-col space-y-4 inset-0 items-center justify-center z-50 bg-[#17101f]">
            <video
              className="w-full rounded-xl max-w-[360px] mx-auto"
              muted
              playsInline
              loop
              preload="auto"
              controls
              onContextMenu={(e) => e.preventDefault()}
            >
              <source
                src={localStorage.getItem("savedVideoUrl") as string}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
        </div>
      )}

      {/* Ascii Balance is Low */}
      {isConnected && isAsciiBalanceLow && (
        <div className="fixed flex p-4 inset-0 items-center justify-center z-50 bg-gray-900 bg-opacity-65">
          <div className="w-full h-full items-center justify-center rounded-lg p-4 flex flex-col max-h-[360px] max-w-[360px] mx-auto bg-[#151018] space-y-4">
            <p className="text-center text-white">It looks like you don&apos;t have enough $ASCII in your wallet and you need to have at least 300K $ASCII to be able to use the features on this frame.</p>
            <Button
              onClick={buyAsciiToken}
              variant="secondary"
              className="bg-pink-900 hover:bg-pink-950"
            >
              Buy on Clank.Fun
            </Button>
          </div>
        </div>
      )}

    </DisplayContainer>
  );
}

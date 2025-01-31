"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Upload, X } from "lucide-react";

import { useAsciiFrame } from "@/context/AsciiFrameProvider";
import { useUpload } from "@/hooks/use-upload";
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
import { useAccount, useConnect } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";
import sdk from "@farcaster/frame-sdk";

interface UploadProps {
  isAsciiBalanceLow: boolean
}

export function UploadDisplay({ isAsciiBalanceLow }: UploadProps) {
  const { config } = useAsciiFrame();
  const {
    isUploading,
    hasUpload,
    onlyVideo,
    setOnlyVideo,
    type,
    inputRef: uploadInputRef,
    canvasRef: uploadCanvasRef,
    upload,
    clear,
  } = useUpload();
  const {
    isActive: isAsciiActive,
    canvasRef: asciiCanvasRef,
    show: showAscii,
    hide: hideAscii,
    copy: copyAscii,
    generateAnimation: generateVideo
  } = useAscii(uploadCanvasRef.current, {
    ...config,
    animate: type === "video",
  });
  const initialised = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { isConnected } = useAccount()
  const { connect } = useConnect();

  useEffect(() => {
    if (hasUpload) {
      if (!initialised.current) {
        showAscii();
        initialised.current = true;
      }
    } else {
      initialised.current = false;
    }
  }, [hasUpload, showAscii]);

  function toggleAscii() {
    if (isAsciiActive) {
      hideAscii();
    } else {
      if (uploadCanvasRef.current) showAscii();
    }
  }

  const buyAsciiToken = useCallback(() => {
    sdk.actions.openUrl('https://clank.fun/t/0x0A5053E62B6a452300D18AeEf495C89DDF4C7B05')
  }, [])

  // Open the saved video URL using sdk.actions.openUrl
  useEffect(() => {
    if (isSuccess) {
      const savedVideoUrl = localStorage.getItem("savedVideoUrl");
      sdk.actions.openUrl(savedVideoUrl as string);
      // Optionally clear the stored URL after opening
      localStorage.removeItem("savedVideoUrl");
    }
  }, [isSuccess]);

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
          onClick={hasUpload ? clear : () => uploadInputRef.current?.click()}
          icon={hasUpload ? X : Upload}
          tooltip={hasUpload ? "Remove Upload" : "Upload Media"}
          loading={isUploading}
          disabled={!isConnected || isAsciiBalanceLow}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              upload(file);
              e.target.value = "";
            }
          }}
        />
        <DisplayActionButton
          onClick={toggleAscii}
          icon={!hasUpload || !isAsciiActive ? Eye : EyeOff}
          tooltip={!hasUpload || !isAsciiActive ? "Show ASCII" : "Hide ASCII"}
          disabled={!isConnected || !hasUpload || isGenerating || isAsciiBalanceLow}
        />
        <DisplayCopyButton
          onCopy={copyAscii}
          tooltip="Copy ASCII"
          disabled={!isConnected || !hasUpload || !isAsciiActive || isGenerating || isAsciiBalanceLow}
        />
        {isConnected ? (
          <Button
            onClick={handleSaveAsVideo}
            disabled={!isConnected || !hasUpload || !isAsciiActive || isGenerating || isAsciiBalanceLow}
            className="absolute right-12 px-4 py-2 rounded-full"
          >
            {isGenerating ? "Generating..." : isSuccess ? "Saved! 🎉" : "Download"}
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
        <DisplayInset className={cn({ hidden: hasUpload })}>
          <Button
            variant="secondary"
            onClick={() => uploadInputRef.current?.click()}
            disabled={!isConnected || isUploading || isAsciiBalanceLow}
          >
            <Upload className="size-4 text-muted-foreground" />
            Upload
          </Button>
        </DisplayInset>

        <div className="absolute inset-0 m-2 overflow-auto">
          <DisplayCanvas
            ref={uploadCanvasRef}
            className={cn("w-full", { hidden: isAsciiActive })}
          />
          <DisplayCanvas
            ref={asciiCanvasRef}
            className={cn("w-full", { hidden: !isAsciiActive })}
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

      {/* Not Video */}
      {onlyVideo && (
        <div className="fixed flex p-4 inset-0 items-center justify-center z-50 bg-gray-900 bg-opacity-65">
          <div className="w-full h-full items-center justify-center rounded-lg p-4 flex flex-col max-h-[360px] max-w-[360px] mx-auto bg-[#250f31] space-y-4">
            <p className="text-center text-white">Sorry, ASCII Art Animation Frame only supports Video to be converted into Animation.</p>
            <Button
              onClick={() => setOnlyVideo(false)}
              variant="secondary"
            >
              Close
            </Button>
          </div>
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
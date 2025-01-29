"use client";

import { Sidebar } from "./components/ui/sidebar";
import { UploadDisplay } from "./components/display/upload-display";
import { WebcamDisplay } from "./components/display/webcam-display";
import { useAsciiFrame } from "@/context/AsciiFrameProvider";
import { SidebarContent, SidebarGroup, SidebarRail } from "./components/ui/sidebar";
import { Controls } from "./components/controls/controls";
import { useEffect } from "react";

// Farcaster
import { useViewer } from "./providers/FrameContextProvider";
import sdk from "@farcaster/frame-sdk";
import { useAccount, useReadContract } from "wagmi";
import { asciiCastAbi } from "@/lib/contract";
import { base } from "wagmi/chains";
import { parseEther } from "viem";

export default function Page() {
  const { display } = useAsciiFrame();
  const { address } = useAccount();
  
  // Farcaster
  const { username, displayName, pfpUrl, added, safeAreaInsets } = useViewer();

  const { data: asciiBalance } = useReadContract(
    address
      ? {
          address: '0x0A5053E62B6a452300D18AeEf495C89DDF4C7B05',
          abi: asciiCastAbi,
          chainId: base.id,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }
      : undefined
  );

  const asciiBalanceSafe = asciiBalance ?? BigInt(0);
  const isAsciiBalanceLow = asciiBalanceSafe < parseEther('480000000');

  useEffect(() => {
    if (added === false) {
      sdk.actions.addFrame();
    }
  }, [added]);

  return (
    <div
      style={
        typeof safeAreaInsets === "undefined"
          ? undefined
          : { paddingBottom: safeAreaInsets.bottom * 2.25 }
      }
    >
      {display === "webcam" ? (
        <WebcamDisplay isAsciiBalanceLow={!!isAsciiBalanceLow} />
      ) : (
        <UploadDisplay isAsciiBalanceLow={!!isAsciiBalanceLow} />
      )}
      <Sidebar side="right" variant="sidebar" collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <Controls
              name={displayName as string}
              fname={username as string}
              pfp={pfpUrl as string}
            />
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}

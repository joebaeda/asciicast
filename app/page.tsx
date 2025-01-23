"use client"

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

export default function Page() {
  const { display } = useAsciiFrame();
  // Farcaster
  const { fid, username, displayName, pfpUrl, added, url, token, safeAreaInsets } = useViewer();

  useEffect(() => {
    if (!added) {
      sdk.actions.addFrame()
    }
  }, [added]);

  return (
    <div style={typeof safeAreaInsets === 'undefined'
      ? undefined
      : { paddingBottom: safeAreaInsets.bottom * 2.25 }}>
      {display === "webcam" ? <WebcamDisplay fname={username as string} fid={fid} url={url as string} token={token as string} /> : <UploadDisplay fname={username as string} fid={fid} url={url as string} token={token as string} />}
      <Sidebar side="right" variant="sidebar" collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <Controls name={displayName as string} fname={username as string} pfp={pfpUrl as string} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}

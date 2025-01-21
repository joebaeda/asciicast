"use client"

import { Sidebar } from "./components/ui/sidebar";
import { UploadDisplay } from "./components/display/upload-display";
import { WebcamDisplay } from "./components/display/webcam-display";
import { useAsciiFrame } from "@/context/AsciiFrameProvider";
import { SidebarContent, SidebarGroup, SidebarRail } from "./components/ui/sidebar";
import { Controls } from "./components/controls/controls";
import { useEffect, useState } from "react";

// Farcaster
import { useViewer } from "./providers/FrameContextProvider";
import sdk from "@farcaster/frame-sdk";

interface ProfileProps {
  name: string;
  fname: string;
  bio: string;
  pfp: string;
}

export default function Page() {
  const { display } = useAsciiFrame();
  // Farcaster
  const { fid, added, url, token, safeAreaInsets } = useViewer();

  const [profile, setProfile] = useState<ProfileProps>({
    name: '',
    fname: '',
    bio: '',
    pfp: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        if (added) {
          const res = await fetch(`/api/profiles/${String(fid)}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch user data: ${res.statusText}`);
          }
          const userData: ProfileProps = await res.json();
          setProfile(userData); // Populate profile state
        } else {
          sdk.actions.addFrame()
        }

      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    }
    fetchData();
  }, [added, fid]);

  return (
    <div style={typeof safeAreaInsets === 'undefined'
      ? undefined
      : { paddingBottom: safeAreaInsets.bottom * 2.25 }}>
      {display === "webcam" ? <WebcamDisplay fname={profile.fname} fid={fid} url={url as string} token={token as string} /> : <UploadDisplay fname={profile.fname} fid={fid} url={url as string} token={token as string} />}
      <Sidebar side="right" variant="sidebar" collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <Controls name={profile.name} fname={profile.fname} bio={profile.bio} pfp={profile.pfp} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}

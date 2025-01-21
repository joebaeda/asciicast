import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AsciiFrameProvider } from "@/context/AsciiFrameProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import Provider from "./providers/Provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://asciicast.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${baseUrl}/og-image.jpg`,
  button: {
    title: "Mint ASCII Art",
    action: {
      type: "launch_frame",
      name: "Ascii Art Animation",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/splash.svg`,
      splashBackgroundColor: "#17101f",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ascii Cast | ASCII Art Animation",
    description: "Convert webcam feeds, images, or videos into ASCII art and animation directly in your Farcaster client",
    openGraph: {
      title: "Ascii Cast | Create Art ASCII Animation",
      description: "Convert webcam feeds, images, or videos into ASCII art and animation directly in your Farcaster client",
      url: baseUrl,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 600,
          alt: 'Mint your ASCII Art Animation',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Ascii Cast | ASCII Art Animation",
      description: "Convert webcam feeds, images, or videos into ASCII art and animation directly in your Farcaster client",
      images: [`${baseUrl}/og-image.jpg`],
    },
    icons: {
      icon: '/favicon.ico',
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased`}
      >
        <Provider>
          <AsciiFrameProvider>
            <TooltipProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </TooltipProvider>
          </AsciiFrameProvider>
        </Provider>
      </body>
    </html>
  );
}

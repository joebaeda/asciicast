"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { AsciiConfig, generateAsciiText, renderAscii } from "@/lib/ascii";

export function useAscii(
  source: HTMLCanvasElement | null,
  config: AsciiConfig,
) {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  const render = useCallback(() => {
    const target = canvasRef.current;
    if (!source || !target) return;

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }

    renderAscii(source, target, config);

    if (config.animate) {
      animationId.current = requestAnimationFrame(render);
    }

  }, [source, config]);

  function show() {
    setIsActive(true);
    render();
  }

  function hide() {
    setIsActive(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }
  }

  async function copy() {
    if (!source) return false;

    const ascii = await generateAsciiText(source, config);
    try {
      await navigator.clipboard.writeText(ascii);
      return true;
    } catch {
      return false;
    }
  }

  async function generateAnimation(): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error("Canvas not found"));
        return;
      }

      // Capture the stream from the canvas at the specified FPS
      const stream = canvas.captureStream();
      const recordedBlobs: Blob[] = [];

      // Create the MediaRecorder to capture the video stream
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedBlobs.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedBlobs, { type: 'video/mp4' });
        resolve(videoBlob);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('Error while recording video: ' + event.error));
      };

      // Start recording
      mediaRecorder.start();

      // Define a function to render frames at the desired FPS
      const renderFrames = () => {
        if (mediaRecorder.state === "recording") {
          // The frame is captured directly by the media recorder

          // Use requestAnimationFrame to continue capturing frames at the correct FPS
          const interval = 1000 / 60;
          setTimeout(() => {
            requestAnimationFrame(renderFrames);
          }, interval);
        }
      };

      // Start rendering frames after the media recorder is initialized
      renderFrames();

      // Stop recording after a certain duration (e.g., 15 seconds or longer)
      const recordDuration = 15000; // Adjust the time as needed
      setTimeout(() => {
        mediaRecorder.stop();
      }, recordDuration);
    });
  }

  // Reset animation on config change
  useEffect(() => {
    if (isActive) {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
        animationId.current = null;
      }
      render();
    }
  }, [config, isActive, render]);

  // Resize canvas with container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const observer = new ResizeObserver(() => {
      if (isActive) render();
    });

    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [isActive, render]);

  // Cleanup
  useEffect(() => {
    return hide;
  }, []);

  return { isActive, canvasRef, show, hide, copy, generateAnimation };
}

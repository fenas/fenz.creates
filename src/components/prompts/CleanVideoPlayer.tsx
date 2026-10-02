"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnailUrl, isVideoVertical } from "@/lib/youtube";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface CleanVideoPlayerProps {
  url: string;
  title?: string;
  thumbnailUrl?: string;
  aspectRatio?: string;
  autoPlay?: boolean;
}

export function CleanVideoPlayer({
  url,
  title = "Video prompt preview",
  thumbnailUrl,
  aspectRatio,
  autoPlay = false,
}: CleanVideoPlayerProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const containerId = `yt-clean-player-${rawId}`;
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  const videoId = extractYouTubeId(url);
  const isVertical = isVideoVertical(aspectRatio, url);

  const [origin, setOrigin] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const posterImage =
    thumbnailUrl ||
    (videoId ? getYouTubeThumbnailUrl(videoId, "maxres") || getYouTubeThumbnailUrl(videoId, "hq") : null);

  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1${
        origin ? `&origin=${encodeURIComponent(origin)}` : ""
      }${autoPlay ? "&autoplay=1" : ""}`
    : "";

  // Send postMessage command directly to YouTube iframe
  const postCommand = (func: string, args: any = "") => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      } catch {}
    }
  };

  // Listen to postMessage events from YouTube
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data && data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number" && !isDragging) {
            setCurrentTime(data.info.currentTime);
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (typeof data.info.playerState === "number") {
            // 1 = playing, 2 = paused, 0 = ended, 3 = buffering
            if (data.info.playerState === 1) {
              setIsPlaying(true);
              setHasStarted(true);
            } else if (data.info.playerState === 2 || data.info.playerState === 0) {
              setIsPlaying(false);
            }
          }
        }
        if (data && data.event === "onStateChange") {
          if (data.info === 1) {
            setIsPlaying(true);
            setHasStarted(true);
          } else if (data.info === 2 || data.info === 0) {
            setIsPlaying(false);
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isDragging]);

  // Load and bind YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    let pollTimer: NodeJS.Timeout | null = null;

    const tryInitPlayer = () => {
      if (!isMounted || !iframeRef.current) return false;
      if (window.YT && window.YT.Player) {
        try {
          if (!playerRef.current) {
            playerRef.current = new window.YT.Player(iframeRef.current, {
              events: {
                onReady: (event: any) => {
                  if (!isMounted) return;
                  const dur = event.target.getDuration?.();
                  if (dur && !isNaN(dur) && dur > 0) setDuration(dur);
                  if (autoPlay) {
                    event.target.playVideo?.();
                    setIsPlaying(true);
                    setHasStarted(true);
                  }
                },
                onStateChange: (event: any) => {
                  if (!isMounted) return;
                  if (event.data === 1) {
                    setIsPlaying(true);
                    setHasStarted(true);
                  } else if (event.data === 2 || event.data === 0) {
                    setIsPlaying(false);
                  }
                },
              },
            });
          }
          return true;
        } catch (err) {
          console.warn("YouTube player init:", err);
        }
      }
      return false;
    };

    if (typeof window !== "undefined") {
      if (!window.YT) {
        const existingScript = document.getElementById("yt-iframe-api-script");
        if (!existingScript) {
          const tag = document.createElement("script");
          tag.id = "yt-iframe-api-script";
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName("script")[0];
          firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        }
      }

      if (!tryInitPlayer()) {
        pollTimer = setInterval(() => {
          if (tryInitPlayer() && pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
        }, 250);

        setTimeout(() => {
          if (pollTimer) clearInterval(pollTimer);
        }, 8000);
      }
    }

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
      if (playerRef.current) {
        try {
          playerRef.current.destroy?.();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId, autoPlay, origin]);

  // Sync playback time for the scrubber / slider
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (!isDragging) {
        // First try YT instance if available
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          try {
            const current = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration?.() || duration;
            setCurrentTime(current);
            if (dur && dur !== duration && dur > 0) setDuration(dur);
            return;
          } catch {}
        }
        // Fallback: request time via postMessage
        postCommand("getCurrentTime");
        postCommand("getDuration");
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, isDragging, duration]);

  // Auto-hide controls when playing and inactive
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHasStarted(true);

    if (isPlaying) {
      if (playerRef.current?.pauseVideo) {
        try { playerRef.current.pauseVideo(); } catch {}
      }
      postCommand("pauseVideo");
      setIsPlaying(false);
    } else {
      if (playerRef.current?.playVideo) {
        try { playerRef.current.playVideo(); } catch {}
      }
      postCommand("playVideo");
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      if (playerRef.current?.unMute) {
        try { playerRef.current.unMute(); } catch {}
      }
      postCommand("unMute");
      setIsMuted(false);
    } else {
      if (playerRef.current?.mute) {
        try { playerRef.current.mute(); } catch {}
      }
      postCommand("mute");
      setIsMuted(true);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (playerRef.current?.seekTo) {
      try { playerRef.current.seekTo(val, true); } catch {}
    }
    postCommand("seekTo", [val, true]);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!videoId) {
    return (
      <div
        className={`relative rounded-[20px] overflow-hidden bg-black border border-[var(--border)] shadow-[var(--shadow-card)] flex items-center justify-center text-xs text-[var(--text-muted)] font-mono ${
          isVertical ? "aspect-[9/16] max-w-[340px] mx-auto" : "aspect-video w-full"
        }`}
      >
        Invalid Video URL
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center ${isVertical ? "py-1" : ""}`}>
      <div
        ref={videoContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={togglePlay}
        className={`group relative rounded-[20px] overflow-hidden bg-black border border-white/15 shadow-[var(--shadow-card)] select-none cursor-pointer flex flex-col justify-end transition-all duration-300 ${
          isFullscreen
            ? "rounded-none border-0 w-screen h-screen"
            : isVertical
            ? "aspect-[9/16] w-full max-w-[340px] sm:max-w-[380px] max-h-[580px] sm:max-h-[620px] mx-auto"
            : "aspect-video w-full"
        }`}
      >
        {/* 1. Clean YouTube Iframe Player (Channel info & YouTube overlays completely masked/cropped) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center pointer-events-none">
          <div
            className={`absolute pointer-events-none flex items-center justify-center ${
              isVertical
                ? "w-[145%] h-[142%] -top-[21%] -left-[22.5%]"
                : "w-[136%] h-[142%] -top-[21%] -left-[18%]"
            }`}
          >
            {embedSrc && (
              <iframe
                ref={iframeRef}
                id={containerId}
                src={embedSrc}
                title={title}
                className="w-full h-full pointer-events-none border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {/* 2. Poster Fallback before player is started */}
        {!hasStarted && posterImage && (
          <div className="absolute inset-0 z-10 overflow-hidden bg-black pointer-events-none">
            <Image
              src={posterImage}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              unoptimized={posterImage.startsWith("data:")}
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        {/* 3. Center Play/Pause Floating Icon Button */}
        {(!isPlaying || showControls) && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-all duration-300">
            <button
              type="button"
              onClick={togglePlay}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/80 hover:bg-[var(--accent)] text-white flex items-center justify-center border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 pointer-events-auto cursor-pointer ${
                !isPlaying ? "scale-100 opacity-100" : "scale-90 opacity-0 group-hover:opacity-80"
              }`}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 stroke-[2.2] fill-white" />
              ) : (
                <Play className="w-6 h-6 stroke-[2.2] fill-white ml-0.5" />
              )}
            </button>
          </div>
        )}

        {/* 4. Minimalist Custom Controls: Only Scroll/Slider Bar & Play/Pause Button */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative z-30 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-all duration-300 ${
            showControls || !isPlaying
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {/* Custom Timeline Progress Scrollbar / Slider */}
          <div className="relative w-full flex items-center mb-2 group/slider cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onChange={handleSliderChange}
              className="w-full h-1.5 sm:h-2 rounded-full appearance-none bg-white/20 cursor-pointer accent-[var(--accent)] relative z-10 transition-all focus:outline-none"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
          </div>

          {/* Bottom Bar: Play/Pause Button + Time + Mute/Fullscreen */}
          <div className="flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                )}
              </button>

              {/* Time Indicator */}
              <div className="text-[11px] sm:text-xs font-mono text-white/80 select-none">
                <span className="text-white font-medium">{formatTime(currentTime)}</span>
                <span className="mx-1 text-white/40">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Audio Volume Mute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

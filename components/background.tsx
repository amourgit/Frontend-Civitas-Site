
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const getFileExtension = (url: string): string =>
  url.split(".").pop()?.toLowerCase() || "";

const isVideo = (extension: string): boolean =>
  ["mp4", "webm", "ogg", "mov", "avi", "m4v"].includes(extension);

type BackgroundItem = { src: string; placeholder?: string };
type TransitionType = "fade" | "slideLeft" | "slideRight" | "zoomIn" | "zoomOut" | "dissolve";

const transitions: TransitionType[] = [
  "fade", "slideLeft", "slideRight", "zoomIn", "zoomOut", "dissolve",
];

const getTransitionClasses = (
  transition: TransitionType,
  isActive: boolean,
  isExiting: boolean
) => {
  const base =
    "absolute bg-background left-0 top-0 w-full h-full object-cover transition-all duration-1000 ease-in-out z-0";
  switch (transition) {
    case "fade":
      return cn(base, {
        "opacity-100": isActive && !isExiting,
        "opacity-0": !isActive || isExiting,
      });
    case "slideLeft":
      return cn(base, {
        "translate-x-0 opacity-100": isActive && !isExiting,
        "translate-x-full opacity-0": !isActive && !isExiting,
        "-translate-x-full opacity-0": isExiting,
      });
    case "slideRight":
      return cn(base, {
        "translate-x-0 opacity-100": isActive && !isExiting,
        "-translate-x-full opacity-0": !isActive && !isExiting,
        "translate-x-full opacity-0": isExiting,
      });
    case "zoomIn":
      return cn(base, {
        "scale-100 opacity-100": isActive && !isExiting,
        "scale-75 opacity-0": !isActive && !isExiting,
        "scale-125 opacity-0": isExiting,
      });
    case "zoomOut":
      return cn(base, {
        "scale-100 opacity-100": isActive && !isExiting,
        "scale-125 opacity-0": !isActive && !isExiting,
        "scale-75 opacity-0": isExiting,
      });
    case "dissolve":
      return cn(base, {
        "opacity-100 blur-0": isActive && !isExiting,
        "opacity-0 blur-sm": !isActive || isExiting,
      });
    default:
      return base;
  }
};

// ── VideoWithPlaceholder ──────────────────────────────────────────────
const VideoWithPlaceholder = ({
  src, className, placeholder, isActive, onVideoEnded,
}: {
  src: string;
  className?: string;
  placeholder?: string;
  isActive: boolean;
  onVideoEnded?: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !placeholder) {
      console.warn("No placeholder provided for video");
    }
  }, [placeholder]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoadedData = () => setVideoLoaded(true);
    const handleCanPlay = () => setVideoLoaded(true);
    const handleEnded = () => { if (isActive && onVideoEnded) onVideoEnded(); };
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.load();
    if (video.readyState >= 2) setVideoLoaded(true);
    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src, isActive, onVideoEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && videoLoaded) {
      if (isActive) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [videoLoaded, isActive]);

  return (
    <>
      {placeholder && (
        <img
          src={placeholder}
          loading="eager"
          alt="Background placeholder"
          className={cn(className, { invisible: videoLoaded })}
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      )}
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop={false}
        controls={false}
        preload="auto"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        className={cn(className, { invisible: !videoLoaded })}
      />
    </>
  );
};

// ── ImageMedia — composant dédié pour les images ──────────────────────
// ✅ useEffect est ici dans son propre composant → pas de violation de règle des hooks
const ImageMedia = ({
  item, className, isActive, onEnded,
}: {
  item: BackgroundItem;
  className: string;
  isActive: boolean;
  onEnded?: () => void;
}) => {
  // Ce useEffect est TOUJOURS appelé (pas de return conditionnel avant)
  useEffect(() => {
    if (!isActive || !onEnded) return;
    const timer = setTimeout(onEnded, 5000);
    return () => clearTimeout(timer);
  }, [isActive, onEnded]);

  return (
    <img
      loading="eager"
      src={item.src}
      alt="Background"
      className={className}
      style={{ objectFit: "cover", objectPosition: "center" }}
    />
  );
};

// ── BackgroundMedia ───────────────────────────────────────────────────
// ✅ Aucun hook ici — délègue à VideoWithPlaceholder ou ImageMedia
//    selon le type, sans jamais appeler de hook après un return conditionnel
const BackgroundMedia = ({
  item, className, isActive, onVideoEnded,
}: {
  item: BackgroundItem;
  className: string;
  isActive: boolean;
  onVideoEnded?: () => void;
}) => {
  const extension = getFileExtension(item.src);

  if (isVideo(extension)) {
    return (
      <VideoWithPlaceholder
        src={item.src}
        className={className}
        placeholder={item.placeholder}
        isActive={isActive}
        onVideoEnded={onVideoEnded}
      />
    );
  }

  // Image → composant dédié avec son propre useEffect
  return (
    <ImageMedia
      item={item}
      className={className}
      isActive={isActive}
      onEnded={onVideoEnded}
    />
  );
};

// ── Background principal ──────────────────────────────────────────────
export const Background = ({
  items,
  enableTransitions = true,
  imageDuration = 5000,
}: {
  items: BackgroundItem[];
  enableTransitions?: boolean;
  imageDuration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTransition, setCurrentTransition] = useState<TransitionType>("fade");

  const isSingleItem = items.length <= 1;

  const handleMediaEnded = () => {
    if (isSingleItem || !enableTransitions || isTransitioning) return;
    setIsTransitioning(true);
    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
    setCurrentTransition(randomTransition);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setNextIndex((nextIndex + 1) % items.length);
      setIsTransitioning(false);
    }, 1000);
  };

  useEffect(() => {
    setCurrentIndex(0);
    setNextIndex(items.length > 1 ? 1 : 0);
    setIsTransitioning(false);
  }, [items]);

  if (items.length === 0) {
    return <div className="absolute inset-0 bg-background z-0" />;
  }

  const baseClasses =
    "absolute bg-background left-0 top-0 w-full h-full object-cover z-0";

  if (isSingleItem) {
    return (
      <BackgroundMedia
        item={items[0]}
        className={baseClasses}
        isActive={true}
        onVideoEnded={handleMediaEnded}
      />
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 w-full h-full">
        <BackgroundMedia
          item={items[currentIndex]}
          className={getTransitionClasses(currentTransition, true, isTransitioning)}
          isActive={!isTransitioning}
          onVideoEnded={handleMediaEnded}
        />
        <BackgroundMedia
          item={items[nextIndex]}
          className={getTransitionClasses(currentTransition, isTransitioning, false)}
          isActive={isTransitioning}
          onVideoEnded={() => {}}
        />
      </div>
    </div>
  );
};

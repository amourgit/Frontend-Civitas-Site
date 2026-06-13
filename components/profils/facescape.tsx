import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Label } from "recharts";
import { Input } from "../ui/input";

export interface AvatarData {
  src: string;
  alt: string;
  fallback: string;
  name: string;
}

export interface FacescapeProps {
  avatars: AvatarData[];
  className?: string;
  colorDuration?: number;
  variant?: "circle" | "square" | "squircle";
}

const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };

const useBreakpoint = (breakpoint: "sm" | "md" | "lg" | "xl" | "2xl") => {
  const [isBelow, setIsBelow] = useState(false);
  useEffect(() => {
    const handleResize = () =>
      setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint]);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isBelow;
};

const FacescapeItem = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    src: string;
    alt: string;
    fallback: string;
    name: string;
    colorDuration?: number;
    autoAnimate?: boolean;
    variant?: "circle" | "square" | "squircle";
  }
>(
  (
    {
      className,
      src,
      alt,
      fallback,
      name,
      colorDuration = 3000,
      autoAnimate = false,
      variant = "squircle",
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isColorful, setIsColorful] = useState(false);
    const [isLarge, setIsLarge] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!autoAnimate || !itemRef.current) return;
      const observer = new IntersectionObserver(
        ([entry]) => setIsVisible(entry.isIntersecting),
        { threshold: 0.3 }
      );
      observer.observe(itemRef.current);
      return () => observer.disconnect();
    }, [autoAnimate]);

    useEffect(() => {
      let colorTimeout: NodeJS.Timeout | undefined;
      let sizeTimeout: NodeJS.Timeout | undefined;
      const active = autoAnimate ? isVisible : isHovered;
      if (active) {
        setIsColorful(true);
        setIsLarge(true);
      } else {
        if (isColorful)
          colorTimeout = setTimeout(() => setIsColorful(false), colorDuration);
        if (isLarge)
          sizeTimeout = setTimeout(() => setIsLarge(false), colorDuration);
      }
      return () => {
        if (colorTimeout) clearTimeout(colorTimeout);
        if (sizeTimeout) clearTimeout(sizeTimeout);
      };
    }, [isHovered, isVisible, autoAnimate, isColorful, isLarge, colorDuration]);

    const shapeClass = {
      circle: "rounded-full",
      square: "rounded-none",
      squircle: "rounded-md",
    }[variant];

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            ref={itemRef}
            className={cn(
              "relative cursor-pointer transition-all duration-500 ease-in-out transform-gpu origin-center",
              isLarge ? "scale-150 z-10" : "scale-100",
              isColorful
                ? "grayscale-0 contrast-100 brightness-100 opacity-100"
                : "grayscale contrast-50 brightness-75 opacity-60",
              className
            )}
            onMouseEnter={() => !autoAnimate && setIsHovered(true)}
            onMouseLeave={() => !autoAnimate && setIsHovered(false)}
            {...props}
          >
            <Avatar className={cn("h-8 w-8", shapeClass)}>
              <AvatarImage src={src} alt={alt} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4 rounded-lg shadow-lg bg-black/20 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src="https://github.com/Adityakishore0.png"
                alt="User avatar"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">Ahdeetai</h4>
              <p className="text-sm text-muted-foreground">
                Full Stack Developer
              </p>
            </div>
          </div>
          <div className="space-y-3 p-3 bg-muted/20 rounded-md">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">User Preferences</h4>
              <p className="text-xs text-muted-foreground">
                Customize your account settings below.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Label htmlFor="Name" className="w-24">
                  Name
                </Label>
                <Input
                  id="Name"
                  defaultValue="Ahdeetai"
                  className="flex-1 h-8"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Label htmlFor="theme" className="w-24">
                  Theme
                </Label>
                <Input
                  id="theme"
                  placeholder="Light / Dark"
                  defaultValue="Dark"
                  className="flex-1 h-8"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Label htmlFor="notifications" className="w-24">
                  Notifications
                </Label>
                <Input
                  id="notifications"
                  placeholder="Enabled / Disabled"
                  defaultValue="Enabled"
                  className="flex-1 h-8"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <Button variant="outline" className="flex-1 mr-2">
              Logout
            </Button>
            <Button variant="default" className="flex-1 ml-2">
              Save
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

FacescapeItem.displayName = "FacescapeItem";

const Facescape = React.forwardRef<HTMLDivElement, FacescapeProps>(
  (
    {
      avatars,
      className,
      colorDuration = 3000,
      variant = "squircle",
      ...props
    },
    ref
  ) => {
    const isMobileOrTablet = useBreakpoint("lg");
    return (
      <>
        {/* Header */}
        <div className="mb-2 pb-2 border-b border-white/50">
          <h2 className="text-white font-bold" style={{ fontSize: '1.3rem' }}>
            Connaissez-vous...?
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Aidez-nous à vous rapporcher de vos amis, fournisseurs, vendeurs, etc.
          </p>
        </div>

        <div
          ref={ref}
          className={cn(
            "flex overflow-x-auto flex-wrap justify-center gap-x-3 gap-y-4 w-full h-full scrollbar-hide mb-6",
            className
          )}
          {...props}
        >
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className="flex justify-center items-center w-10 h-10"
            >
              <FacescapeItem
                src={avatar.src}
                alt={avatar.alt}
                fallback={avatar.fallback}
                name={avatar.name}
                colorDuration={colorDuration}
                autoAnimate={isMobileOrTablet}
                variant={variant}
              />
            </div>
          ))}
        </div>
      </>
    );
  }
);

Facescape.displayName = "Facescape";

export { Facescape };

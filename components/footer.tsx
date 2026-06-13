import { GitHubLogoIcon, InstagramLogoIcon } from "@radix-ui/react-icons";
import { buttonVariants } from "./ui/button";
import XLogoIcon from "./icons/x";
import { socialLinks } from "@/lib/constants";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className="flex gap-6 items-center w-full justify-center">
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.instagram}>
        <InstagramLogoIcon className="size-6" />
      </Link>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.x}>
        <XLogoIcon className="size-6" />
      </Link>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.github}>
        <GitHubLogoIcon className="size-6" />
      </Link>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import BasePage from "@/components/layouts/base-page";
import ProfilsSideBarContent from "@/components/pages/module/compte/ProfilsSideBarContent";
import LayoutBig from "@/components/layouts/BaseContent";
import ProfilsListeMainContent from "@/profils/ProfilsListe/ProfilsListeMainContent";

export default function AppsHomePageContent() {
  const [isCompactTopBar, setIsCompactTopBar] = useState(false);

  const handleClick = ()=> {
    if(isCompactTopBar) setIsCompactTopBar(false), setIsCompactTopBar(true)
  }

  return (
    <LayoutBig
      isCompactTopBar={true}
      isLeftBarContent={false}
      isRightBarContent={false}
      children =  {
        <BasePage
          // className="bg-transparent backdrop-blur-lg"
          main={<ProfilsListeMainContent />}
          sidebar={<ProfilsSideBarContent />}
          rightPanel={null}
          sidebarWidth={320}
          sidebarMinWidth={280}
          sidebarMaxWidth={400}
          rightPanelWidth={0}
          rightPanelMinWidth={0}
          rightPanelMaxWidth={0}
          mainMinWidth={600}
        />
      } 
    />
  );
}
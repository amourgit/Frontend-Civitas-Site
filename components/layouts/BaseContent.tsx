// ============================================================
// components/layouts/BaseContent.tsx — Layout principal IAM
// Adapté de Next.js → React (react-router-dom)
// ============================================================

import React from 'react';
import LeftBarContent  from './LeftBarContent';
import TopBarContent   from './TopBarContent';

export default function BaseContent({
  children,
  isCompactTopBar,
  isLeftBarContent,
  isRightBarContent,
  showTimeCard = true,
}: {
  children: React.ReactNode;
  isCompactTopBar?: boolean;
  isLeftBarContent?: boolean;
  isRightBarContent?: boolean;
  showTimeCard?: boolean;
}) {
  return (
    <>
      {isCompactTopBar && (
        <TopBarContent className={isLeftBarContent ? 'pl-[40px]' : ''} />
      )}
      {isLeftBarContent && <LeftBarContent />}
      <div
        className="fixed top-0 left-0 w-full h-full bg-transparent overflow-hidden z-10"
        style={{
          paddingLeft: isLeftBarContent ? '40px' : '0px',
          paddingTop:  isCompactTopBar  ? '45px' : '0px',
        }}
      >
        {children}
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  isMartAdminRoute,
  MART_META_PIXEL_ID,
  trackMartPageView,
} from "@/lib/martMetaPixel";

export function MartMetaPixel() {
  const pathname = usePathname();
  const initialPathTrackedRef = useRef<string | null>(null);

  const isExcludedAdmin = !pathname || isMartAdminRoute(pathname);

  useEffect(() => {
    if (isExcludedAdmin || !pathname) return;

    // Initial page load fires PageView directly in the inline bootstrap script;
    // subsequent SPA route changes (/mart <-> /mart/p/[slug]) fire PageView here.
    if (initialPathTrackedRef.current === null) {
      initialPathTrackedRef.current = pathname;
      return;
    }

    if (initialPathTrackedRef.current !== pathname) {
      initialPathTrackedRef.current = pathname;
      trackMartPageView();
    }
  }, [pathname, isExcludedAdmin]);

  if (isExcludedAdmin) {
    return null;
  }

  return (
    <>
      <Script
        id="xeetrix-mart-meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${MART_META_PIXEL_ID}');
fbq('track', 'PageView');
          `.trim(),
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${MART_META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

"use client";

import {
  CircleCheck,
  CircleX,
  Info,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      mobileOffset={{ bottom: 88 }}
      gap={10}
      icons={{
        success: <CircleCheck className="size-4" />,
        error: <CircleX className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        loading: <Loader2 className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "kokoro-toast group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-darkblue/90 py-3.5 pl-5 pr-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl",
          icon: "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-light-royal-blue/40 to-plum/40 text-white ring-1 ring-white/10 group-data-[type=success]:from-green/60 group-data-[type=success]:to-light-royal-blue/40 group-data-[type=error]:from-plum/70 group-data-[type=error]:to-pink/30 group-data-[type=error]:text-pink group-data-[type=warning]:from-brownish-ash/70 group-data-[type=warning]:to-peach/30 group-data-[type=warning]:text-peach",
          content: "relative z-10 flex min-w-0 flex-1 flex-col gap-0.5",
          title: "text-sm font-semibold leading-snug text-white",
          description: "text-xs leading-relaxed text-light-bluish-gray",
          actionButton:
            "relative z-10 shrink-0 rounded-lg bg-gradient-to-r from-light-royal-blue to-plum px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110",
          cancelButton:
            "relative z-10 shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-light-bluish-gray hover:bg-white/10 hover:text-white",
          closeButton:
            "absolute right-2 top-2 z-10 flex size-5 items-center justify-center rounded-full border border-white/10 bg-darkblue text-light-bluish-gray hover:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

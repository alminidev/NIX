"use client";

import { Toaster } from "sonner";

export default function AdminToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      duration={8000}
      toastOptions={{
        style: {
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
    />
  );
}

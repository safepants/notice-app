import { useEffect, useState } from "react";

const STORAGE_KEY = "notice_unlocked";

export function usePaymentGate() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    // Check URL params for Stripe success redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      localStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const unlock = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setUnlocked(true);
  };

  return { unlocked, unlock };
}

import { useEffect, useState } from "react";

const STORAGE_KEY = "notice_unlocked";

export function usePaymentGate() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const access = params.get("access");
    const emailB64 = params.get("e");

    if (sessionId || (access && emailB64)) {
      setVerifying(true);
      const query = sessionId
        ? `session_id=${encodeURIComponent(sessionId)}`
        : `access=${encodeURIComponent(access!)}&e=${encodeURIComponent(emailB64!)}`;

      fetch(`/api/verify-session?${query}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            localStorage.setItem(STORAGE_KEY, "true");
            setUnlocked(true);
          }
        })
        .catch((err) => console.error("Verification failed:", err))
        .finally(() => {
          setVerifying(false);
          window.history.replaceState({}, "", window.location.pathname);
        });
    }
  }, []);

  const unlock = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setUnlocked(true);
  };

  return { unlocked, unlock, verifying };
}

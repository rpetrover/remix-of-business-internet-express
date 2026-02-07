import { useCallback, useEffect } from "react";

const SITE_KEY = "6LdBhGMsAAAAADVmaPExdyG6Tw0bOOoaKmKpEiRD";

let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadRecaptchaScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();

  return new Promise((resolve) => {
    if (scriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }

    scriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export function useRecaptcha() {
  useEffect(() => {
    loadRecaptchaScript();
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    await loadRecaptchaScript();

    return new Promise((resolve, reject) => {
      const grecaptcha = (window as any).grecaptcha;
      if (!grecaptcha) {
        reject(new Error("reCAPTCHA not loaded"));
        return;
      }

      grecaptcha.ready(() => {
        grecaptcha
          .execute(SITE_KEY, { action })
          .then((token: string) => resolve(token))
          .catch((err: any) => reject(err));
      });
    });
  }, []);

  return { executeRecaptcha };
}

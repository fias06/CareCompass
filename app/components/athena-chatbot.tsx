"use client";

import { useEffect } from "react";

export function AthenaChatbot() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://athenachat.bot/chatbot/widget/carecompass4577";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}

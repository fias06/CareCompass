"use client";

import { useEffect } from "react";

export function AthenaChatbot() {
  useEffect(() => {
    // Check if widget already exists
    if (document.getElementById('athena-chatbot-widget')) {
      console.log("Widget already exists");
      return;
    }

    console.log("Loading Athena chatbot script...");
    
    // Load the script with a direct fetch and eval approach to bypass DOMContentLoaded
    fetch("https://athenachat.bot/chatbot/widget/new-health-care5534")
      .then(response => response.text())
      .then(scriptContent => {
        console.log("Script fetched successfully");
        
        // The script wraps everything in DOMContentLoaded, so we need to extract the inner function
        // and execute it directly. We'll do this by evaluating the script and then manually 
        // triggering what would happen after DOMContentLoaded
        
        // Create a script element with the content
        const scriptEl = document.createElement("script");
        scriptEl.textContent = scriptContent;
        document.body.appendChild(scriptEl);
        
        // Manually trigger DOMContentLoaded event to initialize the widget
        const event = new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(event);
        
        console.log("DOMContentLoaded event dispatched");
        
        // Check if widget was created
        setTimeout(() => {
          const widget = document.getElementById('athena-chatbot-widget');
          if (widget) {
            console.log("✅ Athena widget created successfully!", widget);
          } else {
            console.error("❌ Athena widget NOT found after initialization");
          }
        }, 500);
      })
      .catch(error => {
        console.error("Failed to load Athena chatbot script:", error);
      });

    return () => {
      // Clean up - remove widget
      const widget = document.getElementById('athena-chatbot-widget');
      if (widget) {
        widget.remove();
        console.log("Athena widget removed");
      }
    };
  }, []);

  return null;
}

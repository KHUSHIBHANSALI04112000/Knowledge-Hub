import React, { useEffect } from "react";
import "./Chatwoot.css";

const BASE_URL = "http://127.0.0.1:3000"; // Your Chatwoot instance URL
const WEBHOOK_URL = "http://localhost:3200/webhook"; // Your backend endpoint

const ChatwootWidget = () => {
  useEffect(() => {
    // Set global Chatwoot settings before loading the SDK
    window.chatwootSettings = {
      autoOpen: true,
      // You can add more global settings here if needed.
    };

    // Optional: Listen for conversation updates if required
    const conversationUpdateListener = (event) => {
      console.log("chatwoot:conversation:updated event:", event.detail);
    };

    window.addEventListener(
      "chatwoot:conversation:updated",
      conversationUpdateListener
    );

    // Inject the Chatwoot SDK script dynamically
    (function (d, t) {
      const scriptElem = d.createElement(t);
      const firstScript = d.getElementsByTagName(t)[0];

      scriptElem.src = BASE_URL + "/packs/js/sdk.js";
      scriptElem.defer = true;
      scriptElem.async = true;
      firstScript.parentNode.insertBefore(scriptElem, firstScript);

      scriptElem.onload = function () {
        console.log("Chatwoot SDK loaded. Running configuration...");
        window.chatwootSDK.run({
          websiteToken: "BH9YQA553U754XQuLQmZYD5p", // Replace with your token
          baseUrl: BASE_URL,
          onMessage: async (message) => {
            console.log("onMessage callback fired with:", message);
            // Your processing code here if needed.
          },
        });
      };
    })(document, "script");

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener(
        "chatwoot:conversation:updated",
        conversationUpdateListener
      );
    };
  }, []);

  return null;
};

export default ChatwootWidget;

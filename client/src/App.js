import React, { useEffect, useState } from "react";
import keycloak from "./keycloakConfig";
import ChatwootWidget from "./Chatwoot";
import "./App.css"; // Ensure this file includes our new animation/transition styles

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    console.log("Initializing Keycloak...");
    keycloak
      .init({
        onLoad: "login-required",
        checkLoginIframe: false,
      })
      .then((auth) => {
        setAuthenticated(auth);
        console.log("Keycloak initialized:", auth);
      })
      .catch((err) => {
        console.error("Keycloak initialization failed:", err);
      });
  }, []);

  return (
    <div className="app-container">
      {authenticated ? (
        <>
          <div className="welcome-banner">
            <h1>Welcome, {keycloak.tokenParsed?.preferred_username}!</h1>
            <p>
              You are now securely logged in and ready to explore our Knowledge
              Base.
            </p>
            <p>if you have any questions, simply type{" "}
              <strong>/ask</strong> followed by your question in the chat below.
            </p>
          </div>

          <div className="chat-widget-container">
            <ChatwootWidget />
          </div>
        </>
      ) : (
        <h2 className="redirecting">Redirecting to login...</h2>
      )}
    </div>
  );
};

export default App;


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((registration) => {
        console.log("✅ Service Worker registered:", registration);

        // Check for updates periodically (every 60 seconds)
        setInterval(() => {
          registration.update().catch((err) => {
            console.log("Service Worker update check failed:", err);
          });
        }, 60000);

        // Listen for new service worker
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          newWorker?.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              console.log("🔄 New Service Worker available");

              // Auto-update: Tell the service worker to skip waiting
              newWorker.postMessage({ type: "SKIP_WAITING" });

              // Reload page to get latest version
              window.location.reload();
            }
          });
        });
      })
      .catch((error) => {
        console.log("❌ Service Worker registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

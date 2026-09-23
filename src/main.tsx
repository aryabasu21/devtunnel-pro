import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
	throw new Error("VITE_CLERK_PUBLISHABLE_KEY is required to start the application");
}

createRoot(document.getElementById("root")!).render(
	<ClerkProvider publishableKey={publishableKey}>
		<App />
	</ClerkProvider>,
);

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy-load pages for code splitting
const Docs = lazy(() => import("./pages/Docs.tsx"));
const APIReference = lazy(() => import("./pages/APIReference.tsx"));
const Examples = lazy(() => import("./pages/Examples.tsx"));
const Support = lazy(() => import("./pages/Support.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));

const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/docs"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Docs />
                </Suspense>
              }
            />
            <Route
              path="/api"
              element={
                <Suspense fallback={<PageLoader />}>
                  <APIReference />
                </Suspense>
              }
            />
            <Route
              path="/examples"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Examples />
                </Suspense>
              }
            />
            <Route
              path="/support"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Support />
                </Suspense>
              }
            />
            <Route
              path="/privacy"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Privacy />
                </Suspense>
              }
            />
            <Route
              path="/terms"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Terms />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

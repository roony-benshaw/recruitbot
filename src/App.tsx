
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import FakeResumeDetection from "./pages/FakeResumeDetection";
import ResumeParser from "./pages/ResumeParser";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Candidate from "./pages/Candidate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fake-resume-detection" element={<FakeResumeDetection />} />
          <Route path="/resume-parser" element={<ResumeParser />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidate-section" element={<Candidate />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

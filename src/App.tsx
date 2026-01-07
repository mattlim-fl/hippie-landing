import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Photos from "./pages/Photos";
import PhotoGallery from "./pages/PhotoGallery";
import GuestList from "./pages/GuestList";
import VenueHire from "./pages/VenueHire";
import GroupTicketPage from "./pages/GroupTicketPage";
import OccasionBuyPage from "./pages/OccasionBuyPage";
import OccasionOrganiserPage from "./pages/OccasionOrganiserPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/venue-hire" element={<VenueHire />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/photos/:date" element={<PhotoGallery />} />
          <Route path="/guest-list" element={<GuestList />} />
          <Route path="/group/:token" element={<GroupTicketPage />} />
          <Route path="/occasion/buy/:token" element={<OccasionBuyPage />} />
          <Route path="/occasion/:token" element={<OccasionOrganiserPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

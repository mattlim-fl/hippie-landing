import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Photos from "./pages/Photos";
import PhotoGallery from "./pages/PhotoGallery";
import GuestList from "./pages/GuestList";
import VenueHire from "./pages/VenueHire";
import Priority from "./pages/Priority";
import Karaoke from "./pages/Karaoke";
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
          <Route path="/photos" element={<Photos />} />
          <Route path="/photos/:date" element={<PhotoGallery />} />
          <Route path="/guest-list" element={<GuestList />} />
          <Route path="/venue-hire" element={<VenueHire />} />
          <Route path="/25-priority" element={<Priority />} />
          <Route path="/karaoke" element={<Karaoke />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

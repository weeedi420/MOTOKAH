import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { WishlistProvider } from "@/hooks/useWishlist";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import SellCar from "./pages/SellCar.tsx";
import Profile from "./pages/Profile.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import Messages from "./pages/Messages.tsx";
import Compare from "./pages/Compare.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import FAQ from "./pages/FAQ.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import Safety from "./pages/Safety.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Careers from "./pages/Careers.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import DealerDirectory from "./pages/DealerDirectory.tsx";
import DealerProfilePage from "./pages/DealerProfile.tsx";
import BecomeDealer from "./pages/BecomeDealer.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminListings from "./pages/admin/AdminListings.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminBlog from "./pages/admin/AdminBlog.tsx";
import AdminContacts from "./pages/admin/AdminContacts.tsx";
import AdminNewsletter from "./pages/admin/AdminNewsletter.tsx";
import AdminDealers from "./pages/admin/AdminDealers.tsx";
import NotFound from "./pages/NotFound.tsx";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ minHeight: "100vh" }}
      >
        <Routes location={location}>
              <Route path="/" element={<Index />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/sell" element={<ProtectedRoute><SellCar /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/dealers" element={<DealerDirectory />} />
              <Route path="/dealer/:id" element={<DealerProfilePage />} />
              <Route path="/become-dealer" element={<ProtectedRoute><BecomeDealer /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="listings" element={<AdminListings />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="contacts" element={<AdminContacts />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="dealers" element={<AdminDealers />} />
              </Route>
              <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
      <WishlistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallBanner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

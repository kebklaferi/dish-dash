import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { MealsProvider } from "@/context/MealsContext";
import { AppLayout } from "@/layouts/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import Order from "./pages/Order";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import CourierDashboard from "./pages/CourierDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <MealsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/restaurants"
                  element={
                    <AppLayout>
                      <Restaurants />
                    </AppLayout>
                  }
                />
                <Route
                  path="/restaurants/:id"
                  element={
                    <AppLayout>
                      <RestaurantDetail />
                    </AppLayout>
                  }
                />
                <Route
                  path="/order"
                  element={
                    <AppLayout>
                      <Order />
                    </AppLayout>
                  }
                />
                <Route
                  path="/restaurant-dashboard"
                  element={
                    <AppLayout>
                      <RestaurantDashboard />
                    </AppLayout>
                  }
                />
                <Route
                  path="/courier-dashboard"
                  element={
                    <AppLayout>
                      <CourierDashboard />
                    </AppLayout>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AppLayout>
                      <AdminPanel />
                    </AppLayout>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </MealsProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

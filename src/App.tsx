import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TopNavigation } from "@/components/TopNavigation";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileSidebar } from "@/components/ProfileSidebar";
// import { StripeProvider } from "@/contexts/StripeContext"; // TEMPORARILY HIDDEN - for shop

// Critical routes - load immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load all other routes for code splitting
const ProfileOnboarding = lazy(() => import("./pages/ProfileOnboarding"));
const ProfileOnboardingEnhanced = lazy(() => import("./pages/ProfileOnboardingEnhanced"));
const ProfileOnboardingStreamlined = lazy(() => import("./pages/ProfileOnboardingStreamlined"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Directory = lazy(() => import("./pages/Directory"));
const AlumniDirectory = lazy(() => import("./pages/AlumniDirectory"));
const BusinessDirectory = lazy(() => import("./pages/BusinessDirectory"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminContributions = lazy(() => import("./pages/AdminContributions"));
const AdminMessages = lazy(() => import("./pages/AdminMessages"));
const ProfileView = lazy(() => import("./pages/ProfileView"));
const BusinessViewEnhanced = lazy(() => import("./pages/BusinessViewEnhanced"));
const BusinessEditEnhanced = lazy(() => import("./pages/BusinessEditEnhanced"));
const BusinessEdit = lazy(() => import("./pages/BusinessEdit"));
const BusinessMembers = lazy(() => import("./pages/BusinessMembers"));
const Settings = lazy(() => import("./pages/Settings"));
const Chat = lazy(() => import("./pages/Chat"));
const AlumniMapFixed = lazy(() => import("./pages/AlumniMapFixed"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Shop pages - TEMPORARILY HIDDEN
// const ShopHome = lazy(() => import("./pages/shop/ShopHome"));
// const ProductView = lazy(() => import("./pages/shop/ProductView"));
// const Cart = lazy(() => import("./pages/shop/Cart"));
// const Checkout = lazy(() => import("./pages/shop/Checkout"));
// const OrderConfirmation = lazy(() => import("./pages/shop/OrderConfirmation"));
// const OrderHistory = lazy(() => import("./pages/shop/OrderHistory"));
// const ShopAdmin = lazy(() => import("./pages/shop/ShopAdmin"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="mt-2 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
            {/* ABuD Alumni Directory Routes */}
            <Route path="/abud/auth" element={<Auth />} />
            <Route path="/abud/onboarding" element={<ProfileOnboardingStreamlined />} />
            
            {/* Backend dashboard routes with ProfileSidebar */}
            <Route path="/abud/profile/edit" element={
              <div className="min-h-screen">
                <TopNavigation />
                <SidebarProvider>
                  <div className="flex w-full pt-14">
                    <ProfileSidebar />
                    <main className="flex-1">
                      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                        <SidebarTrigger className="ml-2" />
                      </header>
                      <ProfileEdit />
                    </main>
                  </div>
                </SidebarProvider>
              </div>
            } />
            
            <Route path="/abud/settings" element={
              <div className="min-h-screen">
                <TopNavigation />
                <SidebarProvider>
                  <div className="flex w-full pt-14">
                    <AppSidebar />
                    <main className="flex-1">
                      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                        <SidebarTrigger className="ml-2" />
                      </header>
                      <Settings />
                    </main>
                  </div>
                </SidebarProvider>
              </div>
            } />

            <Route path="/abud/business/:businessId/edit" element={
              <div className="min-h-screen">
                <TopNavigation />
                <SidebarProvider>
                  <div className="flex w-full pt-14">
                    <AppSidebar />
                    <main className="flex-1">
                      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                        <SidebarTrigger className="ml-2" />
                      </header>
                      <BusinessEditEnhanced />
                    </main>
                  </div>
                </SidebarProvider>
              </div>
            } />

            <Route path="/abud/business/:businessId/members" element={
              <div className="min-h-screen">
                <TopNavigation />
                <SidebarProvider>
                  <div className="flex w-full pt-14">
                    <AppSidebar />
                    <main className="flex-1">
                      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                        <SidebarTrigger className="ml-2" />
                      </header>
                      <BusinessMembers />
                    </main>
                  </div>
                </SidebarProvider>
              </div>
            } />

            <Route path="/abud/admin" element={
              <ProtectedRoute requireAdmin={true} showBanner={false}>
                <div className="min-h-screen">
                  <TopNavigation />
                  <SidebarProvider>
                    <div className="flex w-full pt-14">
                      <AppSidebar />
                      <main className="flex-1">
                        <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                          <SidebarTrigger className="ml-2" />
                        </header>
                        <AdminDashboard />
                      </main>
                    </div>
                  </SidebarProvider>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/abud/admin/analytics" element={
              <ProtectedRoute requireAdmin={true} showBanner={false}>
                <div className="min-h-screen">
                  <TopNavigation />
                  <SidebarProvider>
                    <div className="flex w-full pt-14">
                      <AppSidebar />
                      <main className="flex-1">
                        <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                          <SidebarTrigger className="ml-2" />
                        </header>
                        <AdminAnalytics />
                      </main>
                    </div>
                  </SidebarProvider>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/abud/admin/contributions" element={
              <ProtectedRoute requireAdmin={true} showBanner={false}>
                <div className="min-h-screen">
                  <TopNavigation />
                  <SidebarProvider>
                    <div className="flex w-full pt-14">
                      <AppSidebar />
                      <main className="flex-1">
                        <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                          <SidebarTrigger className="ml-2" />
                        </header>
                        <AdminContributions />
                      </main>
                    </div>
                  </SidebarProvider>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/abud/admin/messages" element={
              <ProtectedRoute requireAdmin={true} showBanner={false}>
                <div className="min-h-screen">
                  <TopNavigation />
                  <SidebarProvider>
                    <div className="flex w-full pt-14">
                      <AppSidebar />
                      <main className="flex-1">
                        <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                          <SidebarTrigger className="ml-2" />
                        </header>
                        <AdminMessages />
                      </main>
                    </div>
                  </SidebarProvider>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/abud/business/edit" element={
              <div className="min-h-screen">
                <TopNavigation />
                <SidebarProvider>
                  <div className="flex w-full pt-14">
                    <AppSidebar />
                    <main className="flex-1">
                      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                        <SidebarTrigger className="ml-2" />
                      </header>
                      <BusinessEdit />
                    </main>
                  </div>
                </SidebarProvider>
              </div>
            } />

            <Route path="/abud/business/new" element={
              <div className="min-h-screen">
                <TopNavigation />
                <SidebarProvider>
                  <div className="flex w-full pt-14">
                    <AppSidebar />
                    <main className="flex-1">
                      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                        <SidebarTrigger className="ml-2" />
                      </header>
                      <BusinessEditEnhanced />
                    </main>
                  </div>
                </SidebarProvider>
              </div>
            } />

            <Route path="/abud/chat" element={
              <div className="min-h-screen">
                <TopNavigation />
                <SidebarProvider>
                  <div className="flex w-full pt-14">
                    <AppSidebar />
                    <main className="flex-1">
                      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur">
                        <SidebarTrigger className="ml-2" />
                      </header>
                      <Chat />
                    </main>
                  </div>
                </SidebarProvider>
              </div>
            } />
            
            {/* Main ABuD routes with TopNavigation */}
            <Route path="/abud/*" element={
              <div className="min-h-screen">
                <TopNavigation />
                <main className="pt-14">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/directory" element={<Directory />} />
                    <Route path="/directory/alumni" element={<AlumniDirectory />} />
                    <Route path="/directory/alumni/map" element={<AlumniMapFixed />} />
                    <Route path="/directory/business" element={<BusinessDirectory />} />
                    <Route path="/profile/me" element={<ProfileView />} />
                    <Route path="/profile/:userId" element={<ProfileView />} />
                    <Route path="/business/:businessId" element={<BusinessViewEnhanced />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            } />

            {/* Shop Routes - TEMPORARILY HIDDEN */}
            {/* <Route path="/shop/*" element={
              <StripeProvider>
                <div className="min-h-screen">
                  <TopNavigation />
                  <main className="pt-14">
                    <Routes>
                      <Route path="/" element={<ShopHome />} />
                      <Route path="/product/:productId" element={<ProductView />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } />
                      <Route path="/order/:orderId" element={
                        <ProtectedRoute>
                          <OrderConfirmation />
                        </ProtectedRoute>
                      } />
                      <Route path="/orders" element={
                        <ProtectedRoute>
                          <OrderHistory />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin" element={
                        <ProtectedRoute requireAdmin={true}>
                          <ShopAdmin />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                </div>
              </StripeProvider>
            } /> */}

            {/* Home redirect to /abud */}
            <Route path="/" element={<Navigate to="/abud" replace />} />

            {/* Default redirect to /abud */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

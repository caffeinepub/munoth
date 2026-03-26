import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Header from "./components/Header";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin, useUserProfile } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import AlbumsPage from "./pages/AlbumsPage";
import HomePage from "./pages/HomePage";

export type Page = "home" | "albums" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();

  const needsProfile = !!identity && profile === null;

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isAdmin={isAdmin ?? false}
      />
      <main className="max-w-[1280px] mx-auto px-6 py-6">
        {currentPage === "home" && <HomePage />}
        {currentPage === "albums" && <AlbumsPage />}
        {currentPage === "admin" && <AdminPage />}
      </main>
      {needsProfile && <ProfileSetupModal />}
      <Toaster />
    </div>
  );
}

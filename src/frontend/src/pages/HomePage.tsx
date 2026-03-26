import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, PlusCircle, Users } from "lucide-react";
import { useState } from "react";
import type { Memory } from "../backend";
import Footer from "../components/Footer";
import MemoryCard from "../components/MemoryCard";
import MemoryDetailModal from "../components/MemoryDetailModal";
import UploadModal from "../components/UploadModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAlbums, useFeed, useUserProfile } from "../hooks/useQueries";

const SAMPLE_FAMILY_MEMBERS = [
  { name: "Grandma Rose", initial: "G" },
  { name: "Uncle Tom", initial: "U" },
  { name: "Aunt Sarah", initial: "A" },
  { name: "Dad", initial: "D" },
  { name: "Mom", initial: "M" },
];

const VISIBLE_COUNT = 8;

export default function HomePage() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNT);
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: feed, isLoading: feedLoading } = useFeed();
  const { data: albums, isLoading: albumsLoading } = useAlbums();

  const visibleFeed = feed?.slice(0, visibleCount) ?? [];

  const getAuthorName = (memory: Memory) => {
    return profile && memory.uploaderId.toString() === profile?.name
      ? profile.name
      : "Family Member";
  };

  return (
    <div className="flex gap-6">
      {/* Main column */}
      <div className="flex-1 min-w-0">
        {/* Hero / Compose panel */}
        <section
          className="bg-card rounded-2xl shadow-card p-6 mb-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.91 0.045 62), oklch(0.93 0.055 55))",
          }}
          data-ocid="compose.panel"
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Share Your Family Memories
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Capture and preserve precious moments with your loved ones.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex-1 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm text-muted-foreground text-left cursor-pointer hover:bg-background transition-colors"
              onClick={() => (identity ? setShowUpload(true) : undefined)}
            >
              {identity
                ? `What's on your mind, ${profile?.name?.split(" ")[0] ?? "friend"}?`
                : "Sign in to share memories..."}
            </button>
            {identity && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-primary text-primary-foreground rounded-full px-5 hover:bg-primary/90 gap-2 shrink-0"
                data-ocid="compose.new_post.button"
              >
                <PlusCircle className="w-4 h-4" />
                New Post
              </Button>
            )}
          </div>
        </section>

        {/* Feed */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Memories
          </h2>
          {feedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["a", "b", "c", "d"].map((k) => (
                <div
                  key={k}
                  className="bg-card rounded-2xl overflow-hidden shadow-card"
                >
                  <div className="p-4 flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="mx-4 mb-4 rounded-xl aspect-[4/3]" />
                </div>
              ))}
            </div>
          ) : visibleFeed.length === 0 ? (
            <div
              className="bg-card rounded-2xl shadow-card p-12 text-center"
              data-ocid="feed.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No memories yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to share a family memory!
              </p>
              {identity && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                  data-ocid="feed.empty_state.button"
                >
                  Share a Memory
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleFeed.map((memory, i) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    authorName={getAuthorName(memory)}
                    commentCount={0}
                    reactionCount={0}
                    onOpen={() => setSelectedMemory(memory)}
                    index={i + 1}
                  />
                ))}
              </div>
              {feed && feed.length > visibleCount && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => setVisibleCount((c) => c + VISIBLE_COUNT)}
                    className="bg-primary text-primary-foreground rounded-full px-8 hover:bg-primary/90"
                    data-ocid="feed.load_more.button"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        <Footer />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col gap-6 w-[300px] shrink-0">
        {/* Albums sidebar */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Albums
          </h3>
          {albumsLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {["a", "b", "c", "d"].map((k) => (
                <Skeleton key={k} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : albums && albums.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {albums.slice(0, 4).map((album) => (
                <div
                  key={album.id}
                  className="rounded-xl overflow-hidden bg-secondary aspect-square flex flex-col items-center justify-center p-2 text-center"
                  data-ocid="sidebar.albums.item.1"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                    {album.name}
                  </p>
                </div>
              ))}
              {identity && (
                <button
                  type="button"
                  onClick={() => setShowUpload(true)}
                  className="rounded-xl bg-primary/10 aspect-square flex flex-col items-center justify-center gap-1 hover:bg-primary/20 transition-colors"
                  data-ocid="sidebar.albums.upload.button"
                >
                  <PlusCircle className="w-6 h-6 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    Upload
                  </span>
                </button>
              )}
            </div>
          ) : (
            <p
              className="text-sm text-muted-foreground text-center py-4"
              data-ocid="sidebar.albums.empty_state"
            >
              No albums yet
            </p>
          )}
        </div>

        {/* Family Members sidebar */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Family Members
          </h3>
          <div className="flex flex-wrap gap-3">
            {SAMPLE_FAMILY_MEMBERS.map((member, i) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-1.5"
                data-ocid={`sidebar.members.item.${i + 1}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {member.initial}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {member.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Modals */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {selectedMemory && (
        <MemoryDetailModal
          memory={selectedMemory}
          authorName={getAuthorName(selectedMemory)}
          onClose={() => setSelectedMemory(null)}
        />
      )}
    </div>
  );
}

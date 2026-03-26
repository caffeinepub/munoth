import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Images, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Album, Memory } from "../backend";
import Footer from "../components/Footer";
import MemoryCard from "../components/MemoryCard";
import MemoryDetailModal from "../components/MemoryDetailModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAlbums,
  useCreateAlbum,
  useMemoriesByAlbum,
} from "../hooks/useQueries";

function AlbumMemories({
  album,
  onBack,
}: { album: Album; onBack: () => void }) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const { data: memories, isLoading } = useMemoriesByAlbum(album.id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-secondary"
          data-ocid="albums.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">{album.name}</h2>
          {album.description && (
            <p className="text-sm text-muted-foreground">{album.description}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <Skeleton key={k} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : memories && memories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((memory, i) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              authorName="Family Member"
              commentCount={0}
              reactionCount={0}
              onOpen={() => setSelectedMemory(memory)}
              index={i + 1}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16"
          data-ocid="album_memories.empty_state"
        >
          <Images className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No memories in this album yet.
          </p>
        </div>
      )}

      {selectedMemory && (
        <MemoryDetailModal
          memory={selectedMemory}
          authorName="Family Member"
          onClose={() => setSelectedMemory(null)}
        />
      )}
      <Footer />
    </div>
  );
}

export default function AlbumsPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { identity } = useInternetIdentity();
  const { data: albums, isLoading } = useAlbums();
  const createAlbum = useCreateAlbum();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createAlbum.mutateAsync({
        name: newName.trim(),
        description: newDesc.trim(),
      });
      toast.success("Album created!");
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
    } catch {
      toast.error("Failed to create album");
    }
  };

  if (selectedAlbum) {
    return (
      <AlbumMemories
        album={selectedAlbum}
        onBack={() => setSelectedAlbum(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Albums</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organized collections of your family memories
          </p>
        </div>
        {identity && (
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90 gap-2"
            data-ocid="albums.create.button"
          >
            <PlusCircle className="w-4 h-4" />
            New Album
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
            <Skeleton key={k} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : albums && albums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.map((album, i) => (
            <button
              key={album.id}
              type="button"
              onClick={() => setSelectedAlbum(album)}
              className="bg-card rounded-2xl shadow-card p-5 text-left hover:shadow-lg transition-shadow group"
              data-ocid={`albums.item.${i + 1}`}
            >
              <div className="aspect-square mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm truncate">
                {album.name}
              </p>
              {album.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {album.description}
                </p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-20 bg-card rounded-2xl shadow-card"
          data-ocid="albums.empty_state"
        >
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No albums yet
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Create your first album to organize your memories.
          </p>
          {identity && (
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
              data-ocid="albums.empty_state.button"
            >
              Create Album
            </Button>
          )}
        </div>
      )}

      {showCreate && (
        <Dialog open onOpenChange={(open) => !open && setShowCreate(false)}>
          <DialogContent
            className="bg-popover border-border max-w-sm"
            data-ocid="albums.create.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-bold">Create New Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Album Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Summer Vacation 2024"
                  className="bg-background border-border"
                  autoFocus
                  data-ocid="albums.create.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description (optional)</Label>
                <Textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="A short description..."
                  className="resize-none bg-background border-border"
                  rows={2}
                  data-ocid="albums.create.textarea"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreate(false)}
                  className="rounded-full"
                  data-ocid="albums.create.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newName.trim() || createAlbum.isPending}
                  className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                  data-ocid="albums.create.submit_button"
                >
                  {createAlbum.isPending ? "Creating..." : "Create Album"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}

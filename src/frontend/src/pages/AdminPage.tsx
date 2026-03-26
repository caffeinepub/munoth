import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Images,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Album, Memory } from "../backend";
import { MediaType } from "../backend";
import Footer from "../components/Footer";
import {
  useAlbums,
  useCreateAlbum,
  useDeleteAlbum,
  useDeleteMemory,
  useFeed,
  useUpdateAlbum,
  useUpdateMemory,
} from "../hooks/useQueries";

function MemoriesTab() {
  const { data: feed, isLoading } = useFeed();
  const { data: albums } = useAlbums();
  const deleteMemory = useDeleteMemory();
  const updateMemory = useUpdateMemory();
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editAlbumId, setEditAlbumId] = useState<string>("none");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openEdit = (m: Memory) => {
    setEditingMemory(m);
    setEditCaption(m.caption);
    setEditAlbumId(m.albumId ?? "none");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory) return;
    try {
      await updateMemory.mutateAsync({
        memoryId: editingMemory.id,
        caption: editCaption,
        albumId: editAlbumId === "none" ? null : editAlbumId,
      });
      toast.success("Memory updated");
      setEditingMemory(null);
    } catch {
      toast.error("Failed to update memory");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMemory.mutateAsync(id);
      toast.success("Memory deleted");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete memory");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {["a", "b", "c", "d", "e"].map((k) => (
          <Skeleton key={k} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {!feed || feed.length === 0 ? (
        <div
          className="text-center py-12"
          data-ocid="admin.memories.empty_state"
        >
          <Images className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No memories uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((memory, i) => (
            <div
              key={memory.id}
              className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-xs"
              data-ocid={`admin.memories.item.${i + 1}`}
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                {memory.mediaType === MediaType.video ? (
                  <video
                    src={memory.blob.getDirectURL()}
                    className="w-full h-full object-cover"
                    aria-label={memory.caption || "Video thumbnail"}
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <img
                    src={memory.blob.getDirectURL()}
                    alt={memory.caption || "Memory thumbnail"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {memory.caption || "(no caption)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {memory.mediaType === MediaType.video ? "Video" : "Photo"}
                  {memory.albumId
                    ? ` · ${albums?.find((a) => a.id === memory.albumId)?.name ?? "Album"}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(memory)}
                  className="h-8 w-8 hover:bg-secondary"
                  data-ocid={`admin.memories.edit_button.${i + 1}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeletingId(memory.id)}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  data-ocid={`admin.memories.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingMemory && (
        <Dialog open onOpenChange={(open) => !open && setEditingMemory(null)}>
          <DialogContent
            className="bg-popover border-border max-w-sm"
            data-ocid="admin.memories.edit.dialog"
          >
            <DialogHeader>
              <DialogTitle>Edit Memory</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Caption</Label>
                <Textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="bg-background border-border resize-none"
                  rows={3}
                  data-ocid="admin.memories.edit.textarea"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Album</Label>
                <Select value={editAlbumId} onValueChange={setEditAlbumId}>
                  <SelectTrigger
                    className="bg-background border-border"
                    data-ocid="admin.memories.edit.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="none">No album</SelectItem>
                    {albums?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingMemory(null)}
                  className="rounded-full"
                  data-ocid="admin.memories.edit.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMemory.isPending}
                  className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                  data-ocid="admin.memories.edit.save_button"
                >
                  {updateMemory.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent
          className="bg-popover border-border"
          data-ocid="admin.memories.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.memories.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.memories.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AlbumsTab() {
  const { data: albums, isLoading } = useAlbums();
  const createAlbum = useCreateAlbum();
  const updateAlbum = useUpdateAlbum();
  const deleteAlbum = useDeleteAlbum();
  const [showCreate, setShowCreate] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const openCreate = () => {
    setName("");
    setDesc("");
    setShowCreate(true);
  };
  const openEdit = (a: Album) => {
    setEditingAlbum(a);
    setName(a.name);
    setDesc(a.description);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAlbum.mutateAsync({ name, description: desc });
      toast.success("Album created");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create album");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;
    try {
      await updateAlbum.mutateAsync({
        albumId: editingAlbum.id,
        name,
        description: desc,
      });
      toast.success("Album updated");
      setEditingAlbum(null);
    } catch {
      toast.error("Failed to update album");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlbum.mutateAsync(id);
      toast.success("Album deleted");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete album");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={openCreate}
          className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90 gap-2"
          data-ocid="admin.albums.create.button"
        >
          <PlusCircle className="w-4 h-4" />
          Create Album
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !albums || albums.length === 0 ? (
        <div className="text-center py-12" data-ocid="admin.albums.empty_state">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No albums yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {albums.map((album, i) => (
            <div
              key={album.id}
              className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-xs"
              data-ocid={`admin.albums.item.${i + 1}`}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {album.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {album.description || "No description"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(album)}
                  className="h-8 w-8"
                  data-ocid={`admin.albums.edit_button.${i + 1}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeletingId(album.id)}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  data-ocid={`admin.albums.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreate || editingAlbum) && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setShowCreate(false);
              setEditingAlbum(null);
            }
          }}
        >
          <DialogContent
            className="bg-popover border-border max-w-sm"
            data-ocid="admin.albums.edit.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editingAlbum ? "Edit Album" : "Create Album"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={editingAlbum ? handleUpdate : handleCreate}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border"
                  autoFocus
                  data-ocid="admin.albums.edit.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="bg-background border-border resize-none"
                  rows={2}
                  data-ocid="admin.albums.edit.textarea"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingAlbum(null);
                  }}
                  className="rounded-full"
                  data-ocid="admin.albums.edit.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim()}
                  className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                  data-ocid="admin.albums.edit.save_button"
                >
                  {editingAlbum ? "Save" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent
          className="bg-popover border-border"
          data-ocid="admin.albums.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the album. Memories inside won't be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.albums.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground"
              data-ocid="admin.albums.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="text-center py-16" data-ocid="admin.users.panel">
      <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <h3 className="font-semibold text-foreground mb-2">User Management</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        To assign roles to users, share their principal ID and use the role
        assignment functionality. This feature requires knowing the user's
        principal.
      </p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Management Panel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage memories, albums, and users
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <Tabs defaultValue="memories" data-ocid="admin.tabs">
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger
              value="memories"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.memories.tab"
            >
              <Images className="w-4 h-4" /> Memories
            </TabsTrigger>
            <TabsTrigger
              value="albums"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.albums.tab"
            >
              <BookOpen className="w-4 h-4" /> Albums
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.users.tab"
            >
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
          </TabsList>
          <TabsContent value="memories">
            <MemoriesTab />
          </TabsContent>
          <TabsContent value="albums">
            <AlbumsTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

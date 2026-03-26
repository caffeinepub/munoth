import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAlbums, useCreateMemory } from "../hooks/useQueries";

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [albumId, setAlbumId] = useState<string>("none");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const createMemory = useCreateMemory();
  const { data: albums } = useAlbums();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      await createMemory.mutateAsync({
        file,
        caption,
        albumId: albumId === "none" ? null : albumId,
        onProgress: setProgress,
      });
      toast.success("Memory shared!");
      onClose();
    } catch {
      toast.error("Failed to upload. Please try again.");
    }
  };

  const isVideo = file?.type.startsWith("video/");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-popover border-border max-w-lg"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Share a Memory
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File drop zone */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            data-ocid="upload.dropzone"
          >
            {preview ? (
              isVideo ? (
                <video
                  src={preview}
                  className="max-h-48 mx-auto rounded-lg object-contain"
                  aria-label="Video preview"
                >
                  <track kind="captions" />
                </video>
              ) : (
                <img
                  src={preview}
                  alt="Selected file preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <ImagePlus className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select a photo or video
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, MP4, MOV...
                </p>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            data-ocid="upload.upload_button"
          />

          {/* Caption */}
          <div className="space-y-1.5">
            <Label>Caption</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening in this memory?"
              className="resize-none bg-background border-border"
              rows={2}
              data-ocid="upload.textarea"
            />
          </div>

          {/* Album selector */}
          <div className="space-y-1.5">
            <Label>Album (optional)</Label>
            <Select value={albumId} onValueChange={setAlbumId}>
              <SelectTrigger
                className="bg-background border-border"
                data-ocid="upload.select"
              >
                <SelectValue placeholder="No album" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">No album</SelectItem>
                {albums?.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          {createMemory.isPending && (
            <div className="space-y-1.5" data-ocid="upload.loading_state">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-full"
              data-ocid="upload.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || createMemory.isPending}
              className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90 gap-2"
              data-ocid="upload.submit_button"
            >
              <Upload className="w-4 h-4" />
              {createMemory.isPending ? "Uploading..." : "Share Memory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

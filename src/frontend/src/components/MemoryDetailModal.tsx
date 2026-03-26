import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Memory } from "../backend";
import { MediaType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddComment, useAddReaction } from "../hooks/useQueries";

interface Comment {
  id: string;
  text: string;
  author: string;
}

interface MemoryDetailModalProps {
  memory: Memory;
  authorName: string;
  onClose: () => void;
}

const EMOJIS = ["❤️", "😂", "😮", "😢", "🥰", "👏"];

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MemoryDetailModal({
  memory,
  authorName,
  onClose,
}: MemoryDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [commentText, setCommentText] = useState("");
  const { identity } = useInternetIdentity();

  const addComment = useAddComment();
  const addReaction = useAddReaction();

  const mediaUrl = memory.blob.getDirectURL();
  const isVideo = memory.mediaType === MediaType.video;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !identity) return;
    try {
      const id = await addComment.mutateAsync({
        memoryId: memory.id,
        text: commentText.trim(),
      });
      setComments((prev) => [
        ...prev,
        { id, text: commentText.trim(), author: "You" },
      ]);
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!identity) {
      toast.error("Please sign in to react");
      return;
    }
    try {
      await addReaction.mutateAsync({ memoryId: memory.id, emoji });
      setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    } catch {
      toast.error("Failed to add reaction");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-popover border-border max-w-3xl w-full p-0 overflow-hidden max-h-[90vh]"
        data-ocid="memory_detail.dialog"
      >
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Media side */}
          <div className="md:w-3/5 bg-foreground/5 flex items-center justify-center relative min-h-[220px]">
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]"
                aria-label={memory.caption || "Video memory"}
              >
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={mediaUrl}
                alt={memory.caption || "Family memory photo"}
                className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]"
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
              data-ocid="memory_detail.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info side */}
          <div className="md:w-2/5 flex flex-col border-l border-border">
            {/* Header */}
            <div className="flex items-center gap-2.5 p-4 border-b border-border">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary-foreground">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {authorName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(memory.timestamp)}
                </p>
              </div>
            </div>

            {/* Caption + comments */}
            <ScrollArea className="flex-1 p-4">
              {memory.caption && (
                <p className="text-sm text-foreground mb-4 pb-4 border-b border-border">
                  {memory.caption}
                </p>
              )}
              {comments.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground italic text-center py-4"
                  data-ocid="memory_detail.comments.empty_state"
                >
                  No comments yet. Be the first!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c, i) => (
                    <div
                      key={c.id}
                      className="text-sm"
                      data-ocid={`memory_detail.comments.item.${i + 1}`}
                    >
                      <span className="font-semibold text-foreground">
                        {c.author}
                      </span>{" "}
                      <span className="text-foreground/80">{c.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Reactions */}
            <div className="px-4 py-3 border-t border-border">
              <div className="flex gap-1.5 flex-wrap">
                {EMOJIS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 text-sm transition-colors"
                    data-ocid="memory_detail.reaction.button"
                  >
                    <span>{emoji}</span>
                    {reactions[emoji] ? (
                      <span className="text-xs text-muted-foreground">
                        {reactions[emoji]}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment input */}
            {identity && (
              <form
                onSubmit={handleAddComment}
                className="px-4 pb-4 pt-2 border-t border-border flex gap-2"
              >
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="resize-none text-sm bg-background border-border min-h-[38px] max-h-[80px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleAddComment(e as unknown as React.FormEvent);
                    }
                  }}
                  data-ocid="memory_detail.comment.textarea"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!commentText.trim() || addComment.isPending}
                  className="bg-primary text-primary-foreground shrink-0 rounded-xl hover:bg-primary/90"
                  data-ocid="memory_detail.comment.submit_button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

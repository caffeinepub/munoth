import { Heart, MessageCircle, Play } from "lucide-react";
import type { Memory } from "../backend";
import { MediaType } from "../backend";

interface MemoryCardProps {
  memory: Memory;
  authorName: string;
  commentCount: number;
  reactionCount: number;
  onOpen: () => void;
  index: number;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MemoryCard({
  memory,
  authorName,
  commentCount,
  reactionCount,
  onOpen,
  index,
}: MemoryCardProps) {
  const mediaUrl = memory.blob.getDirectURL();
  const isVideo = memory.mediaType === MediaType.video;

  return (
    <button
      type="button"
      className="bg-card rounded-2xl shadow-card overflow-hidden text-left w-full hover:shadow-lg transition-shadow duration-200 animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onOpen}
      data-ocid={`feed.item.${index}`}
    >
      {/* Author row */}
      <div className="flex items-center gap-2.5 p-4 pb-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary-foreground">
            {authorName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {authorName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(memory.timestamp)}
          </p>
        </div>
      </div>

      {/* Media */}
      <div className="relative mx-4 mb-3 rounded-xl overflow-hidden bg-secondary aspect-[4/3]">
        {isVideo ? (
          <>
            <video
              src={mediaUrl}
              className="w-full h-full object-cover"
              preload="metadata"
              aria-label={memory.caption || "Video memory"}
            >
              <track kind="captions" />
            </video>
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={memory.caption || "Family memory photo"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Caption */}
      {memory.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground line-clamp-2 text-left">
            {memory.caption}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 px-4 pb-4 text-muted-foreground">
        <span className="flex items-center gap-1.5 text-sm">
          <Heart className="w-4 h-4" />
          {reactionCount}
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <MessageCircle className="w-4 h-4" />
          {commentCount}
        </span>
      </div>
    </button>
  );
}

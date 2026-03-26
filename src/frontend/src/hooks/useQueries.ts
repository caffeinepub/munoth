import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Album, Memory, UserProfile } from "../backend";
import { ExternalBlob, MediaType } from "../backend";
import { useActor } from "./useActor";

export function useFeed() {
  const { actor, isFetching } = useActor();
  return useQuery<Memory[]>({
    queryKey: ["feed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAlbums() {
  const { actor, isFetching } = useActor();
  return useQuery<Album[]>({
    queryKey: ["albums"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlbumsList();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMemoriesByAlbum(albumId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Memory[]>({
    queryKey: ["memories", albumId],
    queryFn: async () => {
      if (!actor || !albumId) return [];
      return actor.getMemoriesByAlbum(albumId);
    },
    enabled: !!actor && !isFetching && !!albumId,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useCreateMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      file: File;
      caption: string;
      albumId: string | null;
      onProgress: (p: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await params.file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
        params.onProgress,
      );
      const mediaType = params.file.type.startsWith("video/")
        ? MediaType.video
        : MediaType.photo;
      await actor.createMemory(blob, mediaType, params.caption, params.albumId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}

export function useDeleteMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memoryId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteMemory(memoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}

export function useUpdateMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryId: string;
      caption: string;
      albumId: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateMemory(params.memoryId, params.caption, params.albumId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}

export function useCreateAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.createAlbum(params.name, params.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
}

export function useUpdateAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      albumId: string;
      name: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateAlbum(params.albumId, params.name, params.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
}

export function useDeleteAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (albumId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteAlbum(albumId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { memoryId: string; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(params.memoryId, params.text);
    },
  });
}

export function useAddReaction() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { memoryId: string; emoji: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addReaction(params.memoryId, params.emoji);
    },
  });
}

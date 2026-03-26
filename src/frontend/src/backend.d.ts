import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Album {
    id: string;
    creator: Principal;
    name: string;
    createdAt: Time;
    description: string;
    updatedAt: Time;
}
export type Time = bigint;
export interface Memory {
    id: string;
    blob: ExternalBlob;
    timestamp: Time;
    caption: string;
    albumId?: string;
    mediaType: MediaType;
    uploaderId: Principal;
}
export interface UserProfile {
    name: string;
}
export enum MediaType {
    video = "video",
    photo = "photo"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(memoryId: string, text: string): Promise<string>;
    addReaction(memoryId: string, emoji: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlbum(name: string, description: string): Promise<string>;
    createMemory(blobId: ExternalBlob, mediaType: MediaType, caption: string, albumId: string | null): Promise<string>;
    deleteAlbum(albumId: string): Promise<void>;
    deleteMemory(memoryId: string): Promise<void>;
    getAlbumsList(): Promise<Array<Album>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeed(): Promise<Array<Memory>>;
    getMemoriesByAlbum(albumId: string): Promise<Array<Memory>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeComment(commentId: string): Promise<void>;
    removeReaction(reactionId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAlbum(albumId: string, name: string, description: string): Promise<void>;
    updateMemory(memoryId: string, caption: string, albumId: string | null): Promise<void>;
}

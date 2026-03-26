# Family Memory Share

## Current State
New project with empty Motoko backend and no frontend yet.

## Requested Changes (Diff)

### Add
- Home feed showing recently shared memories (photos/videos with captions, uploader info, timestamp)
- Upload flow: select photo/video file, add caption, assign to album
- Albums/collections: create, view, edit, delete albums; browse memories by album
- Comments: leave text comments on any memory
- Reactions: emoji reactions (heart, laugh, wow, sad) on any memory
- Management panel (admin): add/edit/remove photos, videos, and albums
- Authorization: family members can sign in; admin role for management panel
- Blob storage: store uploaded photos and videos

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: define data types for Memory (id, blobId, mediaType, caption, albumId, uploaderId, timestamp), Album (id, name, description), Comment (id, memoryId, authorId, text, timestamp), Reaction (memoryId, userId, emoji)
2. Backend CRUD: createAlbum, updateAlbum, deleteAlbum, createMemory, updateMemory, deleteMemory, addComment, removeComment, addReaction, removeReaction, getFeed (recent memories), getMemoriesByAlbum, getAlbums
3. Components: authorization (role-based: admin vs member), blob-storage (upload photos/videos)
4. Frontend: Home feed page, Upload modal, Album browser page, Memory detail modal (comments/reactions), Admin management panel

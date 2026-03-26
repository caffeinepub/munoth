import Storage "blob-storage/Storage";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type definitions
  public type Album = {
    id : Text;
    name : Text;
    description : Text;
    creator : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type MediaType = {
    #photo;
    #video;
  };

  public type Memory = {
    id : Text;
    blob : Storage.ExternalBlob;
    mediaType : MediaType;
    caption : Text;
    albumId : ?Text;
    uploaderId : Principal;
    timestamp : Time.Time;
  };

  public type Comment = {
    id : Text;
    memoryId : Text;
    authorId : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type Reaction = {
    id : Text;
    memoryId : Text;
    userId : Principal;
    emoji : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // Data storage
  let albums = Map.empty<Text, Album>();
  let memories = Map.empty<Text, Memory>();
  let comments = Map.empty<Text, Comment>();
  let reactions = Map.empty<Text, Reaction>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextAlbumId : Nat = 0;
  var nextMemoryId : Nat = 0;
  var nextCommentId : Nat = 0;
  var nextReactionId : Nat = 0;

  // User Profile operations
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Album operations
  public shared ({ caller }) func createAlbum(name : Text, description : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create albums");
    };

    let albumId = nextAlbumId.toText();
    nextAlbumId += 1;

    let album : Album = {
      id = albumId;
      name;
      description;
      creator = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    albums.add(albumId, album);
    albumId;
  };

  public shared ({ caller }) func updateAlbum(albumId : Text, name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update albums");
    };

    switch (albums.get(albumId)) {
      case null {
        Runtime.trap("Album not found");
      };
      case (?album) {
        let updatedAlbum : Album = {
          id = album.id;
          name;
          description;
          creator = album.creator;
          createdAt = album.createdAt;
          updatedAt = Time.now();
        };
        albums.add(albumId, updatedAlbum);
      };
    };
  };

  public shared ({ caller }) func deleteAlbum(albumId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete albums");
    };

    switch (albums.get(albumId)) {
      case null {
        Runtime.trap("Album not found");
      };
      case (?_) {
        albums.remove(albumId);
      };
    };
  };

  public query ({ caller }) func getAlbumsList() : async [Album] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view albums");
    };

    albums.toArray().map(func(entry : (Text, Album)) : Album { entry.1 });
  };

  // Memory operations
  public shared ({ caller }) func createMemory(blobId : Storage.ExternalBlob, mediaType : MediaType, caption : Text, albumId : ?Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create memories");
    };

    let memoryId = nextMemoryId.toText();
    nextMemoryId += 1;

    let memory : Memory = {
      id = memoryId;
      blob = blobId;
      mediaType;
      caption;
      albumId;
      uploaderId = caller;
      timestamp = Time.now();
    };

    memories.add(memoryId, memory);
    memoryId;
  };

  public shared ({ caller }) func updateMemory(memoryId : Text, caption : Text, albumId : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update memories");
    };

    switch (memories.get(memoryId)) {
      case null {
        Runtime.trap("Memory not found");
      };
      case (?memory) {
        let updatedMemory : Memory = {
          id = memory.id;
          blob = memory.blob;
          mediaType = memory.mediaType;
          caption;
          albumId;
          uploaderId = memory.uploaderId;
          timestamp = memory.timestamp;
        };
        memories.add(memoryId, updatedMemory);
      };
    };
  };

  public shared ({ caller }) func deleteMemory(memoryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete memories");
    };

    switch (memories.get(memoryId)) {
      case null {
        Runtime.trap("Memory not found");
      };
      case (?_) {
        memories.remove(memoryId);
      };
    };
  };

  public query ({ caller }) func getFeed() : async [Memory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feed");
    };

    let memoriesArray = memories.toArray().map(func(entry : (Text, Memory)) : Memory { entry.1 });
    memoriesArray.sort(func(a : Memory, b : Memory) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    });
  };

  public query ({ caller }) func getMemoriesByAlbum(albumId : Text) : async [Memory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view memories");
    };

    let memoriesArray = memories.toArray().map(func(entry : (Text, Memory)) : Memory { entry.1 });
    let filtered = memoriesArray.filter(func(m : Memory) : Bool {
      switch (m.albumId) {
        case (?aid) { aid == albumId };
        case null { false };
      };
    });
    filtered.sort(func(a : Memory, b : Memory) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    });
  };

  // Comment operations
  public shared ({ caller }) func addComment(memoryId : Text, text : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    // Verify memory exists
    switch (memories.get(memoryId)) {
      case null {
        Runtime.trap("Memory not found");
      };
      case (?_) {};
    };

    let commentId = nextCommentId.toText();
    nextCommentId += 1;

    let comment : Comment = {
      id = commentId;
      memoryId;
      authorId = caller;
      text;
      timestamp = Time.now();
    };

    comments.add(commentId, comment);
    commentId;
  };

  public shared ({ caller }) func removeComment(commentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove comments");
    };

    switch (comments.get(commentId)) {
      case null {
        Runtime.trap("Comment not found");
      };
      case (?comment) {
        // Users can only delete their own comments, admins can delete any
        if (comment.authorId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own comments");
        };
        comments.remove(commentId);
      };
    };
  };

  // Reaction operations
  public shared ({ caller }) func addReaction(memoryId : Text, emoji : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reactions");
    };

    // Verify memory exists
    switch (memories.get(memoryId)) {
      case null {
        Runtime.trap("Memory not found");
      };
      case (?_) {};
    };

    let reactionId = nextReactionId.toText();
    nextReactionId += 1;

    let reaction : Reaction = {
      id = reactionId;
      memoryId;
      userId = caller;
      emoji;
    };

    reactions.add(reactionId, reaction);
    reactionId;
  };

  public shared ({ caller }) func removeReaction(reactionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove reactions");
    };

    switch (reactions.get(reactionId)) {
      case null {
        Runtime.trap("Reaction not found");
      };
      case (?reaction) {
        // Users can only delete their own reactions, admins can delete any
        if (reaction.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own reactions");
        };
        reactions.remove(reactionId);
      };
    };
  };
};

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Search, Bell, MoreHorizontal, Heart, MessageCircle, Share2, Plus, Pencil, Check, X } from "lucide-react";

type Media = { id: string; url: string; media_type: "image" | "video" };
type FeedPost = {
  id: string;
  content: string | null;
  created_at: string;
  user_id: string;
  profile?: { email?: string | null };
  media: Media[];
};

const CommunityPage = () => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [signInEmail, setSignInEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [commentsOpen, setCommentsOpen] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, { id: string; content: string; user_id: string; created_at: string }[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const accept = useMemo(() => ({
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    "video/*": [".mp4", ".webm", ".mov"],
  }), []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      // Fetch latest posts
      const { data: posts, error } = await (supabase as any)
        .from("posts")
        .select("id, content, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      const postIds = posts?.map(p => p.id) || [];

      // Fetch media for posts
      const { data: mediaRows, error: mediaErr } = await (supabase as any)
        .from("post_media")
        .select("id, post_id, url, media_type")
        .in("post_id", postIds);
      if (mediaErr) throw mediaErr;

      // Fetch profiles
      const userIds = Array.from(new Set(posts?.map(p => p.user_id) || []));
      const { data: profiles, error: profErr } = await (supabase as any)
        .from("profiles")
        .select("id, email")
        .in("id", userIds);
      if (profErr) throw profErr;

      const profileMap = new Map((profiles || []).map(p => [p.id, p] as const));
      const mediaByPost = new Map<string, Media[]>(postIds.map(id => [id, []]));
      (mediaRows || []).forEach(m => {
        const list = mediaByPost.get(m.post_id) || [];
        list.push({ id: m.id, url: m.url, media_type: m.media_type as Media["media_type"] });
        mediaByPost.set(m.post_id, list);
      });

      const combined: FeedPost[] = (posts || []).map(p => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at as string,
        user_id: p.user_id,
        profile: profileMap.get(p.user_id) as any,
        media: mediaByPost.get(p.id) || [],
      }));
      setFeed(combined);

      // Fetch likes for visible posts
      const { data: likeRows, error: likeErr } = await (supabase as any)
        .from("likes")
        .select("post_id, user_id")
        .in("post_id", postIds);
      if (likeErr) throw likeErr;
      const likesMap: Record<string, { count: number; liked: boolean }> = {};
      for (const pid of postIds) likesMap[pid] = { count: 0, liked: false };
      (likeRows || []).forEach((r: any) => {
        likesMap[r.post_id].count++;
        if (r.user_id === sessionUserId) likesMap[r.post_id].liked = true;
      });
      setLikes(likesMap);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to load feed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startEditPost = (postId: string, currentContent: string | null) => {
    setEditingPostId(postId);
    setEditContent(currentContent || "");
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const saveEditPost = async (postId: string) => {
    if (!sessionUserId) {
      toast({ title: "Sign in required", description: "Please sign in to edit posts", variant: "destructive" });
      return;
    }
    try {
      const { error } = await (supabase as any)
        .from("posts")
        .update({ content: editContent.trim() || null })
        .eq("id", postId)
        .eq("user_id", sessionUserId);
      if (error) throw error;
      await fetchFeed();
      setEditingPostId(null);
      setEditContent("");
      toast({ title: "Post updated", description: "Your changes have been saved" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    // track auth
    supabase.auth.getSession().then(({ data }) => {
      setSessionUserId(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSessionUserId(sess?.user?.id ?? null);
    });

    fetchFeed();

    // Real-time updates for new posts/media
    const channel = supabase
      .channel("community-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => fetchFeed()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_media" },
        () => fetchFeed()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const createPost = async () => {
    if (submitting) return;
    if (!content.trim() && files.length === 0) {
      toast({ title: "Add content or media", description: "Write something or attach images/videos" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({ title: "Sign in required", description: "Please sign in to post", variant: "destructive" });
        return;
      }
      const userId = sessionData.session.user.id;

      // Create post
      const { data: inserted, error: postErr } = await (supabase as any)
        .from("posts")
        .insert({ user_id: userId, content: content.trim() || null })
        .select("id")
        .single();
      if (postErr) throw postErr;
      const postId = inserted.id as string;

      // Upload media (if any)
      const mediaEntries: { url: string; media_type: "image" | "video" }[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const isImage = file.type.startsWith("image/");
        const mediaType = isImage ? "image" : "video";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await (supabase as any).storage
          .from("community-media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) throw uploadErr;
        const { data: pub } = (supabase as any).storage.from("community-media").getPublicUrl(path);
        mediaEntries.push({ url: pub.publicUrl, media_type: mediaType });
      }

      if (mediaEntries.length > 0) {
        const rows = mediaEntries.map(m => ({ post_id: postId, url: m.url, media_type: m.media_type }));
        const { error: mediaInsErr } = await (supabase as any).from("post_media").insert(rows);
        if (mediaInsErr) throw mediaInsErr;
      }

      setContent("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchFeed();
      toast({ title: "Posted", description: "Your update is live" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Post failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!sessionUserId) {
      toast({ title: "Sign in required", description: "Please sign in to like posts" });
      return;
    }
    const current = likes[postId] || { count: 0, liked: false };
    try {
      if (current.liked) {
        const { error } = await (supabase as any)
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", sessionUserId);
        if (error) throw error;
        setLikes({ ...likes, [postId]: { count: Math.max(0, current.count - 1), liked: false } });
      } else {
        const { error } = await (supabase as any)
          .from("likes")
          .insert({ post_id: postId, user_id: sessionUserId });
        if (error) throw error;
        setLikes({ ...likes, [postId]: { count: current.count + 1, liked: true } });
      }
    } catch (e: any) {
      toast({ title: "Like failed", description: e.message, variant: "destructive" });
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("comments")
        .select("id, content, user_id, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments({ ...comments, [postId]: data || [] });
    } catch (e: any) {
      toast({ title: "Failed to load comments", description: e.message, variant: "destructive" });
    }
  };

  const addComment = async (postId: string) => {
    if (!sessionUserId) {
      toast({ title: "Sign in required", description: "Please sign in to comment" });
      return;
    }
    const text = (newComment[postId] || "").trim();
    if (!text) return;
    try {
      const { error } = await (supabase as any)
        .from("comments")
        .insert({ post_id: postId, user_id: sessionUserId, content: text });
      if (error) throw error;
      setNewComment({ ...newComment, [postId]: "" });
      await loadComments(postId);
    } catch (e: any) {
      toast({ title: "Comment failed", description: e.message, variant: "destructive" });
    }
  };

  const signInWithEmail = async () => {
    const email = signInEmail.trim();
    if (!email) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent you a sign-in link" });
    } catch (e: any) {
      toast({ title: "Sign-in failed", description: e.message, variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#121212]/80 backdrop-blur-sm px-4 py-4 border-b border-transparent">
        <button className="h-10 w-10 flex items-center justify-center rounded-full text-white/90">
          <Search size={20} />
        </button>
        <h1 className="text-lg font-bold">Community</h1>
        <button className="relative h-10 w-10 flex items-center justify-center rounded-full text-white/90">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#121212] bg-[#FF7A00]"></span>
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="flex w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
          {[
            { id: "all", label: "All" },
            { id: "training", label: "Training Tips" },
            { id: "health", label: "Health Q&A" },
            { id: "moments", label: "Cute Moments" },
            { id: "reviews", label: "Product Reviews" },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium ${selectedCategory === cat.id ? "bg-[#FF7A00] text-[#121212]" : "bg-[#1E1E1E] text-zinc-300"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {!sessionUserId && (
          <Card className="border border-[#3F3F46] bg-[#1E1E1E] rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="text-sm text-zinc-300">Sign in to post, like, and comment</div>
              <div className="flex gap-2">
                <Input type="email" placeholder="you@example.com" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} className="bg-[#121212] border-[#3F3F46] text-white placeholder:text-zinc-500" />
                <Button onClick={signInWithEmail} disabled={authLoading} className="bg-[#FF7A00] hover:opacity-90 text-[#121212]">{authLoading ? "Sending..." : "Send magic link"}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border border-[#3F3F46] bg-[#1E1E1E] rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Textarea
                placeholder="Share something about your pet..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] bg-[#121212] border-[#3F3F46] text-white placeholder:text-zinc-500"
                ref={textareaRef}
              />
              <Input
                type="file"
                multiple
                accept={Object.keys(accept).join(",")}
                onChange={handleFileChange}
                ref={fileInputRef}
                className="bg-[#121212] border-[#3F3F46] text-white file:text-zinc-300"
              />
              <div className="flex items-center gap-3">
                <div className="text-xs text-zinc-400">
                  {files.length > 0 ? `${files.length} file(s) selected` : "You can attach images or short videos"}
                </div>
                <Button onClick={createPost} disabled={submitting || !sessionUserId} className="ml-auto bg-[#FF7A00] hover:opacity-90 text-[#121212]">
                  {submitting ? "Posting..." : "Post"}
                </Button>
                {sessionUserId && (
                  <Button variant="outline" onClick={signOut} className="bg-[#1E1E1E] text-zinc-300 border-[#3F3F46] hover:bg-[#262626]">Sign out</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[55vh] rounded-md">
          <div className="space-y-4 pr-2">
            {loading && (
              <div className="text-sm text-zinc-400 px-1">Loading feed...</div>
            )}
            {!loading && feed.length === 0 && (
              <div className="text-sm text-zinc-400 px-1">No posts yet. Be the first to share!</div>
            )}
            {feed.map((post) => (
              <Card key={post.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4 pb-2">
                    <div className="w-10 h-10 rounded-full bg-[#3F3F46]" />
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{post.profile?.email || "Pet Lover"}</p>
                      <p className="text-xs text-zinc-400">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                    {sessionUserId === post.user_id ? (
                      editingPostId === post.id ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => saveEditPost(post.id)} className="h-8 px-2 text-zinc-300 border-[#3F3F46]">
                            <Check size={16} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditPost} className="h-8 px-2 text-zinc-300 border-[#3F3F46]">
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <button onClick={() => startEditPost(post.id, post.content)} className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-white">
                          <Pencil size={18} />
                        </button>
                      )
                    ) : (
                      <button className="h-8 w-8 flex items-center justify-center text-zinc-400">
                        <MoreHorizontal size={18} />
                      </button>
                    )}
                  </div>
                  {editingPostId === post.id ? (
                    <div className="px-4 pb-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px] bg-[#121212] border-[#3F3F46] text-white placeholder:text-zinc-500"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => saveEditPost(post.id)} className="bg-[#FF7A00] hover:opacity-90 text-[#121212]">Save</Button>
                        <Button variant="outline" onClick={cancelEditPost} className="bg-[#1E1E1E] text-zinc-300 border-[#3F3F46] hover:bg-[#262626]">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    post.content && <p className="text-sm leading-relaxed whitespace-pre-wrap px-4 pb-3 text-zinc-200">{post.content}</p>
                  )}
                  {post.media.length > 0 && (
                    <div className="grid grid-cols-1 gap-0">
                      {post.media.map(m => (
                        m.media_type === "image" ? (
                          <div key={m.id} className="w-full bg-center bg-no-repeat bg-cover" style={{backgroundImage: `url(${m.url})`}}>
                            <div className="w-full" style={{paddingBottom: '56.25%'}} />
                          </div>
                        ) : (
                          <video key={m.id} src={m.url} controls className="w-full max-h-96" />
                        )
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-[#2D2D2D] p-1 px-2">
                    <div className="flex items-center">
                      <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 rounded-full p-2 ${likes[post.id]?.liked ? 'text-[#FF7A00]' : 'text-zinc-400'} hover:bg-[#FF7A00]/10 hover:text-[#FF7A00]`}>
                        <Heart size={18} className={likes[post.id]?.liked ? 'fill-[#FF7A00]' : ''} />
                        <span className="text-xs font-semibold">{likes[post.id]?.count ?? 0}</span>
                      </button>
                      <button
                        onClick={async () => {
                          const open = !commentsOpen[post.id];
                          setCommentsOpen({ ...commentsOpen, [post.id]: open });
                          if (open && !comments[post.id]) await loadComments(post.id);
                        }}
                        className="flex items-center gap-1 rounded-full p-2 text-zinc-400 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00]"
                      >
                        <MessageCircle size={18} />
                        <span className="text-xs font-semibold">{(comments[post.id] || []).length}</span>
                      </button>
                    </div>
                    <button className="flex items-center gap-1 rounded-full p-2 text-zinc-400 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00]">
                      <Share2 size={18} />
                    </button>
                  </div>
                  {commentsOpen[post.id] && (
                    <div className="pt-2 space-y-2 px-4 pb-4">
                      <div className="space-y-1">
                        {(comments[post.id] || []).map(c => (
                          <div key={c.id} className="text-sm text-zinc-300">
                            <span className="text-zinc-500 mr-2">{new Date(c.created_at).toLocaleString()}</span>
                            {c.content}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment"
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                          className="bg-[#121212] border-[#3F3F46] text-white placeholder:text-zinc-500"
                        />
                        <Button disabled={!sessionUserId || !(newComment[post.id] || "").trim()} onClick={() => addComment(post.id)} className="bg-[#FF7A00] hover:opacity-90 text-[#121212]">
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <button
        onClick={() => {
          if (textareaRef.current) textareaRef.current.focus();
          else fileInputRef.current?.click();
        }}
        className="fixed bottom-6 right-6 z-20 h-14 w-14 rounded-2xl bg-[#FF7A00] text-[#121212] shadow-lg flex items-center justify-center hover:opacity-90"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default CommunityPage;

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Community</h1>
        </div>

        {!sessionUserId && (
          <Card className="border-orange-200/60">
            <CardContent className="p-4 space-y-3">
              <div className="text-sm">Sign in to post, like, and comment</div>
              <div className="flex gap-2">
                <Input type="email" placeholder="you@example.com" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} />
                <Button onClick={signInWithEmail} disabled={authLoading}>{authLoading ? "Sending..." : "Send magic link"}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-orange-200/60">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Textarea
                placeholder="Share something about your pet..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
              <Input
                type="file"
                multiple
                accept={Object.keys(accept).join(",")}
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">
                  {files.length > 0 ? `${files.length} file(s) selected` : "You can attach images or short videos"}
                </div>
                <Button onClick={createPost} disabled={submitting || !sessionUserId} className="ml-auto">
                  {submitting ? "Posting..." : "Post"}
                </Button>
                {sessionUserId && (
                  <Button variant="secondary" onClick={signOut}>Sign out</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[55vh] rounded-md">
          <div className="space-y-4 pr-2">
            {loading && (
              <div className="text-sm text-muted-foreground px-1">Loading feed...</div>
            )}
            {!loading && feed.length === 0 && (
              <div className="text-sm text-muted-foreground px-1">No posts yet. Be the first to share!</div>
            )}
            {feed.map((post) => (
              <Card key={post.id} className="border-orange-200/60 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-200" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{post.profile?.email || "Pet Lover"}</span>
                        <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {post.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>}
                  {post.media.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                      {post.media.map(m => (
                        m.media_type === "image" ? (
                          <img key={m.id} src={m.url} alt="" className="w-full rounded-md object-cover max-h-96" />
                        ) : (
                          <video key={m.id} src={m.url} controls className="w-full rounded-md max-h-96" />
                        )
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-1">
                    <button onClick={() => toggleLike(post.id)} className="text-sm">
                      {likes[post.id]?.liked ? "♥" : "♡"} {likes[post.id]?.count ?? 0}
                    </button>
                    <button
                      onClick={async () => {
                        const open = !commentsOpen[post.id];
                        setCommentsOpen({ ...commentsOpen, [post.id]: open });
                        if (open && !comments[post.id]) await loadComments(post.id);
                      }}
                      className="text-sm"
                    >
                      Comments
                    </button>
                  </div>
                  {commentsOpen[post.id] && (
                    <div className="pt-2 space-y-2">
                      <div className="space-y-1">
                        {(comments[post.id] || []).map(c => (
                          <div key={c.id} className="text-sm">
                            <span className="text-muted-foreground mr-2">{new Date(c.created_at).toLocaleString()}</span>
                            {c.content}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment"
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        />
                        <Button disabled={!sessionUserId || !(newComment[post.id] || "").trim()} onClick={() => addComment(post.id)}>
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
    </div>
  );
};

export default CommunityPage;

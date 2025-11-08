import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthPageProps {
  onDone?: () => void;
}

const AuthPage = ({ onDone }: AuthPageProps) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setMode(m => (m === "signin" ? "signup" : "signin"));
    setMessage(null);
    setError(null);
  };

  const doEmailPassword = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!email.trim() || !password.trim()) throw new Error("Email and password required");
        if (password !== confirm) throw new Error("Passwords do not match");
        const { error } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password: password,
          options: { data: { full_name: fullName.trim() || null } }
        });
        if (error) throw error;
        setMessage("Account created. Check your email to confirm.");
        // Notify app - treat as signup to show quiz next
        window.dispatchEvent(new CustomEvent("auth-success", { detail: { signup: true } }));
        onDone?.();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setMessage("Signed in!");
        onDone?.();
        window.dispatchEvent(new CustomEvent("auth-success", { detail: { signup: false } }));
      }
    } catch (e: any) {
      setError(e?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Magic link removed per design request – email/password only

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* Animated orange background */}
      <div className="absolute inset-0 bg-[#FF7F50]">
        <div className="absolute -inset-[20%] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.18),transparent_45%)] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-sm p-6">
        <div className="bg-transparent">
          <div className="pb-6 flex flex-col items-center text-center gap-3">
            {/* App Logo */}
            <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-xl">
              <img
                src="/app-logo.png"
                alt="App logo"
                className="w-full h-full object-cover"
                onError={(e)=>{
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src.indexOf('/app-icon.png') === -1) {
                    img.src = '/app-icon.png';
                  }
                }}
              />
            </div>
            <h1 className="text-white text-3xl font-extrabold tracking-tight">
              {mode === "signin" ? "Welcome Back" : "Create Your Account"}
            </h1>
          </div>

          <div className="p-0 flex flex-col gap-3">
            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="sr-only">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e)=>setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-lg bg-white/20 border-2 border-transparent text-white placeholder-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="sr-only">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-white/20 border-2 border-transparent text-white placeholder-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="sr-only">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-white/20 border-2 border-transparent text-white placeholder-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="sr-only">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e)=>setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white/20 border-2 border-transparent text-white placeholder-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            )}

            {error && <div className="text-sm text-red-100 bg-red-500/30 border border-red-300/50 rounded-md p-2">{error}</div>}
            {message && <div className="text-sm text-emerald-100 bg-emerald-500/30 border border-emerald-300/50 rounded-md p-2">{message}</div>}

            <button
              onClick={doEmailPassword}
              disabled={loading || !email || !password || (mode === 'signup' && !confirm)}
              className="mt-2 inline-flex items-center justify-center w-full h-12 rounded-lg bg-white text-[#ea580c] font-bold tracking-wide hover:bg-gray-100 disabled:opacity-60 shadow-lg"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </button>

            <button
              onClick={toggleMode}
              className="text-center text-white text-sm mt-3 font-semibold hover:underline"
            >
              {mode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

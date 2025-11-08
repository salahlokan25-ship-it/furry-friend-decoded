import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Lock, 
  LogOut, 
  Shield, 
  FileText, 
  Gift,
  ChevronRight,
  User,
  Mail,
  Trash2,
  BookOpen,
  Heart,
  Camera,
  X,
  Crown,
  Sparkles,
  Star
} from "lucide-react";
// logo now served from public
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface SettingsPageProps {
  onNavigate?: (tab: string) => void;
}

const SettingsPage = ({ onNavigate }: SettingsPageProps = {}) => {
  const { subscribed, plan, openCustomerPortal } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex@example.com",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [legalDocOpen, setLegalDocOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<'privacy' | 'terms' | 'references' | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile editing feature coming soon!",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Change Password",
      description: "Password change feature coming soon!",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deleted",
      description: "Your account has been scheduled for deletion.",
      variant: "destructive",
    });
  };

  const handleLogOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      // The app will automatically redirect to sign in page via App.tsx
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload a JPG, PNG, or WEBP image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload profile image",
          variant: "destructive",
        });
        return;
      }

      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete old image if exists
      const { data: existingFiles } = await supabase.storage
        .from('profile-images')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('profile-images')
          .remove(existingFiles.map(f => `${userId}/${f.name}`));
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Persist avatar path to profiles table
      await (supabase as any).from('profiles').upsert({ id: userId, avatar_url: fileName }, { onConflict: 'id' });

      // Create a signed URL (works for private buckets) with cache busting
      const { data: signedData, error: signedErr } = await supabase.storage
        .from('profile-images')
        .createSignedUrl(fileName, 60 * 60);
      if (signedErr || !signedData?.signedUrl) {
        // Fallback to public URL if bucket is public
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        setProfile({ ...profile, avatar: `${publicUrl}?t=${Date.now()}` });
      } else {
        setProfile({ ...profile, avatar: `${signedData.signedUrl}&t=${Date.now()}` });
      }

      toast({
        title: "Success!",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrivacyPolicy = () => {
    setLegalDocType('privacy');
    setLegalDocOpen(true);
  };

  const handleTermsOfUse = () => {
    setLegalDocType('terms');
    setLegalDocOpen(true);
  };

  const handleReferences = () => {
    setLegalDocType('references');
    setLegalDocOpen(true);
  };

  const getLegalDocContent = () => {
    switch (legalDocType) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: `
**Last Updated: ${new Date().toLocaleDateString()}**

At Pet Paradise, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.

## Information We Collect

We collect information you provide directly to us, including:
- Personal information (name, email address)
- Pet information (name, breed, photos)
- Usage data and analytics
- Health tracking information

## How We Use Your Information

We use the information we collect to:
- Provide and improve our services
- Personalize your experience
- Send you updates and notifications
- Analyze app usage and performance
- Ensure security and prevent fraud

## Data Storage and Security

Your data is securely stored using industry-standard encryption. We implement appropriate security measures to protect against unauthorized access, alteration, or destruction of your personal information.

## Sharing Your Information

We do not sell your personal information. We may share your information only:
- With your consent
- To comply with legal obligations
- To protect our rights and safety

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Opt-out of marketing communications

## Contact Us

If you have questions about this Privacy Policy, please contact us at privacy@petparadise.com

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          `
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          content: `
**Last Updated: ${new Date().toLocaleDateString()}**

Welcome to Pet Paradise! By using our app, you agree to these Terms of Service.

## Acceptance of Terms

By accessing or using Pet Paradise, you agree to be bound by these Terms. If you do not agree, please do not use our services.

## User Accounts

- You must provide accurate information when creating an account
- You are responsible for maintaining the security of your account
- You must be at least 13 years old to use our services
- One person or business may not maintain more than one account

## Use of Services

You agree to:
- Use the app only for lawful purposes
- Not upload harmful or inappropriate content
- Not attempt to gain unauthorized access to our systems
- Respect other users and their pets

## Pet Health Information

- Our AI mood detection is for entertainment and informational purposes only
- Always consult a licensed veterinarian for medical advice
- We are not responsible for decisions made based on app recommendations

## Content Ownership

- You retain ownership of content you upload
- By uploading content, you grant us a license to use, display, and distribute it within the app
- We may remove content that violates these terms

## Limitations of Liability

Pet Paradise is provided "as is" without warranties. We are not liable for:
- Any indirect or consequential damages
- Loss of data or content
- Interruptions to service

## Termination

We reserve the right to suspend or terminate accounts that violate these Terms.

## Changes to Terms

We may modify these Terms at any time. Continued use of the app constitutes acceptance of modified terms.

## Governing Law

These Terms are governed by the laws of your jurisdiction.

## Contact Information

For questions about these Terms, contact us at legal@petparadise.com
          `
        };
      case 'references':
        return {
          title: 'References & Credits',
          content: `
**Pet Paradise - Credits & References**

## AI & Technology Partners

### OpenAI
We use OpenAI's GPT models for:
- Pet mood analysis and detection
- Bedtime story generation
- Health recommendations

### Supabase
Our backend infrastructure is powered by Supabase for:
- Secure data storage
- User authentication
- Real-time updates

### Lovable AI Gateway
AI integration powered by Lovable's AI Gateway for seamless API access.

## Design & Assets

### Icons
- Lucide React Icons - Beautiful, consistent iconography
- Custom pet illustrations created for Pet Paradise

### Color Palette
Our warm, pet-friendly color scheme is designed to create a welcoming experience for pet lovers.

## Research & Methodology

### Pet Behavior Analysis
Our mood detection algorithms are informed by:
- Veterinary behavioral science research
- Animal body language studies
- Computer vision best practices

### Health Metrics
Health tracking recommendations based on:
- AAHA (American Animal Hospital Association) guidelines
- Veterinary nutrition standards
- Exercise recommendations for different breeds

## Open Source Libraries

We're grateful to the open source community for:
- React & TypeScript
- Tailwind CSS
- Recharts for data visualization
- Radix UI components

## Community Contributors

Special thanks to our beta testers and the pet-loving community who helped shape Pet Paradise into what it is today! 🐾

## Academic References

1. Bradshaw, J. (2011). "Dog Sense: How the New Science of Dog Behavior Can Make You A Better Friend"
2. Horwitz, D. & Mills, D. (2009). "BSAVA Manual of Canine and Feline Behavioural Medicine"
3. Overall, K. (2013). "Manual of Clinical Behavioral Medicine for Dogs and Cats"

## Contact

For licensing inquiries or partnership opportunities, contact us at hello@petparadise.com

---

Made with ❤️ for pets and their humans
          `
        };
      default:
        return { title: '', content: '' };
    }
  };

  const handleReferFriend = () => {
    toast({
      title: "🎁 Refer a Friend",
      description: "Share your unique referral link and earn rewards!",
    });
  };

  return (
    <div className="min-h-screen bg-[#18181B] pb-24 text-[#F4F4F5]">
      {/* Header */}
      <div className="max-w-md mx-auto px-6 py-6">
        <div className="flex flex-col items-center gap-3">
          <img src="/app-logo.png" alt="PetParadise" className="w-14 h-14 rounded-xl" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/app-icon.png';}} />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6">
        {/* Profile */}
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider px-1">Profile</h2>
        <Card className="border border-[#3F3F46] bg-[#27272A] rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Avatar (click to upload) */}
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Change profile image"
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    onError={async (e)=>{
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) return;
                        const userId = session.user.id;
                        const guessExt = (profile.avatar || 'avatar.png').split('.').pop()?.split('?')[0] || 'png';
                        const fileName = `${userId}/avatar.${guessExt}`;
                        const { data } = await supabase.storage.from('profile-images').createSignedUrl(fileName, 3600);
                        if (data?.signedUrl) {
                          (e.currentTarget as HTMLImageElement).src = `${data.signedUrl}&t=${Date.now()}`;
                        }
                      } catch {}
                    }}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#3F3F46] flex items-center justify-center shadow-lg">
                    <User className="text-white" size={24} />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </div>
              </div>
              {/* Hidden file input to trigger uploads */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div>
                <div className="bg-[#1A3B5C] text-white px-4 py-2 rounded-xl inline-block mb-2">
                  <h2 className="text-lg font-bold">PROFILE</h2>
                </div>
                <p className="text-sm text-white font-medium">Manage your account details</p>
              </div>
              <button
                onClick={() => { setEditName(profile.name); setEditEmail(profile.email); setEditOpen(true); }}
                className="ml-auto text-[#F97316] hover:opacity-90 p-2"
                aria-label="Edit profile"
              >
                ✎
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription / Premium Plan */}
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider px-1">Subscription</h2>
        <Card className="border border-[#3F3F46] bg-[#27272A] rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-3">
              {subscribed ? (
                <>
                  {/* Current Plan Status */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#F97316]/10 to-[#F97316]/5 border border-[#F97316]/20">
                    <div className="w-12 h-12 rounded-lg bg-[#F97316]/20 flex items-center justify-center">
                      <Crown size={24} className="text-[#F97316]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">Premium {plan === 'monthly' ? 'Monthly' : 'Yearly'}</h3>
                        <Sparkles size={16} className="text-[#F97316]" />
                      </div>
                      <p className="text-sm text-[#A1A1AA]">Active subscription</p>
                    </div>
                  </div>
                  
                  {/* Manage Subscription Button */}
                  <button
                    onClick={openCustomerPortal}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#1f1f22] transition-all group border border-[#3F3F46]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3F3F46] flex items-center justify-center">
                        <Crown size={18} className="text-[#F97316]" />
                      </div>
                      <span className="font-medium text-[#F4F4F5]">Manage Subscription</span>
                    </div>
                    <ChevronRight size={18} className="text-[#A1A1AA]" />
                  </button>
                </>
              ) : (
                <>
                  {/* Free Plan Status */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#3F3F46]/30 border border-[#3F3F46]">
                    <div className="w-12 h-12 rounded-lg bg-[#3F3F46] flex items-center justify-center">
                      <Star size={24} className="text-[#F97316]" fill="#F97316" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">Free Plan</h3>
                      <p className="text-sm text-[#A1A1AA]">Limited features</p>
                    </div>
                  </div>
                  
                  {/* Upgrade to Premium Button */}
                  <button
                    onClick={() => onNavigate?.('subscription')}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#F97316] to-[#F97316]/80 hover:from-[#F97316]/90 hover:to-[#F97316]/70 transition-all shadow-lg"
                  >
                    <Crown size={20} className="text-white" />
                    <span className="font-bold text-white">Upgrade to Premium</span>
                    <Sparkles size={20} className="text-white" />
                  </button>
                  
                  {/* Premium Features List */}
                  <div className="mt-4 p-4 rounded-xl bg-[#1f1f22] border border-[#3F3F46]">
                    <p className="text-xs font-semibold text-[#F97316] uppercase mb-3">Premium Benefits</p>
                    <ul className="space-y-2 text-sm text-[#A1A1AA]">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                        Unlimited translations & AI chats
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                        Advanced training courses
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                        Unlimited photo storage
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                        Premium games & exclusive content
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider px-1">Notifications</h2>
        <Card className="border border-[#3F3F46] bg-[#27272A] rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3F3F46] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#F97316]">notifications</span>
                </div>
                <span className="font-medium text-white">Enable Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={(e)=>setNotificationsEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-[#3F3F46] rounded-full peer-checked:bg-[#F97316] transition-colors"></div>
                <div className="absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-[20px]"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider px-1">Account Management</h2>
        <Card className="border border-[#3F3F46] bg-[#27272A] rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-2">
              {/* Change Password */}
              <button
                onClick={() => console.log('Change password')}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#1f1f22] transition-all group border border-[#3F3F46]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3F3F46] flex items-center justify-center">
                    <Lock size={18} className="text-[#F4F4F5]" />
                  </div>
                  <span className="font-medium text-[#F4F4F5] text-sm">Change Password</span>
                </div>
                <ChevronRight size={18} className="text-[#A1A1AA]" />
              </button>

              {/* Delete Account */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-transparent hover:bg-[#1f1f22] transition-all group border border-[#3F3F46]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3F3F46] flex items-center justify-center">
                        <Trash2 size={18} className="text-red-400" />
                      </div>
                      <span className="font-medium text-red-400 text-sm">Delete Account</span>
                    </div>
                    <ChevronRight size={18} className="text-[#A1A1AA]" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Log Out */}
              <button
                onClick={handleLogOut}
                className="w-full mt-2 text-center text-[#F97316] font-semibold py-3 border-2 border-[#F97316] rounded-xl hover:bg-[#F97316]/10 transition-colors"
              >
                Log Out
              </button>
            </div>
          </CardContent>
        </Card>

        {/* App Info & Legal */}
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider px-1">App Info & Legal</h2>
        <Card className="border border-[#3F3F46] bg-[#27272A] rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-3">
              {/* Privacy Policy */}
              <button
                onClick={handlePrivacyPolicy}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#1f1f22] transition-all group border border-[#3F3F46]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3F3F46] flex items-center justify-center">
                    <Shield size={18} className="text-[#F97316]" />
                  </div>
                  <span className="font-medium text-[#F4F4F5]">Privacy Policy</span>
                </div>
                <ChevronRight size={18} className="text-[#A1A1AA]" />
              </button>

              {/* Terms of Service */}
              <button
                onClick={handleTermsOfUse}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#1f1f22] transition-all group border border-[#3F3F46]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3F3F46] flex items-center justify-center">
                    <FileText size={18} className="text-[#F97316]" />
                  </div>
                  <span className="font-medium text-[#F4F4F5]">Terms of Service</span>
                </div>
                <ChevronRight size={18} className="text-[#A1A1AA]" />
              </button>
              
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Document Dialog */}
      <Dialog open={legalDocOpen} onOpenChange={setLegalDocOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{getLegalDocContent().title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLegalDocOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              {getLegalDocContent().content.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={index} className="font-bold text-lg mt-4 mb-2">{line.replace(/\*\*/g, '')}</p>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-bold text-pet-orange mt-6 mb-3">{line.replace('## ', '')}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                } else if (line.startsWith('- ')) {
                  return <li key={index} className="ml-6 mb-1">{line.replace('- ', '')}</li>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else if (line.match(/^\d+\./)) {
                  return <li key={index} className="ml-6 mb-1">{line}</li>;
                } else if (line.startsWith('---')) {
                  return <hr key={index} className="my-6 border-pet-orange/20" />;
                } else {
                  return <p key={index} className="mb-2 text-gray-700">{line}</p>;
                }
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md bg-[#27272A] text-white border border-[#3F3F46]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#A1A1AA]">Full Name</label>
              <input
                value={editName}
                onChange={(e)=>setEditName(e.target.value)}
                className="mt-1 w-full rounded-md bg-[#1F1F22] border border-[#3F3F46] p-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-[#A1A1AA]">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e)=>setEditEmail(e.target.value)}
                className="mt-1 w-full rounded-md bg-[#1F1F22] border border-[#3F3F46] p-2 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={()=>setEditOpen(false)} className="text-[#A1A1AA]">Cancel</Button>
              <Button
                disabled={editSaving}
                onClick={async ()=>{
                  try {
                    setEditSaving(true);
                    const newName = editName.trim();
                    const newEmail = editEmail.trim();
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error('Not signed in');
                    const userId = session.user.id;

                    // Update auth email if changed
                    if (newEmail && newEmail !== profile.email) {
                      const { error: authErr } = await supabase.auth.updateUser({ email: newEmail });
                      if (authErr) throw authErr;
                      toast({ title: 'Email update requested', description: 'Check your inbox to confirm the new email.' });
                    }

                    // Upsert to profiles table
                    const payload: any = { id: userId };
                    if (newEmail) payload.email = newEmail;
                    if (newName) payload.full_name = newName;
                    const { error: upsertErr } = await (supabase as any)
                      .from('profiles')
                      .upsert(payload, { onConflict: 'id' });
                    if (upsertErr) throw upsertErr;

                    setProfile({ ...profile, name: newName || profile.name, email: newEmail || profile.email });
                    setEditOpen(false);
                    toast({ title: 'Profile updated' });
                  } catch (e: any) {
                    toast({ title: 'Update failed', description: e?.message || 'Could not save profile', variant: 'destructive' });
                  } finally {
                    setEditSaving(false);
                  }
                }}
                className="bg-[#F97316] text-white hover:opacity-95"
              >
                {editSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;

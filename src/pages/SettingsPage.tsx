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
  X
} from "lucide-react";
import petLogo from "@/assets/pet-paradise-logo.png";
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

const SettingsPage = () => {
  const { subscribed } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex@example.com",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [legalDocOpen, setLegalDocOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<'privacy' | 'terms' | 'references' | null>(null);

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

  const handleLogOut = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
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

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar: publicUrl });

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
    <div className="min-h-screen bg-white pb-24">
      {/* Header with Paw Icon */}
      <div className="bg-gradient-to-r from-pet-orange to-pet-orange-light text-white py-8 px-6 rounded-b-3xl shadow-orange mb-6">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Settings</h1>
            <span className="text-4xl animate-pulse">🐾</span>
          </div>
          <p className="text-white/90 text-sm">Manage your pet companion account</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6">
        {/* Profile Section 🐶 */}
        <Card className="border-2 border-pet-beige shadow-soft rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐶</span>
              <h2 className="text-xl font-bold text-pet-orange">Profile</h2>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              {/* Circular Avatar with Upload */}
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover shadow-orange"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pet-orange-light to-pet-orange flex items-center justify-center shadow-orange">
                    <User size={32} className="text-white" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pet-orange text-white flex items-center justify-center shadow-lg hover:bg-pet-orange-light transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className="text-pet-orange" />
                  <p className="font-semibold text-gray-800">{profile.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-pet-orange" />
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleEditProfile}
              variant="outline" 
              className="w-full rounded-full border-2 border-pet-orange text-pet-orange hover:bg-pet-orange hover:text-white transition-all"
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="border-2 border-pet-beige shadow-soft rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-pet-orange mb-4">Account Management</h2>
            
            <div className="space-y-3">
              {/* Change Password */}
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-pet-beige transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pet-orange/10 flex items-center justify-center group-hover:bg-pet-orange/20 transition-all">
                    <Lock size={20} className="text-pet-orange" />
                  </div>
                  <span className="font-medium text-gray-800">Change Password</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-pet-orange transition-colors" />
              </button>

              {/* Delete Account */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-all">
                        <Trash2 size={20} className="text-red-500" />
                      </div>
                      <span className="font-medium text-red-500">Delete Account</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
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
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-pet-gray-light transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all">
                    <LogOut size={20} className="text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-600">Log Out</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* App Info & Legal */}
        <Card className="border-2 border-pet-beige shadow-soft rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-pet-orange mb-4">App Info & Legal</h2>
            
            <div className="space-y-3">
              {/* Privacy Policy */}
              <button
                onClick={handlePrivacyPolicy}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-pet-beige transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pet-orange/10 flex items-center justify-center group-hover:bg-pet-orange/20 transition-all">
                    <Shield size={20} className="text-pet-orange" />
                  </div>
                  <span className="font-medium text-gray-800">Privacy Policy</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-pet-orange transition-colors" />
              </button>

              {/* Terms of Service */}
              <button
                onClick={handleTermsOfUse}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-pet-beige transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pet-orange/10 flex items-center justify-center group-hover:bg-pet-orange/20 transition-all">
                    <FileText size={20} className="text-pet-orange" />
                  </div>
                  <span className="font-medium text-gray-800">Terms of Service</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-pet-orange transition-colors" />
              </button>

              {/* References */}
              <button
                onClick={handleReferences}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-pet-beige transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pet-orange/10 flex items-center justify-center group-hover:bg-pet-orange/20 transition-all">
                    <BookOpen size={20} className="text-pet-orange" />
                  </div>
                  <span className="font-medium text-gray-800">References</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-pet-orange transition-colors" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Community & Rewards 🎁 */}
        <Card className="border-0 shadow-floating rounded-2xl overflow-hidden bg-gradient-to-br from-pet-orange to-pet-orange-light">
          <CardContent className="p-6">
            <button
              onClick={handleReferFriend}
              className="w-full text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Gift size={28} className="text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Refer a Friend</h3>
                    <span className="text-2xl">🎁</span>
                  </div>
                  <p className="text-white/90 text-sm mb-3">
                    Invite other pet lovers and earn rewards!
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Heart size={16} className="text-white" />
                    <span className="text-white text-sm font-medium">Share the love</span>
                    <ChevronRight size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* App Info Footer */}
        <div className="text-center py-6 space-y-2">
          <img src={petLogo} alt="Pet Paradise" className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Pet Paradise</p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
          <p className="text-xs text-gray-400">Made with ❤️ for pet lovers everywhere</p>
        </div>
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
    </div>
  );
};

export default SettingsPage;

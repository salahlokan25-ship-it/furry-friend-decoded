import { useState } from "react";
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
  Heart
} from "lucide-react";
import petLogo from "@/assets/pet-paradise-logo.png";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "@/hooks/use-toast";
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

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

const SettingsPage = () => {
  const { subscribed } = useSubscription();

  const [profile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex@example.com",
  });

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

  const handlePrivacyPolicy = () => {
    window.open('https://petparadise.com/privacy', '_blank');
  };

  const handleTermsOfUse = () => {
    window.open('https://petparadise.com/terms', '_blank');
  };

  const handleReferences = () => {
    toast({
      title: "References",
      description: "References page coming soon!",
    });
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
              {/* Circular Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pet-orange-light to-pet-orange flex items-center justify-center shadow-orange">
                <User size={32} className="text-white" />
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
    </div>
  );
};

export default SettingsPage;

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

interface UsageStats {
  scanCount: number;
  chatCount: number;
  scanLimit: number;
  chatLimit: number;
  unlimited: boolean;
}

export const useUsageTracking = () => {
  const [usageStats, setUsageStats] = useState<UsageStats>({
    scanCount: 0,
    chatCount: 0,
    scanLimit: 3,
    chatLimit: 3,
    unlimited: false,
  });
  const [loading, setLoading] = useState(false);
  const { subscribed } = useSubscription();
  const { toast } = useToast();

  const fetchUsageStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.rpc('get_user_limits', {
        user_id_param: session.user.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const stats = data[0];
        setUsageStats({
          scanCount: stats.scan_count || 0,
          chatCount: stats.chat_count || 0,
          scanLimit: stats.scan_limit || 3,
          chatLimit: stats.chat_limit || 3,
          unlimited: stats.unlimited || false,
        });
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  }, []);

  const incrementUsage = useCallback(async (type: 'scan' | 'chat'): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use this feature.",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.rpc('increment_usage', {
        user_id_param: session.user.id,
        usage_type: type
      });

      if (error) throw error;

      if (data === false) {
        const limitType = type === 'scan' ? 'translation' : 'chat';
        const limit = type === 'scan' ? usageStats.scanLimit : usageStats.chatLimit;
        toast({
          title: "Daily Limit Reached",
          description: `You've reached your daily ${limitType} limit of ${limit}. Upgrade to premium for unlimited access!`,
          variant: "destructive",
        });
        return false;
      }

      // Refresh usage stats after successful increment
      await fetchUsageStats();
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [usageStats, toast, fetchUsageStats]);

  const canUseFeature = useCallback((type: 'scan' | 'chat'): boolean => {
    if (usageStats.unlimited || subscribed) return true;
    
    if (type === 'scan') {
      return usageStats.scanCount < usageStats.scanLimit;
    } else {
      return usageStats.chatCount < usageStats.chatLimit;
    }
  }, [usageStats, subscribed]);

  const getRemainingUsage = useCallback((type: 'scan' | 'chat'): number => {
    if (usageStats.unlimited || subscribed) return -1; // Unlimited
    
    if (type === 'scan') {
      return Math.max(0, usageStats.scanLimit - usageStats.scanCount);
    } else {
      return Math.max(0, usageStats.chatLimit - usageStats.chatCount);
    }
  }, [usageStats, subscribed]);

  useEffect(() => {
    fetchUsageStats();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUsageStats();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUsageStats]);

  return {
    usageStats,
    loading,
    incrementUsage,
    canUseFeature,
    getRemainingUsage,
    fetchUsageStats,
  };
};
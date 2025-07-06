
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  id?: string;
  user_id: string;
  email_notifications: {
    taskUpdates: boolean;
    teamMentions: boolean;
    deadlineReminders: boolean;
  };
  push_notifications: {
    browserPush: boolean;
    mobilePush: boolean;
    soundAlerts: boolean;
  };
  privacy_settings: {
    profileVisibility: boolean;
    activityStatus: boolean;
    analyticsTracking: boolean;
  };
}

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const defaultSettings = {
          user_id: user.id,
          email_notifications: {
            taskUpdates: true,
            teamMentions: true,
            deadlineReminders: true,
          },
          push_notifications: {
            browserPush: true,
            mobilePush: false,
            soundAlerts: true,
          },
          privacy_settings: {
            profileVisibility: true,
            activityStatus: true,
            analyticsTracking: false,
          },
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
};

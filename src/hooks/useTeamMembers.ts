
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  status: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  invited_at: string | null;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteTeamMember = async (email: string, fullName: string, role: string = 'member') => {
    try {
      // First, add to database
      const { data, error } = await supabase
        .from('team_members')
        .insert([
          {
            email,
            full_name: fullName,
            role,
            status: 'pending',
            invited_by: user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Then send invitation email
      try {
        const response = await fetch('/functions/v1/send-team-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            email,
            fullName,
            role,
            inviterName: user?.email || 'Someone'
          })
        });

        if (!response.ok) {
          console.warn('Failed to send invitation email, but member was added to database');
        }
      } catch (emailError) {
        console.warn('Failed to send invitation email:', emailError);
      }

      toast({
        title: "Invitation sent!",
        description: `Invitation sent to ${email}`,
      });

      // Refresh the list
      fetchTeamMembers();
      return { success: true };
    } catch (error: any) {
      console.error('Error inviting team member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    teamMembers,
    loading,
    inviteTeamMember,
    refetch: fetchTeamMembers,
  };
};

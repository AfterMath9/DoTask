
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasksThisWeek: number;
  tasksThisMonth: number;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all tasks for the current user
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.is_completed).length || 0;
      const pendingTasks = totalTasks - completedTasks;
      const overdueTasks = tasks?.filter(task => 
        task.end_date && new Date(task.end_date) < now && !task.is_completed
      ).length || 0;
      
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Group by status
      const statusCounts = tasks?.reduce((acc: any, task) => {
        const status = task.status === 0 ? 'To Do' : task.status === 1 ? 'In Progress' : 'Done';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};

      const tasksByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number
      }));

      // Group by priority
      const priorityCounts = tasks?.reduce((acc: any, task) => {
        const priority = task.priority === 1 ? 'Low' : task.priority === 2 ? 'Medium' : 'High';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {}) || {};

      const tasksByPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count: count as number
      }));

      const tasksThisWeek = tasks?.filter(task => 
        new Date(task.created_at || '') >= oneWeekAgo
      ).length || 0;

      const tasksThisMonth = tasks?.filter(task => 
        new Date(task.created_at || '') >= oneMonthAgo
      ).length || 0;

      setAnalytics({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        tasksByStatus,
        tasksByPriority,
        tasksThisWeek,
        tasksThisMonth,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return { analytics, loading, refetch: fetchAnalytics };
};

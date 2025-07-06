
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  status: number; // 0 = todo, 1 = in progress, 2 = review, 3 = done
  createdAt: Date;
  user_id: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = data?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.custom_fields?.description || '',
        priority: task.priority === 1 ? 'low' : task.priority === 2 ? 'medium' : 'high',
        assignee: task.custom_fields?.assignee || undefined,
        status: task.status || 0,
        createdAt: new Date(task.created_at || ''),
        user_id: task.user_id || ''
      })) || [];

      setTasks(formattedTasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: taskData.title,
            user_id: user.id,
            priority: taskData.priority === 'low' ? 1 : taskData.priority === 'medium' ? 2 : 3,
            status: taskData.status,
            custom_fields: {
              description: taskData.description || '',
              assignee: taskData.assignee || null
            }
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Task created",
        description: "New task has been created successfully",
      });

      fetchTasks();
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          priority: updates.priority === 'low' ? 1 : updates.priority === 'medium' ? 2 : 3,
          status: updates.status,
          custom_fields: {
            description: updates.description || '',
            assignee: updates.assignee || null
          }
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Task updated",
        description: "Task has been updated successfully",
      });

      fetchTasks();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Task deleted",
        description: "Task has been removed successfully",
        variant: "destructive",
      });

      fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const moveTask = async (taskId: string, newStatus: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Task moved",
        description: "Task status updated successfully",
      });

      fetchTasks();
    } catch (error: any) {
      console.error('Error moving task:', error);
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    refetch: fetchTasks,
  };
};

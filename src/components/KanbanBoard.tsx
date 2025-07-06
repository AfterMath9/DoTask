import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import AddTaskDialog from "./AddTaskDialog";
import { useToast } from "@/hooks/use-toast";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard = () => {
  const { toast } = useToast();
  
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Setup project structure',
          description: 'Create initial project files and folder structure',
          priority: 'high',
          assignee: 'John Doe',
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'Design database schema',
          description: 'Plan the database structure for the application',
          priority: 'medium',
          createdAt: new Date()
        }
      ]
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: [
        {
          id: '3',
          title: 'Implement authentication',
          description: 'Add user login and registration functionality',
          priority: 'high',
          assignee: 'Jane Smith',
          createdAt: new Date()
        }
      ]
    },
    {
      id: 'review',
      title: 'Review',
      tasks: [
        {
          id: '4',
          title: 'Code review for API endpoints',
          description: 'Review the REST API implementation',
          priority: 'medium',
          assignee: 'Mike Johnson',
          createdAt: new Date()
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '5',
          title: 'Initial UI mockups',
          description: 'Create wireframes and basic UI designs',
          priority: 'low',
          createdAt: new Date()
        }
      ]
    }
  ]);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('todo');

  const moveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const fromColumn = newColumns.find(col => col.id === fromColumnId);
      const toColumn = newColumns.find(col => col.id === toColumnId);
      
      if (fromColumn && toColumn) {
        const taskIndex = fromColumn.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          const [task] = fromColumn.tasks.splice(taskIndex, 1);
          toColumn.tasks.push(task);
          
          toast({
            title: "Task moved",
            description: `Task moved to ${toColumn.title}`,
          });
        }
      }
      
      return newColumns;
    });
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    setColumns(prevColumns =>
      prevColumns.map(column =>
        column.id === selectedColumnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    );
    
    toast({
      title: "Task added",
      description: "New task has been created successfully",
    });
  };

  const editTask = (updatedTask: Task, columnId: string) => {
    setColumns(prevColumns =>
      prevColumns.map(column =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
              )
            }
          : column
      )
    );
    
    toast({
      title: "Task updated",
      description: "Task has been updated successfully",
    });
  };

  const deleteTask = (taskId: string, columnId: string) => {
    setColumns(prevColumns =>
      prevColumns.map(column =>
        column.id === columnId
          ? { ...column, tasks: column.tasks.filter(task => task.id !== taskId) }
          : column
      )
    );
    
    toast({
      title: "Task deleted",
      description: "Task has been removed successfully",
      variant: "destructive",
    });
  };

  const openAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setIsAddTaskOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
            onEditTask={editTask}
            onAddTask={() => openAddTask(column.id)}
          />
        ))}
      </div>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onAddTask={addTask}
      />
    </div>
  );
};

export default KanbanBoard;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import AddTaskDialog from "./AddTaskDialog";
import { useTasks } from "@/hooks/useTasks";

export interface Column {
  id: string;
  title: string;
  tasks: any[];
}

const RealKanbanBoard = () => {
  const { tasks, loading, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('todo');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasks.filter(task => task.status === 0)
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 1)
    },
    {
      id: 'review',
      title: 'Review',
      tasks: tasks.filter(task => task.status === 2)
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter(task => task.status === 3)
    }
  ];

  const handleMoveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
    const statusMap: { [key: string]: number } = {
      'todo': 0,
      'inprogress': 1,
      'review': 2,
      'done': 3
    };
    
    moveTask(taskId, statusMap[toColumnId]);
  };

  const handleAddTask = (task: any) => {
    const statusMap: { [key: string]: number } = {
      'todo': 0,
      'inprogress': 1,
      'review': 2,
      'done': 3
    };

    addTask({
      ...task,
      status: statusMap[selectedColumnId]
    });
  };

  const handleEditTask = (updatedTask: any, columnId: string) => {
    updateTask(updatedTask.id, updatedTask);
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    deleteTask(taskId);
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
            onMoveTask={handleMoveTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onAddTask={() => openAddTask(column.id)}
          />
        ))}
      </div>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default RealKanbanBoard;

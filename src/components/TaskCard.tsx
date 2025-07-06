
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, User, Edit2 } from "lucide-react";
import { Task } from "./KanbanBoard";
import EditTaskDialog from "./EditTaskDialog";

interface TaskCardProps {
  task: Task;
  columnId: string;
  onDelete: () => void;
  onEdit: (updatedTask: Task) => void;
}

const TaskCard = ({ task, columnId, onDelete, onEdit }: TaskCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const taskData = JSON.stringify({
      taskId: task.id,
      fromColumnId: columnId
    });
    e.dataTransfer.setData('text/plain', taskData);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Card 
        className={`cursor-move hover:shadow-lg transition-all duration-200 group ${
          isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-sm leading-tight pr-2">{task.title}</h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${getPriorityColor(task.priority)} transition-colors`}
            >
              {task.priority}
            </Badge>
            
            {task.assignee && (
              <div className="flex items-center text-xs text-muted-foreground bg-muted/50 rounded-full px-2 py-1">
                <User className="h-3 w-3 mr-1" />
                <span className="truncate max-w-16">{task.assignee}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        task={task}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onEditTask={onEdit}
      />
    </>
  );
};

export default TaskCard;


import RealKanbanBoard from "@/components/RealKanbanBoard";

const Index = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kanban Board</h1>
        <p className="text-lg text-muted-foreground">Organize your tasks with AI-powered workflow management</p>
      </div>
      <RealKanbanBoard />
    </div>
  );
};

export default Index;

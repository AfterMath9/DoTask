
import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import AddEventDialog from "@/components/AddEventDialog";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayViewOpen, setIsDayViewOpen] = useState(false);
  const { events, addEvent, loading } = useEvents();
  const { tasks } = useTasks();
  
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleAddEvent = async (eventData: any) => {
    await addEvent(eventData);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getItemsForDate = (date: Date) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayEvents = events.filter(event => {
      // Parse the event date and extract just the date part
      const eventDate = new Date(event.start_date);
      const eventYear = eventDate.getFullYear();
      const eventMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
      const eventDay = String(eventDate.getDate()).padStart(2, '0');
      const eventDateStr = `${eventYear}-${eventMonth}-${eventDay}`;
      
      return eventDateStr === dateStr;
    });
    
    const dayTasks = tasks.filter(task => {
      if (!task.end_date) return false;
      const taskDate = new Date(task.end_date);
      const taskYear = taskDate.getFullYear();
      const taskMonth = String(taskDate.getMonth() + 1).padStart(2, '0');
      const taskDay = String(taskDate.getDate()).padStart(2, '0');
      const taskDateStr = `${taskYear}-${taskMonth}-${taskDay}`;
      
      return taskDateStr === dateStr;
    });
    
    return { events: dayEvents, tasks: dayTasks };
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayViewOpen(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-lg text-muted-foreground">Schedule and track your project milestones</p>
        </div>
        <Button onClick={() => setIsAddEventOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, i) => {
                if (!date) {
                  return <div key={i} className="aspect-square p-2"></div>;
                }
                
                const { events: dayEvents, tasks: dayTasks } = getItemsForDate(date);
                const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={i} 
                    className={`aspect-square p-2 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors ${
                      isToday ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' : ''
                    } ${
                      hasItems ? 'border-accent/50 bg-accent/10' : ''
                    }`}
                    onClick={() => handleDayClick(date)}
                  >
                    <div className={`text-sm font-medium ${
                      isToday ? 'text-primary font-bold' : 'text-foreground'
                    }`}>{date.getDate()}</div>
                    {hasItems && (
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div key={event.id} className="text-xs bg-primary/20 text-primary px-1 rounded truncate border border-primary/30">
                            {event.title}
                          </div>
                        ))}
                        {dayTasks.slice(0, 2).map(task => (
                          <div key={task.id} className="text-xs bg-secondary/80 text-secondary-foreground px-1 rounded truncate border border-secondary/50">
                            {task.title}
                          </div>
                        ))}
                        {(dayEvents.length + dayTasks.length) > 2 && (
                          <div className="text-xs text-muted-foreground">+{(dayEvents.length + dayTasks.length) - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events scheduled</p>
            ) : (
              events.slice(0, 10).map(event => (
                <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <Badge variant="outline" className={getPriorityColor(event.priority)}>
                      {event.priority}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.start_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.start_date).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleAddEvent}
      />
      
      {/* Day View Dialog */}
      <Dialog open={isDayViewOpen} onOpenChange={setIsDayViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && formatDate(selectedDate)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDate && (() => {
              const { events: dayEvents, tasks: dayTasks } = getItemsForDate(selectedDate);
              
              return (
                <>
                  {dayEvents.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Events</h3>
                      <div className="space-y-2">
                        {dayEvents.map(event => (
                          <div key={event.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{event.title}</h4>
                              <Badge variant="outline" className={getPriorityColor(event.priority)}>
                                {event.priority}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.start_date).toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dayTasks.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tasks Due</h3>
                      <div className="space-y-2">
                        {dayTasks.map(task => (
                          <div key={task.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dayEvents.length === 0 && dayTasks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No events or tasks scheduled for this day
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;

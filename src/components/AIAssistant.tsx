
import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useProfile } from "@/hooks/useProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useTheme } from "@/contexts/ThemeContext";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm TaskBuddy, your AI assistant for task management and productivity. How can I help you organize your work today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addTask, deleteTask, tasks } = useTasks();
  const { addEvent, events } = useEvents();
  const { inviteTeamMember, teamMembers } = useTeamMembers();
  const { profile, updateProfile } = useProfile();
  const { settings, updateSettings } = useUserSettings();
  const { theme, setTheme, themes } = useTheme();

  const parseTaskCommand = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Extract task title
    let title = "";
    if (lowerMessage.includes('create task') || lowerMessage.includes('make task')) {
      const match = message.match(/(?:create task|make task)\s+["']?([^"']+)["']?/i);
      if (match) title = match[1].trim();
    } else if (lowerMessage.includes('task called')) {
      const match = message.match(/task called\s+["']?([^"']+)["']?/i);
      if (match) title = match[1].trim();
    }
    
    // Extract priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (lowerMessage.includes('high priority') || lowerMessage.includes('priority high')) {
      priority = 'high';
    } else if (lowerMessage.includes('low priority') || lowerMessage.includes('priority low')) {
      priority = 'low';
    }
    
    return { title, priority };
  };

  const parseEventCommand = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Extract event title
    let title = "";
    if (lowerMessage.includes('create event') || lowerMessage.includes('add event')) {
      const match = message.match(/(?:create event|add event)\s+["']?([^"']+)["']?/i);
      if (match) title = match[1].trim();
    }
    
    return { title };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      let aiResponse = "";
      const lowerMessage = currentMessage.toLowerCase();
      
      // Handle task creation
      if ((lowerMessage.includes('create') || lowerMessage.includes('make') || lowerMessage.includes('add')) && lowerMessage.includes('task')) {
        const { title, priority } = parseTaskCommand(currentMessage);
        
        if (title) {
          try {
            await addTask({
              title,
              description: `Created via AI Assistant`,
              priority,
              status: 0 // todo
            });
            aiResponse = `✅ Task "${title}" created successfully with ${priority} priority! You can find it in the Todo column of your Kanban board.`;
          } catch (error) {
            console.error('Error creating task:', error);
            aiResponse = `❌ Sorry, I couldn't create the task "${title}". Please make sure you're logged in and try again.`;
          }
        } else {
          aiResponse = "I'd be happy to create a task for you! Please specify the task title, for example: 'Create task called Review documents with high priority'";
        }
      }
      // Handle task deletion
      else if (lowerMessage.includes('delete') && lowerMessage.includes('task')) {
        const taskMatch = currentMessage.match(/delete task\s+["']?([^"']+)["']?/i);
        if (taskMatch) {
          const taskTitle = taskMatch[1].trim();
          const taskToDelete = tasks.find(t => t.title.toLowerCase().includes(taskTitle.toLowerCase()));
          
          if (taskToDelete) {
            try {
              await deleteTask(taskToDelete.id);
              aiResponse = `🗑️ Task "${taskToDelete.title}" has been deleted successfully!`;
            } catch (error) {
              console.error('Error deleting task:', error);
              aiResponse = `❌ Sorry, I couldn't delete the task "${taskToDelete.title}". Please try again.`;
            }
          } else {
            aiResponse = `❌ I couldn't find a task with the title "${taskTitle}". Please check the task name and try again.`;
          }
        } else {
          aiResponse = "To delete a task, please specify the task title, for example: 'Delete task called Review documents'";
        }
      }
      // Handle event creation
      else if ((lowerMessage.includes('create') || lowerMessage.includes('add')) && lowerMessage.includes('event')) {
        const { title } = parseEventCommand(currentMessage);
        
        if (title) {
          try {
            // Parse date from message if provided
            const dateMatch = currentMessage.match(/(?:on|for)\s+(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+\d{2,4})?|today|tomorrow|july\s+\d{1,2}|\d{1,2}\s+july)/i);
            
            let eventDate = new Date();
            let dateDescription = 'today';
            
            if (dateMatch) {
              const dateStr = dateMatch[1].toLowerCase();
              if (dateStr === 'tomorrow') {
                eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + 1);
                dateDescription = 'tomorrow';
              } else if (dateStr !== 'today') {
                // Try to parse the date
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                  eventDate = parsedDate;
                  dateDescription = eventDate.toLocaleDateString();
                } else {
                  // Handle "july 7" or "7 july" format
                  const monthDayMatch = dateStr.match(/(\d{1,2})\s+july|july\s+(\d{1,2})/);
                  if (monthDayMatch) {
                    const day = parseInt(monthDayMatch[1] || monthDayMatch[2]);
                    eventDate = new Date(2025, 6, day); // July is month 6 (0-indexed)
                    dateDescription = eventDate.toLocaleDateString();
                  }
                }
              }
            }
            
            // Ensure we use the local date without timezone issues
            const year = eventDate.getFullYear();
            const month = String(eventDate.getMonth() + 1).padStart(2, '0');
            const day = String(eventDate.getDate()).padStart(2, '0');
            const startDate = `${year}-${month}-${day}T09:00`;
            
            await addEvent({
              title,
              description: `Created via AI Assistant`,
              start_date: startDate,
              end_date: null,
              priority: 'medium'
            });
            aiResponse = `📅 Event "${title}" created successfully for ${dateDescription}! You can view and edit it in the Calendar section.`;
          } catch (error) {
            console.error('Error creating event:', error);
            aiResponse = `❌ Sorry, I couldn't create the event "${title}". Please make sure you're logged in and try again.`;
          }
        } else {
          aiResponse = "I'd be happy to create an event for you! Please specify the event title, for example: 'Create event called Team Meeting' or 'Add event called Review on July 8th'";
        }
      }
      // Handle team member invitation
      else if ((lowerMessage.includes('invite') || lowerMessage.includes('add')) && (lowerMessage.includes('member') || lowerMessage.includes('user') || lowerMessage.includes('team'))) {
        const emailMatch = currentMessage.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        const nameMatch = currentMessage.match(/(?:invite|add)\s+([^@]+?)\s+(?:to|at|with email)/i) || currentMessage.match(/name\s+([^@]+)/i);
        
        if (emailMatch) {
          const email = emailMatch[1];
          const name = nameMatch ? nameMatch[1].trim() : email.split('@')[0];
          
          try {
            await inviteTeamMember(email, name, 'member');
            aiResponse = `👥 Team invitation sent successfully to ${name} (${email})! They will receive an email invitation to join your team.`;
          } catch (error) {
            console.error('Error inviting team member:', error);
            aiResponse = `❌ Sorry, I couldn't send the invitation to ${email}. Please try again.`;
          }
        } else {
          aiResponse = "To invite a team member, please provide their email address. For example: 'Invite john.doe@example.com to the team' or 'Add member with email sarah@company.com'";
        }
      }
      // Handle theme changes
      else if (lowerMessage.includes('change theme') || lowerMessage.includes('set theme') || lowerMessage.includes('switch theme')) {
        const themeMatch = currentMessage.match(/(?:change|set|switch)\s+theme\s+(?:to\s+)?([a-zA-Z]+)/i);
        
        if (themeMatch) {
          const requestedTheme = themeMatch[1].toLowerCase();
          const availableTheme = themes.find(t => 
            t.value.toLowerCase() === requestedTheme || 
            t.label.toLowerCase().includes(requestedTheme) ||
            (requestedTheme === 'ocean' && t.value === 'blue') ||
            (requestedTheme === 'forest' && t.value === 'green') ||
            (requestedTheme === 'royal' && t.value === 'purple') ||
            (requestedTheme === 'sunset' && t.value === 'orange') ||
            (requestedTheme === 'crimson' && t.value === 'red') ||
            (requestedTheme === 'golden' && t.value === 'yellow') ||
            (requestedTheme === 'rose' && t.value === 'pink') ||
            (requestedTheme === 'aqua' && t.value === 'teal') ||
            (requestedTheme === 'deep' && t.value === 'indigo')
          );
          
          if (availableTheme) {
            try {
              setTheme(availableTheme.value);
              aiResponse = `🎨 Theme changed to ${availableTheme.label} successfully! The interface has been updated with your new theme.`;
            } catch (error) {
              console.error('Error changing theme:', error);
              aiResponse = `❌ Sorry, I couldn't change the theme. Please try again.`;
            }
          } else {
            const themeList = themes.map(t => `• ${t.label} (${t.description})`).join('\n');
            aiResponse = `❌ Theme "${requestedTheme}" not found. Available themes:\n\n${themeList}\n\nTry: 'Change theme to dark' or 'Set theme to blue'`;
          }
        } else {
          const themeList = themes.map(t => `• ${t.label} (${t.description})`).join('\n');
          aiResponse = `🎨 Available themes:\n\n${themeList}\n\nTo change theme, say: 'Change theme to [theme name]'`;
        }
      }
      // Handle profile updates
      else if (lowerMessage.includes('update profile') || lowerMessage.includes('change profile') || lowerMessage.includes('set name') || lowerMessage.includes('update name')) {
        const nameMatch = currentMessage.match(/(?:name|profile)\s+(?:to\s+)?["']?([^"']+)["']?/i);
        const bioMatch = currentMessage.match(/bio\s+(?:to\s+)?["']?([^"']+)["']?/i);
        
        if (nameMatch || bioMatch) {
          try {
            const updates: any = {};
            if (nameMatch) updates.full_name = nameMatch[1].trim();
            if (bioMatch) updates.bio = bioMatch[1].trim();
            
            await updateProfile(updates);
            const updatedFields = Object.keys(updates).map(key => 
              key === 'full_name' ? 'name' : key
            ).join(' and ');
            aiResponse = `👤 Profile ${updatedFields} updated successfully!`;
          } catch (error) {
            console.error('Error updating profile:', error);
            aiResponse = `❌ Sorry, I couldn't update your profile. Please try again.`;
          }
        } else {
          aiResponse = "To update your profile, specify what you'd like to change. For example:\n• 'Update name to John Smith'\n• 'Set bio to Software Developer'\n• 'Change profile name to Jane Doe'";
        }
      }
      // Handle settings updates
      else if (lowerMessage.includes('enable') || lowerMessage.includes('disable')) {
        const isEnable = lowerMessage.includes('enable');
        let settingUpdated = false;
        let settingName = '';
        
        if (lowerMessage.includes('notification')) {
          if (lowerMessage.includes('email')) {
            try {
              await updateSettings({
                email_notifications: {
                  ...settings?.email_notifications,
                  taskUpdates: isEnable,
                  teamMentions: isEnable,
                  deadlineReminders: isEnable
                }
              });
              settingUpdated = true;
              settingName = 'email notifications';
            } catch (error) {
              console.error('Error updating email notifications:', error);
            }
          } else if (lowerMessage.includes('push')) {
            try {
              await updateSettings({
                push_notifications: {
                  ...settings?.push_notifications,
                  browserPush: isEnable,
                  mobilePush: isEnable
                }
              });
              settingUpdated = true;
              settingName = 'push notifications';
            } catch (error) {
              console.error('Error updating push notifications:', error);
            }
          }
        }
        
        if (settingUpdated) {
          aiResponse = `⚙️ ${settingName} ${isEnable ? 'enabled' : 'disabled'} successfully!`;
        } else {
          aiResponse = "I can help you manage notification settings. Try:\n• 'Enable email notifications'\n• 'Disable push notifications'\n• 'Enable notifications'";
        }
      }
      // Handle priority questions
      else if (lowerMessage.includes('priority')) {
        aiResponse = "Task priorities help you organize work by importance:\n\n🔴 **High Priority**: Urgent tasks that need immediate attention\n🟡 **Medium Priority**: Regular work items\n🟢 **Low Priority**: Tasks that can wait\n\nYou can set priority when creating tasks or ask me to create one, like: 'Make task called Review proposal with high priority'";
      }
      // Handle general help
      else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        aiResponse = "I'm your comprehensive TaskFlow AI assistant! Here's what I can do:\n\n📝 **Tasks & Events**\n• 'Create task called [title] with [priority] priority'\n• 'Delete task called [title]'\n• 'Create event called [title]' or 'Add event called [title] on July 8th'\n\n👥 **Team Management**\n• 'Invite john@example.com to the team'\n• 'Add member with email sarah@company.com'\n\n🎨 **Themes & Customization**\n• 'Change theme to dark'\n• 'Set theme to blue'\n\n👤 **Profile & Settings**\n• 'Update name to John Smith'\n• 'Set bio to Software Developer'\n• 'Enable email notifications'\n• 'Disable push notifications'\n\nJust tell me what you'd like to do!";
      }
      // Default response
      else {
        aiResponse = "I'm your TaskFlow AI assistant! I can help you with:\n\n📝 Tasks & Events | 👥 Team Management | 🎨 Themes | 👤 Profile & Settings\n\nTry saying:\n• 'Create task called [task name]'\n• 'Add event called Meeting on July 8th'\n• 'Invite someone@email.com'\n• 'Change theme to dark'\n• 'Update my name'\n\nWhat would you like me to help you with?";
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4 text-primary" />
            TaskBuddy AI
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                  Hi! I'm TaskBuddy, your AI assistant for task management and productivity. How can I help you organize your work today?
                </div>
              </div>
            )}
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask TaskBuddy anything..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              size="sm"
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;

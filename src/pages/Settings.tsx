
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Download, Key, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { profile, updateProfile } = useProfile();
  const { settings, updateSettings } = useUserSettings();
  const { toast } = useToast();
  const { theme, setTheme, themes } = useTheme();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      const nameParts = profile.full_name?.split(' ') || ['', ''];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const fullName = `${firstName} ${lastName}`.trim();
    await updateProfile({
      full_name: fullName,
      email: email,
      bio: bio,
    });
  };

  const handleExportData = async () => {
    try {
      // Export user data
      const { data: userData } = await supabase.auth.getUser();
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userData.user?.id).single();
      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', userData.user?.id);
      const { data: eventsData } = await supabase.from('events').select('*').eq('user_id', userData.user?.id);
      
      const exportData = {
        profile: profileData,
        tasks: tasksData,
        events: eventsData,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = () => {
    toast({
      title: "Password change",
      description: "Please check your email for password reset instructions",
    });
    // Trigger password reset
    supabase.auth.resetPasswordForEmail(email);
  };

  const handleThemeSettings = () => {
    setIsThemeDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // In a real app, you'd want to delete user data first
        await supabase.auth.signOut();
        toast({
          title: "Account deletion",
          description: "Please contact support to complete account deletion",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process account deletion",
          variant: "destructive",
        });
      }
    }
  };

  const handleNotificationChange = (type: 'email' | 'push', key: string, value: boolean) => {
    if (!settings) return;
    
    if (type === 'email') {
      updateSettings({
        email_notifications: {
          ...settings.email_notifications,
          [key]: value
        }
      });
    } else {
      updateSettings({
        push_notifications: {
          ...settings.push_notifications,
          [key]: value
        }
      });
    }
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    if (!settings) return;
    
    updateSettings({
      privacy_settings: {
        ...settings.privacy_settings,
        [key]: value
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about yourself..." 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time</SelectItem>
                  <SelectItem value="pst">Pacific Time</SelectItem>
                  <SelectItem value="cst">Central Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleChangePassword}>
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleThemeSettings}>
              <Palette className="h-4 w-4 mr-2" />
              Theme Settings
            </Button>
            
            {/* Theme Selection Dialog */}
            {isThemeDialogOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Choose Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-96">
                      {themes.map((themeOption) => (
                        <div
                          key={themeOption.value}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent ${
                            theme === themeOption.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border'
                          }`}
                          onClick={() => setTheme(themeOption.value)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{themeOption.label}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {themeOption.description}
                              </div>
                            </div>
                            {theme === themeOption.value && (
                              <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4 border-t flex-shrink-0">
                      <Button
                        variant="outline"
                        onClick={() => setIsThemeDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setIsThemeDialogOpen(false);
                          toast({
                            title: "Theme Updated",
                            description: `Switched to ${themes.find(t => t.value === theme)?.label} theme`,
                          });
                        }}
                        className="flex-1"
                      >
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <Separator />
            <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="taskUpdates">Task Updates</Label>
                  <Switch 
                    id="taskUpdates" 
                    checked={settings?.email_notifications.taskUpdates || false}
                    onCheckedChange={(checked) => handleNotificationChange('email', 'taskUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="teamMentions">Team Mentions</Label>
                  <Switch 
                    id="teamMentions" 
                    checked={settings?.email_notifications.teamMentions || false}
                    onCheckedChange={(checked) => handleNotificationChange('email', 'teamMentions', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="deadlineReminders">Deadline Reminders</Label>
                  <Switch 
                    id="deadlineReminders" 
                    checked={settings?.email_notifications.deadlineReminders || false}
                    onCheckedChange={(checked) => handleNotificationChange('email', 'deadlineReminders', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Push Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="browserPush">Browser Push</Label>
                  <Switch 
                    id="browserPush" 
                    checked={settings?.push_notifications.browserPush || false}
                    onCheckedChange={(checked) => handleNotificationChange('push', 'browserPush', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mobilePush">Mobile Push</Label>
                  <Switch 
                    id="mobilePush" 
                    checked={settings?.push_notifications.mobilePush || false}
                    onCheckedChange={(checked) => handleNotificationChange('push', 'mobilePush', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="soundAlerts">Sound Alerts</Label>
                  <Switch 
                    id="soundAlerts" 
                    checked={settings?.push_notifications.soundAlerts || false}
                    onCheckedChange={(checked) => handleNotificationChange('push', 'soundAlerts', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Privacy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Switch 
                    id="profileVisibility" 
                    checked={settings?.privacy_settings.profileVisibility || false}
                    onCheckedChange={(checked) => handlePrivacyChange('profileVisibility', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="activityStatus">Activity Status</Label>
                  <Switch 
                    id="activityStatus" 
                    checked={settings?.privacy_settings.activityStatus || false}
                    onCheckedChange={(checked) => handlePrivacyChange('activityStatus', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analyticsTracking">Analytics Tracking</Label>
                  <Switch 
                    id="analyticsTracking" 
                    checked={settings?.privacy_settings.analyticsTracking || false}
                    onCheckedChange={(checked) => handlePrivacyChange('analyticsTracking', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

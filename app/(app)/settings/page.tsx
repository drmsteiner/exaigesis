"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, BookOpen } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [church, setChurch] = useState(profile?.church || "");
  const [denomination, setDenomination] = useState(profile?.denomination || "");
  const [isLoading, setIsLoading] = useState(false);
  const [theBibleSaysEnabled, setTheBibleSaysEnabled] = useState(
    profile?.builtInSources?.theBibleSays ?? true
  );

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setChurch(profile.church || "");
      setDenomination(profile.denomination || "");
      setTheBibleSaysEnabled(profile.builtInSources?.theBibleSays ?? true);
    }
  }, [profile]);

  const initials = profile?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  async function handleSave() {
    setIsLoading(true);
    try {
      await updateUserProfile({
        displayName,
        church,
        denomination,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleTheBibleSays(enabled: boolean) {
    setTheBibleSaysEnabled(enabled);
    try {
      await updateUserProfile({
        builtInSources: {
          ...profile?.builtInSources,
          theBibleSays: enabled,
        },
      });
      toast.success(
        enabled
          ? "thebiblesays.com enabled as AI source"
          : "thebiblesays.com disabled as AI source"
      );
    } catch {
      // Revert on error
      setTheBibleSaysEnabled(!enabled);
      toast.error("Failed to update AI source setting");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.photoURL || undefined} />
              <AvatarFallback className="bg-seu-red text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Pastor John Smith"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="church" className="text-sm font-medium">
                Church / Ministry
              </label>
              <Input
                id="church"
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                placeholder="First Baptist Church"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="denomination" className="text-sm font-medium">
                Denomination
              </label>
              <Input
                id="denomination"
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
                placeholder="e.g., Baptist, Methodist, Non-denominational"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-seu-red hover:bg-seu-red-hover"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Sources Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            AI Sources
          </CardTitle>
          <CardDescription>
            Control which content sources the AI can reference when helping you
            prepare sermons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">thebiblesays.com</p>
              <p className="text-sm text-muted-foreground">
                Include biblical commentary from thebiblesays.com when
                discussing relevant passages
              </p>
            </div>
            <Switch
              checked={theBibleSaysEnabled}
              onCheckedChange={handleToggleTheBibleSays}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Account Created</p>
              <p className="text-sm text-muted-foreground">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Role</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.role || "User"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

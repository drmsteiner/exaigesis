"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { SourceType, SourceFormData, getSourceTypeName } from "@/lib/types/source";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: SourceType;
  onSourceAdded?: () => void;
}

const sourceTypes: SourceType[] = [
  "commentary",
  "lexicon",
  "theology",
  "devotional",
  "custom_api",
  "rss",
];

export function AddSourceDialog({
  open,
  onOpenChange,
  initialType,
  onSourceAdded,
}: AddSourceDialogProps) {
  const { user, profile, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SourceFormData>({
    name: "",
    type: initialType || "commentary",
    url: "",
    description: "",
    isGlobal: false,
    apiKeyRequired: false,
  });
  const [apiKey, setApiKey] = useState("");

  function resetForm() {
    setFormData({
      name: "",
      type: initialType || "commentary",
      url: "",
      description: "",
      isGlobal: false,
      apiKeyRequired: false,
    });
    setApiKey("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !profile) {
      toast.error("You must be logged in to add a source");
      return;
    }

    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      // Add to externalSources collection
      const sourceRef = await addDoc(collection(db, "externalSources"), {
        ...formData,
        addedBy: user.uid,
        createdAt: serverTimestamp(),
      });

      // Add to user's sources
      const userSource = {
        sourceId: sourceRef.id,
        name: formData.name,
        type: formData.type,
        url: formData.url,
        ...(apiKey && { apiKey }),
      };

      await updateUserProfile({
        externalSources: [...(profile.externalSources || []), userSource],
      });

      toast.success("Source added successfully");
      resetForm();
      onOpenChange(false);
      onSourceAdded?.();
    } catch (error) {
      console.error("Failed to add source:", error);
      toast.error("Failed to add source");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add External Source</DialogTitle>
            <DialogDescription>
              Connect an external resource for the AI to reference during sermon
              preparation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Source Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Blue Letter Bible"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Source Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v as SourceType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getSourceTypeName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/api"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this source..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* API Key Required Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requires API Key</Label>
                <p className="text-sm text-muted-foreground">
                  Does this source require authentication?
                </p>
              </div>
              <Switch
                checked={formData.apiKeyRequired}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, apiKeyRequired: checked })
                }
              />
            </div>

            {/* API Key Input (shown when required) */}
            {formData.apiKeyRequired && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored securely and only used for your
                  requests.
                </p>
              </div>
            )}

            {/* Share Globally Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share with Community</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other users to discover and use this source
                </p>
              </div>
              <Switch
                checked={formData.isGlobal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isGlobal: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-seu-red hover:bg-seu-red-hover"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Source"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

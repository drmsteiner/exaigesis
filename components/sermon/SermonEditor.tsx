"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SermonFormData } from "@/lib/types/sermon";
import { useSermons } from "@/lib/hooks/useSermons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, X, Plus } from "lucide-react";

interface SermonEditorProps {
  initialData?: Partial<SermonFormData>;
  sermonId?: string;
  onSave?: (sermonId: string) => void;
}

export function SermonEditor({ initialData, sermonId, onSave }: SermonEditorProps) {
  const router = useRouter();
  const { createSermon, updateSermon, loading } = useSermons();

  const [title, setTitle] = useState(initialData?.title || "");
  const [scripture, setScripture] = useState(initialData?.scripture || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [outline, setOutline] = useState(initialData?.outline || "");
  const [visibility, setVisibility] = useState<"public" | "private" | "community">(
    initialData?.visibility || "private"
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");

  const isEditing = !!sermonId;

  function addTag() {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  async function handleSave() {
    if (!title.trim() || !scripture.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const data: SermonFormData = {
        title: title.trim(),
        scripture: scripture.trim(),
        content: content.trim(),
        outline: outline.trim() || undefined,
        visibility,
        tags,
      };

      if (isEditing) {
        await updateSermon(sermonId, data);
        toast.success("Sermon updated");
        onSave?.(sermonId);
      } else {
        const newId = await createSermon(data);
        toast.success("Sermon created");
        onSave?.(newId);
        router.push(`/sermons/${newId}`);
      }
    } catch {
      toast.error(isEditing ? "Failed to update sermon" : "Failed to create sermon");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Sermon" : "Create Sermon"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            placeholder="Enter sermon title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Scripture Reference */}
        <div className="space-y-2">
          <label htmlFor="scripture" className="text-sm font-medium">
            Scripture Reference <span className="text-red-500">*</span>
          </label>
          <Input
            id="scripture"
            placeholder="e.g., John 3:16-21"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter a Bible reference like &quot;Romans 8:28-39&quot; or &quot;1 Cor 13&quot;
          </p>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Visibility</label>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private - Only you can see</SelectItem>
              <SelectItem value="community">Community - SEU members can see</SelectItem>
              <SelectItem value="public">Public - Anyone can see</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Outline */}
        <div className="space-y-2">
          <label htmlFor="outline" className="text-sm font-medium">
            Outline (optional)
          </label>
          <Textarea
            id="outline"
            placeholder="I. Introduction&#10;II. Main Point 1&#10;III. Main Point 2&#10;IV. Application&#10;V. Conclusion"
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            rows={6}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Sermon Content <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="content"
            placeholder="Write your sermon content here... (Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Supports Markdown formatting for headings, bold, italic, lists, etc.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-seu-red hover:bg-seu-red-hover"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Update Sermon" : "Create Sermon"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

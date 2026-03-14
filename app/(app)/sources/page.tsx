"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, Plus, Globe, BookText, Languages, FileText, Heart, Rss, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddSourceDialog } from "@/components/sources/AddSourceDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { SourceType, getSourceTypeName } from "@/lib/types/source";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const sourceTypes: {
  type: SourceType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  examples: string;
}[] = [
  {
    type: "commentary",
    title: "Bible Commentary",
    description: "Connect to online Bible commentaries",
    icon: BookText,
    examples: "Blue Letter Bible, Bible Gateway",
  },
  {
    type: "lexicon",
    title: "Greek/Hebrew Lexicon",
    description: "Original language word studies",
    icon: Languages,
    examples: "Strong's, BDAG, BDB",
  },
  {
    type: "theology",
    title: "Theological Resources",
    description: "Systematic theology and doctrinal resources",
    icon: FileText,
    examples: "Desiring God, Gospel Coalition",
  },
  {
    type: "devotional",
    title: "Devotional Resources",
    description: "Daily devotionals and spiritual insights",
    icon: Heart,
    examples: "Our Daily Bread, Spurgeon's",
  },
  {
    type: "custom_api",
    title: "Custom API",
    description: "Any web resource or API endpoint",
    icon: Globe,
    examples: "Your church's resource library",
  },
  {
    type: "rss",
    title: "RSS Feed",
    description: "Subscribe to blog and news feeds",
    icon: Rss,
    examples: "Sermon blogs, ministry updates",
  },
];

function getIconForType(type: SourceType) {
  const sourceType = sourceTypes.find((s) => s.type === type);
  return sourceType?.icon || Globe;
}

export default function SourcesPage() {
  const { profile, updateUserProfile } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<SourceType | undefined>();

  const userSources = profile?.externalSources || [];

  // Debug: log when dialogOpen changes
  useEffect(() => {
    console.log("dialogOpen changed to:", dialogOpen);
  }, [dialogOpen]);

  function handleOpenDialog(type?: SourceType) {
    console.log("handleOpenDialog called, type:", type);
    setSelectedType(type);
    setDialogOpen(true);
    console.log("dialogOpen set to true");
  }

  async function handleRemoveSource(sourceId: string) {
    if (!profile) return;

    try {
      const updatedSources = userSources.filter((s) => s.sourceId !== sourceId);
      await updateUserProfile({ externalSources: updatedSources });
      toast.success("Source removed");
    } catch {
      toast.error("Failed to remove source");
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Library className="h-8 w-8 text-seu-red" />
            External Sources
          </h1>
          <p className="text-muted-foreground">
            Connect external resources for the AI to reference during sermon prep
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-seu-red hover:bg-seu-red-hover text-white"
          onClick={() => {
            alert("Native button clicked!");
            handleOpenDialog();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </button>
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="my">My Sources</TabsTrigger>
          <TabsTrigger value="browse">Browse Global</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {userSources.length === 0 ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>No Sources Connected</CardTitle>
                <CardDescription>
                  Add external sources to give the AI more context during sermon preparation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {userSources.map((source) => {
                const Icon = getIconForType(source.type);
                return (
                  <Card key={source.sourceId}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-seu-red-light flex items-center justify-center">
                            <Icon className="h-5 w-5 text-seu-red" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{source.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getSourceTypeName(source.type)}
                              </Badge>
                            </CardDescription>
                            <p className="text-xs text-muted-foreground mt-2 truncate max-w-[250px]">
                              {source.url}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-600"
                          onClick={() => handleRemoveSource(source.sourceId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Available Source Types</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sourceTypes.map((source) => (
              <Card
                key={source.type}
                className="hover:shadow-lg transition-shadow cursor-pointer hover:border-seu-red/50"
                onClick={() => handleOpenDialog(source.type)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <source.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{source.title}</CardTitle>
                      <CardDescription>{source.description}</CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        Examples: {source.examples}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>Global Sources</CardTitle>
              <CardDescription>
                Browse sources shared by the exAIgesis community. Coming soon!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Community-curated sources will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddSourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialType={selectedType}
      />
    </div>
  );
}

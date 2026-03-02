"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, Plus, Globe, BookText, Languages, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sourceTypes = [
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
    type: "custom",
    title: "Custom URL",
    description: "Any web resource or API endpoint",
    icon: Globe,
    examples: "Your church's resource library",
  },
];

export default function SourcesPage() {
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
        <Button className="bg-seu-red hover:bg-seu-red-hover">
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="my">My Sources</TabsTrigger>
          <TabsTrigger value="browse">Browse Global</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>No Sources Connected</CardTitle>
              <CardDescription>
                Add external sources to give the AI more context during sermon preparation.
              </CardDescription>
            </CardHeader>
          </Card>

          <h2 className="text-xl font-semibold mb-4">Available Source Types</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sourceTypes.map((source) => (
              <Card key={source.type} className="hover:shadow-lg transition-shadow cursor-pointer">
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
    </div>
  );
}

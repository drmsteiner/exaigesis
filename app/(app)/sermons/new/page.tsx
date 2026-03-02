"use client";

import { SermonEditor } from "@/components/sermon/SermonEditor";
import { BookOpen } from "lucide-react";

export default function NewSermonPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-seu-red" />
          Create New Sermon
        </h1>
        <p className="text-muted-foreground">
          Write and save a new sermon to your collection
        </p>
      </div>

      <SermonEditor />
    </div>
  );
}

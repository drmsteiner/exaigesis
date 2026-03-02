"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export default function MySermonsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-seu-red" />
            My Sermons
          </h1>
          <p className="text-muted-foreground">
            View and manage your saved sermons
          </p>
        </div>
        <Link href="/prep">
          <Button className="bg-seu-red hover:bg-seu-red-hover">
            <Plus className="mr-2 h-4 w-4" />
            New Sermon
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Sermons Yet</CardTitle>
          <CardDescription>
            Start your first sermon prep session to see your sermons here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/prep">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Sermon
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

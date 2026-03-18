import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, BookOpen } from "lucide-react";

export default async function ContentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const modules = await db.module.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: {
        orderBy: { sortOrder: "asc" },
        include: {
          contentVersions: {
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">Content Management</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage modules, lessons, and their content versions.
        </p>
      </div>

      {modules.map((mod) => (
        <Card key={mod.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#002060]">
              <BookOpen className="h-5 w-5" />
              Module {mod.sortOrder}: {mod.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Lesson Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Version</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mod.lessons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--muted-foreground)] py-4">
                      No lessons in this module.
                    </TableCell>
                  </TableRow>
                )}
                {mod.lessons.map((lesson) => {
                  const latest = lesson.contentVersions[0];
                  const isPublished = !!latest?.publishedAt;
                  return (
                    <TableRow key={lesson.id}>
                      <TableCell>{lesson.sortOrder}</TableCell>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell className="font-mono text-sm">{lesson.slug}</TableCell>
                      <TableCell className="text-center">
                        {latest ? `v${latest.version}` : "--"}
                      </TableCell>
                      <TableCell className="text-center">
                        {isPublished ? (
                          <Badge className="bg-emerald-600">Published</Badge>
                        ) : latest ? (
                          <Badge variant="secondary">Draft</Badge>
                        ) : (
                          <Badge variant="outline">No Content</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/content/${lesson.id}`}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit Content
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {modules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-[var(--muted-foreground)]">
            No modules found. Seed the database to add course content.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

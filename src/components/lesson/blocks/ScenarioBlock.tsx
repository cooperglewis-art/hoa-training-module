"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ScenarioBlockProps {
  title: string;
  situation: string;
  revealText: string;
}

export function ScenarioBlock({ title, situation, revealText }: ScenarioBlockProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card className="border-[var(--accent)]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-foreground)]">
            S
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="leading-relaxed text-[var(--foreground)]">{situation}</p>

        {!revealed && (
          <Button
            variant="outline"
            onClick={() => setRevealed(true)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Reveal Answer
          </Button>
        )}

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-md border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
                <p className="text-sm font-medium text-[var(--primary)] mb-1">
                  Answer
                </p>
                <p className="text-sm leading-relaxed text-[var(--foreground)]">
                  {revealText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

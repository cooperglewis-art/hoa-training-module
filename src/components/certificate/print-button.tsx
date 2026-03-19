"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button size="lg" variant="outline" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" />
      Print
    </Button>
  );
}

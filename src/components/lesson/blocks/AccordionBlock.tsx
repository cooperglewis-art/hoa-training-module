"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionBlockProps {
  items: { title: string; content: string }[];
}

export function AccordionBlock({ items }: AccordionBlockProps) {
  return (
    <AccordionPrimitive.Root type="multiple" className="space-y-2">
      {items.map((item, index) => (
        <AccordionPrimitive.Item
          key={index}
          value={`item-${index}`}
          className="rounded-lg border border-[var(--border)] overflow-hidden"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
              className={cn(
                "flex flex-1 items-center justify-between px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-[var(--muted)]",
                "[&[data-state=open]>svg]:rotate-180"
              )}
            >
              {item.title}
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-4 pb-3 leading-relaxed text-[var(--muted-foreground)]">
              {item.content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

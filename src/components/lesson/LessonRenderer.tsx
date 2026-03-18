"use client";

import type { ContentBlock, OrgType } from "@/types/content";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ProseBlock } from "./blocks/ProseBlock";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { StatuteCalloutBlock } from "./blocks/StatuteCalloutBlock";
import { ScenarioBlock } from "./blocks/ScenarioBlock";
import { KnowledgeCheckBlock } from "./blocks/KnowledgeCheckBlock";
import { ComparisonTableBlock } from "./blocks/ComparisonTableBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";
import { AccordionBlock } from "./blocks/AccordionBlock";
import { DragDropMatchBlock } from "./blocks/DragDropMatchBlock";
import { CheckpointBlock } from "./blocks/CheckpointBlock";

interface LessonRendererProps {
  blocks: ContentBlock[];
  orgType: OrgType;
}

export function LessonRenderer({ blocks, orgType }: LessonRendererProps) {
  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        switch (block.type) {
          case "heading":
            return <HeadingBlock key={key} level={block.level} text={block.text} />;

          case "prose":
            return <ProseBlock key={key} html={block.html} />;

          case "callout":
            return (
              <CalloutBlock
                key={key}
                variant={block.variant}
                title={block.title}
                body={block.body}
              />
            );

          case "statute-callout":
            // Filter by orgType
            if (!block.appliesTo.includes(orgType)) {
              return null;
            }
            return (
              <StatuteCalloutBlock
                key={key}
                statute={block.statute}
                summary={block.summary}
                appliesTo={block.appliesTo}
              />
            );

          case "scenario":
            return (
              <ScenarioBlock
                key={key}
                title={block.title}
                situation={block.situation}
                revealText={block.revealText}
              />
            );

          case "knowledge-check":
            return (
              <KnowledgeCheckBlock
                key={key}
                question={block.question}
                options={block.options}
                correctIndex={block.correctIndex}
                explanation={block.explanation}
              />
            );

          case "comparison-table":
            return (
              <ComparisonTableBlock
                key={key}
                headers={block.headers}
                rows={block.rows}
              />
            );

          case "timeline":
            return <TimelineBlock key={key} steps={block.steps} />;

          case "accordion":
            return <AccordionBlock key={key} items={block.items} />;

          case "drag-drop-match":
            return <DragDropMatchBlock key={key} pairs={block.pairs} />;

          case "checkpoint":
            return (
              <CheckpointBlock
                key={key}
                question={block.question}
                options={block.options}
                correctIndex={block.correctIndex}
                gateNext={block.gateNext}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

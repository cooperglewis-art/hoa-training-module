"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportLearnersCSV } from "@/app/actions/admin";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportCSVButtonProps {
  orgId: string;
}

export function ExportCSVButton({ orgId }: ExportCSVButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = await exportLearnersCSV(orgId);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `learners-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Export ready",
        description: "Learner CSV downloaded successfully.",
      });
    } catch (err) {
      console.error("Export failed:", err);
      toast({
        title: "Export failed",
        description: "Unable to export learners right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}


import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArticleStatus } from "@/types/types";

export const WikiStatusBadge: React.FC<{ status: ArticleStatus }> = ({ status }) => {
  let className = "";
  let label = status;

  switch (status) {
    case "published":
      className = "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100";
      break;
    case "pending":
      className = "bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-100";
      break;
    case "rejected":
      className = "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100";
      break;
    default:
      className = "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100";
  }

  return <Badge className={className}>{label}</Badge>;
};

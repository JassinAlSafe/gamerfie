import React from "react";
import { CompactReviewCard } from "./CompactReviewCard";
import { DefaultReviewCard } from "./DefaultReviewCard";
import { ReviewCardProps } from "./types";

interface MainReviewCardProps extends ReviewCardProps {
  variant?: "default" | "compact";
}

export function ReviewCard({
  variant = "default",
  ...props
}: MainReviewCardProps) {
  switch (variant) {
    case "compact":
      return <CompactReviewCard {...props} />;
    default:
      return <DefaultReviewCard {...props} />;
  }
}

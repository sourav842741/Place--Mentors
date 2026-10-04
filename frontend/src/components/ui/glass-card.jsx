import React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

/**
 * Modern Clean Card (Replaced AI-glow glassmorphism with professional EdTech surface)
 */
const GlassCard = React.forwardRef(({ className, children, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "group relative overflow-hidden bg-surface border border-border shadow-soft hover:shadow-subtle hover:border-primary/40 rounded-xl transition-all duration-200",
      className
    )}
    {...props}
  >
    {children}
  </Card>
));
GlassCard.displayName = "GlassCard";

export { GlassCard };
export const GlassCardHeader = CardHeader;
export const GlassCardTitle = CardTitle;
export const GlassCardDescription = CardDescription;
export const GlassCardContent = CardContent;

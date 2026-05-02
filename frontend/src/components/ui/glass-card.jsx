import React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

const GlassCard = React.forwardRef(({ className, children, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl hover:shadow-indigo-500/25 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] ring-0 hover:ring-2 hover:ring-indigo-500/30 rounded-3xl border-opacity-50",
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

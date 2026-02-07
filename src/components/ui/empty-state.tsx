"use client";

import { FileQuestion, Users, Calendar, BarChart3 } from "lucide-react";

const icons = {
  students: Users,
  slots: Calendar,
  stats: BarChart3,
  default: FileQuestion,
};

export function EmptyState({
  icon = "default",
  title,
  description,
}: {
  icon?: keyof typeof icons;
  title: string;
  description?: string;
}) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-12 h-12 text-stone mb-4" />
      <h3 className="text-lg font-semibold text-navy mb-1">{title}</h3>
      {description && (
        <p className="text-warmGrey text-sm max-w-md">{description}</p>
      )}
    </div>
  );
}

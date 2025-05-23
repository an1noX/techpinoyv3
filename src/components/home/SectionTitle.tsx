
import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}

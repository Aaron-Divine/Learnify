'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/types';
import { formatPrice, CURRENCY_MAP } from '@/lib/currencies';
import { Play, Sparkles, Clock, Globe } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const currency = CURRENCY_MAP[course.currency_code] || {
    flag: '🌐',
    code: course.currency_code,
  };

  const formattedDate = new Date(course.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden glass-panel glow-card transition-all duration-300">
      {/* Showcase Thumbnail with Hover Play Effect */}
      <Link href={`/course/${course.id}`} className="relative block aspect-video overflow-hidden bg-brand-navy-dark">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={course.thumbnail_url.startsWith('/uploads') || course.thumbnail_url.startsWith('http')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-navy-card to-brand-navy-dark">
            <span className="text-muted text-sm">No Preview Image</span>
          </div>
        )}

        {/* Gradient Overlay & Hover Play Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-brand-cyan/90 text-brand-navy flex items-center justify-center shadow-glow-cyan">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Currency Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
          <span>{currency.flag}</span>
          <span>{course.currency_code}</span>
        </div>
      </Link>

      {/* Course Details */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/course/${course.id}`} className="block">
          <h3 className="font-bold text-base text-foreground group-hover:text-brand-cyan transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>
        </Link>

        <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed flex-1">
          {course.summary}
        </p>

        {/* Meta / Date */}
        <div className="flex items-center gap-2 mt-4 text-[11px] text-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>Added {formattedDate}</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-border">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">
              Price ({course.currency_code})
            </span>
            <span className="text-xl font-extrabold text-brand-orange">
              {formatPrice(course.price, course.currency_code)}
            </span>
          </div>

          <Link
            href={`/course/${course.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-brand-navy border border-brand-cyan/30"
          >
            <span>Explore</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

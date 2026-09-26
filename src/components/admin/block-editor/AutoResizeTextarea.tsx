"use client";

import React, { useRef, useEffect, useCallback, useImperativeHandle } from "react";

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ value, onChange, className, rows = 1, ...props }, forwardedRef) => {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Resize on value change (initial load / prop changes)
  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={innerRef}
      rows={rows}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      className={className}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

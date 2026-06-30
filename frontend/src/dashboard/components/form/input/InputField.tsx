import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function InputField({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white ${className}`}
      {...props}
    />
  );
}

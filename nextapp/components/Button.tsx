'use client';

import { twMerge } from 'tailwind-merge';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: React.ReactNode;
};

export const Button = ({ className, children, ...resrProps }: ButtonProps) => {
  return (
    <button
      className={twMerge(
        'bg-brand w-max text-white font-semibold px-3 text-[15px] py-[10px] rounded-lg cursor-pointer tracking-[.005em] hover:bg-brand-700 transition-all ease-in duration-150 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500',
        className
      )}
      {...resrProps}
    >
      {children}
    </button>
  );
};

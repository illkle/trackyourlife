import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useCSSVariable } from 'uniwind';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useIconColor = (inverted?: boolean) => {
  const color = useCSSVariable(
    inverted ? '--color-primary-foreground' : '--color-primary'
  );

  return color as string;
};

declare module 'rtl-detect' {
  export function getLangDir(locale: string): 'rtl' | 'ltr';
  export function isRtlLang(locale: string): boolean;
  export function getLangList(): string[];
} 
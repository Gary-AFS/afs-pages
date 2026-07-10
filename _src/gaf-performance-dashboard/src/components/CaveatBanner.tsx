// src/components/CaveatBanner.tsx
interface CaveatBannerProps {
  text: string;
}

export function CaveatBanner({ text }: CaveatBannerProps) {
  return (
    <p className="text-xs text-gray-500 italic bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2">
      {text}
    </p>
  );
}

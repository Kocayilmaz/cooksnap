"use client";

interface IngredientTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IngredientTextInput({ value, onChange }: IngredientTextInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Elindeki malzemeler (fotoğraf yerine veya fotoğrafla birlikte)
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Örn: 2 yumurta, bir avuç ıspanak, biraz peynir"
        rows={3}
        className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-orange dark:border-zinc-700"
      />
    </div>
  );
}

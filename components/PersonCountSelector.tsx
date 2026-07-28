"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { decrementPersonCount, incrementPersonCount } from "@/lib/redux/personCountSlice";

export default function PersonCountSelector() {
  const count = useAppSelector((state) => state.personCount.value);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground dark:text-zinc-300">
        Kaç kişilik?
      </span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => dispatch(decrementPersonCount())}
          aria-label="Kişi sayısını azalt"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border text-xl leading-none hover:border-brand-orange hover:text-brand-orange dark:border-zinc-700"
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-semibold text-brand-orange">{count}</span>
        <button
          type="button"
          onClick={() => dispatch(incrementPersonCount())}
          aria-label="Kişi sayısını artır"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border text-xl leading-none hover:border-brand-orange hover:text-brand-orange dark:border-zinc-700"
        >
          +
        </button>
      </div>
    </div>
  );
}

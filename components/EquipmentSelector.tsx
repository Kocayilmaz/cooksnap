"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleEquipment, EQUIPMENT_LABELS, type Equipment } from "@/lib/redux/equipmentSlice";

export default function EquipmentSelector() {
  const equipment = useAppSelector((state) => state.equipment);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground dark:text-zinc-300">
        Elinde ne var?
      </span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((key) => {
          const active = equipment[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => dispatch(toggleEquipment(key))}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-orange bg-brand-orange text-white"
                  : "border-surface-border text-foreground hover:bg-surface-warm dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {EQUIPMENT_LABELS[key]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

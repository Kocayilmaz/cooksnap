import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface-warm px-4 py-12 text-brand-orange dark:bg-black">
      <LoadingSpinner size={24} />
    </div>
  );
}

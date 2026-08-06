interface RecipeVideoEmbedProps {
  videoId: string;
  title: string;
}

export default function RecipeVideoEmbed({ videoId, title }: RecipeVideoEmbedProps) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={`${title} tarif videosu`}
        allowFullScreen
        loading="lazy"
        className="aspect-video w-full"
      />
    </div>
  );
}

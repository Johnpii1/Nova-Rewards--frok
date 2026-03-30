export default function RewardCardSkeleton() {
  return (
    <div className="card reward-card-skeleton" aria-hidden="true">
      <div className="skeleton shimmer reward-image-skeleton" />
      <div className="skeleton shimmer reward-title-skeleton" />
      <div className="skeleton shimmer reward-line-skeleton" />
      <div className="skeleton shimmer reward-line-skeleton short" />
      <div className="skeleton shimmer reward-button-skeleton" />
    </div>
  );
}

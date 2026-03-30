'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Individual reward card component.
 * Displays reward image, name, point cost, stock status, and redeem button.
 */
export default function RewardCard({
  reward,
  userPoints,
  onRedeem,
  isLoading,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const cost = reward.pointCost ?? reward.cost ?? 0;
  const imageUrl = reward.image ?? reward.image_url;
  const canAfford = userPoints >= cost;
  const inStock = reward.stock > 0;
  const isDisabled = !canAfford || !inStock || isLoading;

  return (
    <div className="reward-card">
      <div className="reward-image-container">
        {imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="reward-image-placeholder shimmer" aria-hidden="true" />
            )}
            <img
              src={imageUrl}
              alt={reward.name}
              className={`reward-image ${imageLoaded ? 'is-visible' : 'is-hidden'}`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="reward-image-placeholder">No Image</div>
        )}
        {!inStock && <div className="reward-badge reward-badge-out-of-stock">Out of Stock</div>}
      </div>

      <div className="reward-content">
        <h3 className="reward-name">{reward.name}</h3>

        {reward.description && (
          <p className="reward-description">{reward.description}</p>
        )}

        <div className="reward-meta">
          <div className="reward-cost">
            <span className="reward-cost-label">Cost:</span>
            <span className="reward-cost-value">{cost} pts</span>
          </div>

          {reward.stock !== null && (
            <div className="reward-stock">
              <span className="reward-stock-label">Stock:</span>
              <span className={`reward-stock-value ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                {reward.stock}
              </span>
            </div>
          )}
        </div>

        {!canAfford && inStock && (
          <p className="reward-error">
            You need {cost - userPoints} more points
          </p>
        )}
      </div>

      <button
        className="btn btn-primary reward-button"
        onClick={() => onRedeem(reward)}
        disabled={isDisabled}
        aria-label={`Redeem ${reward.name}`}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
            <LoadingSpinner label="Processing redemption" size="sm" inline />
            Processing...
          </span>
        ) : 'Redeem'}
      </button>
    </div>
  );
}

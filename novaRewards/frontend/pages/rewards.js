'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import ConfirmationModal from '../components/ConfirmationModal';
import RewardCard from '../components/RewardCard';
import RewardCardSkeleton from '../components/RewardCardSkeleton';
import LoadingSpinner from '../components/LoadingSpinner';
import { withAuth } from '../context/AuthContext';
import { getRewards, redeemReward } from '../lib/api';
import { useLoadingStore } from '../store/loadingStore';

/**
 * Rewards page - displays available rewards catalogue
 * Requirements: 164.2, #166
 */
function RewardsContent() {
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('points-asc');

  const isContentLoading = useLoadingStore((state) => state.contentLoading.rewards);
  const isRedeeming = useLoadingStore((state) => state.asyncOperations.redeemReward);
  const visibleCount = useLoadingStore((state) => state.progressive.rewardsVisibleCount);
  const setContentLoading = useLoadingStore((state) => state.setContentLoading);
  const setAsyncOperation = useLoadingStore((state) => state.setAsyncOperation);
  const resetProgressiveLoading = useLoadingStore((state) => state.resetProgressiveLoading);
  const loadNextBatch = useLoadingStore((state) => state.loadNextBatch);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setContentLoading('rewards', true);
      setError('');
      const data = await getRewards();
      setRewards(data.rewards || []);
      setUserPoints(data.userPoints || 0);
      resetProgressiveLoading('rewards');
    } catch (err) {
      setError(err.message || 'Failed to load rewards');
    } finally {
      setContentLoading('rewards', false);
    }
  };

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;

    try {
      setAsyncOperation('redeemReward', true);
      setError('');
      await redeemReward(selectedReward.id);

      // Optimistically update local state
      setUserPoints((prev) => prev - selectedReward.pointCost);
      setRewards((prev) =>
        prev.map((r) =>
          r.id === selectedReward.id
            ? { ...r, stock: r.stock - 1 }
            : r
        )
      );

      setSuccessMessage(`Successfully redeemed ${selectedReward.name}!`);
      setShowModal(false);
      setSelectedReward(null);

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to redeem reward');
    } finally {
      setAsyncOperation('redeemReward', false);
    }
  };

  const getCategories = () => {
    const cats = new Set(rewards.map((r) => r.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  };

  const getFilteredAndSortedRewards = () => {
    let filtered = rewards;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'points-asc') return a.pointCost - b.pointCost;
      if (sortBy === 'points-desc') return b.pointCost - a.pointCost;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return sorted;
  };

  const allVisibleRewards = getFilteredAndSortedRewards();
  const progressivelyVisibleRewards = allVisibleRewards.slice(0, visibleCount);
  const hasMoreRewards = visibleCount < allVisibleRewards.length;

  useEffect(() => {
    if (isContentLoading || !hasMoreRewards) return undefined;

    const timer = setTimeout(() => {
      loadNextBatch('rewards');
    }, 180);

    return () => clearTimeout(timer);
  }, [isContentLoading, hasMoreRewards, visibleCount, loadNextBatch]);

  const canAfford = (reward) => userPoints >= reward.pointCost;
  const isInStock = (reward) => reward.stock > 0;
  const canRedeem = (reward) => canAfford(reward) && isInStock(reward);

  return (
    <DashboardLayout>
      <div className="dashboard-content" aria-busy={isContentLoading}>
        {successMessage && (
          <div className="success" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--badge-green-bg)', borderRadius: '8px' }} aria-live="polite">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="error" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(220, 38, 38, 0.1)', borderRadius: '8px' }} role="alert">
            {error}
          </div>
        )}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2>🎁 Rewards Catalogue</h2>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {isContentLoading && <LoadingSpinner label="Loading rewards" size="sm" inline />}
              Your Points: <span style={{ color: 'var(--accent)' }}>{userPoints}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <label className="label">Category:</label>
              <select
                className="input"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  resetProgressiveLoading('rewards');
                }}
                style={{ marginBottom: 0 }}
                disabled={isContentLoading}
              >
                {getCategories().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Sort By:</label>
              <select
                className="input"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  resetProgressiveLoading('rewards');
                }}
                style={{ marginBottom: 0 }}
                disabled={isContentLoading}
              >
                <option value="points-asc">Points: Low to High</option>
                <option value="points-desc">Points: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rewards-grid" aria-live="polite">
          {isContentLoading
            ? Array.from({ length: 6 }).map((_, index) => <RewardCardSkeleton key={`skeleton-${index}`} />)
            : progressivelyVisibleRewards.map((reward) => (
                <div key={reward.id} className="card">
                  <RewardCard
                    reward={reward}
                    userPoints={userPoints}
                    onRedeem={handleRedeemClick}
                    isLoading={isRedeeming && selectedReward?.id === reward.id}
                  />
                  {!canRedeem(reward) && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {!isInStock(reward) ? 'Out of stock' : 'Insufficient points'}
                    </p>
                  )}
                </div>
              ))}
        </div>

        {!isContentLoading && hasMoreRewards && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1.25rem 0' }}>
            <LoadingSpinner label="Loading more rewards" />
          </div>
        )}

        {!isContentLoading && allVisibleRewards.length === 0 && (
          <div className="card">
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
              No rewards available in this category.
            </p>
          </div>
        )}
      </div>

      {showModal && selectedReward && (
        <ConfirmationModal
          title="Confirm Redemption"
          message={
            <div>
              <p style={{ marginBottom: '1rem' }}>Are you sure you want to redeem this reward?</p>
              <div className="confirmation-details">
                <p><strong>Reward:</strong> {selectedReward.name}</p>
                <p><strong>Cost:</strong> {selectedReward.pointCost} points</p>
                <p><strong>Your Balance:</strong> {userPoints} points</p>
                <p><strong>After Redemption:</strong> {userPoints - selectedReward.pointCost} points</p>
              </div>
            </div>
          }
          onConfirm={handleConfirmRedeem}
          onCancel={() => {
            if (isRedeeming) return;
            setShowModal(false);
            setSelectedReward(null);
          }}
          confirmText={isRedeeming ? 'Redeeming...' : 'Confirm'}
          confirmDisabled={isRedeeming}
        />
      )}
    </DashboardLayout>
  );
}

function Rewards() {
  return (
    <ErrorBoundary>
      <RewardsContent />
    </ErrorBoundary>
  );
}

export default withAuth(Rewards);

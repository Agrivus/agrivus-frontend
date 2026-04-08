import React from "react";

interface ClaimPendingBannerProps {
  claimMatch: {
    unregisteredFarmerName: string;
    matchedBy: string;
  };
}

/**
 * Show this banner on the Dashboard page when a newly registered farmer
 * has a pending profile claim.
 *
 * Usage in Dashboard.tsx:
 *   const claimMatch = JSON.parse(localStorage.getItem("claimMatch") ?? "null");
 *   {claimMatch && <ClaimPendingBanner claimMatch={claimMatch} onDismiss={() => { localStorage.removeItem("claimMatch"); }} />}
 */
const ClaimPendingBanner: React.FC<ClaimPendingBannerProps & { onDismiss: () => void }> = ({
  claimMatch,
  onDismiss,
}) => {
  return (
    <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🌾</div>
        <div className="flex-1">
          <h3 className="font-bold text-purple-900 mb-1">
            A crop profile may belong to you
          </h3>
          <p className="text-purple-800 text-sm">
            We found an existing profile for <strong>"{claimMatch.unregisteredFarmerName}"</strong> that
            matches your {claimMatch.matchedBy === "phone" ? "phone number" : "name"}.
            Your claim has been submitted and is pending admin approval.
          </p>
          <p className="text-purple-600 text-xs mt-2">
            Once approved, your crop tracking history will be linked to your account.
            You'll receive a notification when it's reviewed.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-purple-400 hover:text-purple-600 text-xl leading-none shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ClaimPendingBanner;
import React, { useState } from "react";
import { Card, Button } from "../common";
import type { Recommendation } from "../../services/recommendationsService";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onReject,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      crop_suggestion: "🌾",
      buyer_match: "🤝",
      pricing_optimization: "💰",
      seasonal_insight: "📅",
      product_bundle: "📦",
      market_trend: "📈",
    };
    return icons[type] || "💡";
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      crop_suggestion: "Crop Suggestion",
      buyer_match: "Buyer Match",
      pricing_optimization: "Pricing Optimization",
      seasonal_insight: "Seasonal Insight",
      product_bundle: "Product Bundle",
      market_trend: "Market Trend",
    };
    return names[type] || type;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">{getTypeIcon(recommendation.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-lg">
                  {recommendation.title}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getTypeName(recommendation.type)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                {recommendation.description}
              </p>
            </div>
          </div>

          {/* Confidence Score */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(recommendation.confidenceScore)}`}
          >
            {recommendation.confidenceScore}% confident
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700 font-semibold mb-1">
              Potential Revenue
            </p>
            <p className="text-xl font-bold text-green-900">
              ${parseFloat(recommendation.potentialRevenue).toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-semibold mb-1">
              Estimated ROI
            </p>
            <p className="text-xl font-bold text-blue-900">
              {parseFloat(recommendation.estimatedRoi).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Details Toggle */}
        {recommendation.data?.reasoning && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold mb-3 flex items-center"
          >
            {showDetails ? "▼" : "▶"} {showDetails ? "Hide" : "Show"} Details
          </button>
        )}

        {/* Expanded Details */}
        {showDetails && recommendation.data?.reasoning && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">
              Why we recommend this:
            </h4>
            <ul className="space-y-1">
              {recommendation.data.reasoning.map(
                (reason: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-700 flex items-start"
                  >
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{reason}</span>
                  </li>
                ),
              )}
            </ul>

            {/* Additional Data */}
            {recommendation.type === "crop_suggestion" &&
              recommendation.data.cropType && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Crop:</strong> {recommendation.data.cropType} |
                    <strong className="ml-2">Region:</strong>{" "}
                    {recommendation.data.region} |
                    <strong className="ml-2">Avg Price:</strong> $
                    {parseFloat(recommendation.data.averagePrice).toFixed(2)}
                  </p>
                </div>
              )}

            {recommendation.type === "buyer_match" &&
              recommendation.data.buyerName && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Buyer:</strong> {recommendation.data.buyerName} |
                    <strong className="ml-2">Past Purchases:</strong>{" "}
                    {recommendation.data.purchaseCount} |
                    <strong className="ml-2">Rating:</strong>{" "}
                    {recommendation.data.buyerScore}/100
                  </p>
                </div>
              )}

            {recommendation.type === "pricing_optimization" &&
              recommendation.data.currentPrice && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Current Price:</strong> $
                    {parseFloat(recommendation.data.currentPrice).toFixed(2)} |
                    <strong className="ml-2">Suggested Price:</strong> $
                    {parseFloat(recommendation.data.suggestedPrice).toFixed(2)}{" "}
                    |<strong className="ml-2">Market Avg:</strong> $
                    {parseFloat(recommendation.data.marketAverage).toFixed(2)}
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Actions */}
        {recommendation.status === "active" && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => onAccept(recommendation.id)}
            >
              ✓ Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onReject(recommendation.id)}
            >
              ✗ Not Interested
            </Button>
          </div>
        )}

        {/* Status Badge */}
        {recommendation.status !== "active" && (
          <div className="mt-4 text-center">
            {recommendation.status === "accepted" && (
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                ✓ Accepted{" "}
                {recommendation.acceptedAt &&
                  `on ${new Date(recommendation.acceptedAt).toLocaleDateString()}`}
              </span>
            )}
            {recommendation.status === "rejected" && (
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                ✗ Not Interested
              </span>
            )}
          </div>
        )}

        {/* Expiry */}
        {recommendation.expiresAt && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            Expires {new Date(recommendation.expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
};

export default RecommendationCard;

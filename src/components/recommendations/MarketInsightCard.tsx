import React from "react";
import { Card } from "../common";
import type { MarketInsight } from "../../services/recommendationsService";

interface MarketInsightCardProps {
  insight: MarketInsight;
}

const MarketInsightCard: React.FC<MarketInsightCardProps> = ({ insight }) => {
  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return "📈";
    if (trend === "decreasing") return "📉";
    return "➡️";
  };

  const getTrendColor = (trend: string) => {
    if (trend === "increasing") return "text-green-600 bg-green-50";
    if (trend === "decreasing") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const demandSupplyRatio = parseFloat(insight.demandSupplyRatio);
  const isHighDemand = demandSupplyRatio > 1.2;
  const isLowDemand = demandSupplyRatio < 0.8;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900">
              {insight.cropType}
            </h3>
            <p className="text-sm text-gray-600">📍 {insight.region}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getTrendColor(insight.trend)}`}
          >
            {getTrendIcon(insight.trend)} {insight.trend}
          </div>
        </div>

        {/* Price Info */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900">
              ${parseFloat(insight.averagePrice).toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">/unit avg</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Min: ${parseFloat(insight.minPrice).toFixed(2)}</span>
            <span>Max: ${parseFloat(insight.maxPrice).toFixed(2)}</span>
            <span
              className={
                parseFloat(insight.trendPercentage) > 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {parseFloat(insight.trendPercentage) > 0 ? "+" : ""}
              {parseFloat(insight.trendPercentage).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Demand/Supply */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-semibold mb-1">
              Total Demand
            </p>
            <p className="text-lg font-bold text-blue-900">
              {insight.totalDemand.toLocaleString()} units
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-700 font-semibold mb-1">
              Total Supply
            </p>
            <p className="text-lg font-bold text-purple-900">
              {insight.totalSupply.toLocaleString()} units
            </p>
          </div>
        </div>

        {/* Demand-Supply Ratio */}
        <div
          className={`p-3 rounded-lg mb-4 ${
            isHighDemand
              ? "bg-green-50 border border-green-200"
              : isLowDemand
                ? "bg-red-50 border border-red-200"
                : "bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">
              Demand/Supply Ratio
            </span>
            <span
              className={`text-lg font-bold ${
                isHighDemand
                  ? "text-green-700"
                  : isLowDemand
                    ? "text-red-700"
                    : "text-gray-700"
              }`}
            >
              {demandSupplyRatio.toFixed(2)}
            </span>
          </div>
          <p className="text-xs mt-1 text-gray-600">
            {isHighDemand && "🔥 High demand! Good opportunity for sellers."}
            {isLowDemand &&
              "⚠️ Low demand. Consider waiting or adjusting price."}
            {!isHighDemand && !isLowDemand && "✓ Balanced market conditions."}
          </p>
        </div>

        {/* Market Activity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-600 mb-1">Transactions</p>
            <p className="text-sm font-bold text-gray-900">
              {insight.transactionCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Avg Order Size</p>
            <p className="text-sm font-bold text-gray-900">
              {parseFloat(insight.averageOrderSize).toFixed(0)} units
            </p>
          </div>
        </div>

        {/* Period */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Data from {new Date(insight.periodStart).toLocaleDateString()} to{" "}
          {new Date(insight.periodEnd).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
};

export default MarketInsightCard;

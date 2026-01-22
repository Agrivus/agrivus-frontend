import React, { useState, useEffect } from "react";
import { Layout, Card, Button, LoadingSpinner } from "../components/common";
import RecommendationCard from "../components/recommendations/RecommendationCard";
import MarketInsightCard from "../components/recommendations/MarketInsightCard";
import recommendationsService from "../services/recommendationsService";
import type {
  Recommendation,
  MarketInsight,
} from "../services/recommendationsService";

const Recommendations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"recommendations" | "insights">(
    "recommendations",
  );
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "accepted">("active");

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recsResponse, insightsResponse] = await Promise.all([
        recommendationsService.getRecommendations({
          status: filter === "all" ? undefined : filter,
          limit: 50,
        }),
        recommendationsService.getMarketInsights({ limit: 20 }),
      ]);

      setRecommendations(recsResponse.data.recommendations);
      setMarketInsights(insightsResponse.data.insights);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setGenerating(true);
      await recommendationsService.generateRecommendations();
      await loadData();
      alert("✅ New recommendations generated!");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Failed to generate recommendations",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await recommendationsService.acceptRecommendation(id);
      await loadData();
      alert("✓ Recommendation accepted!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to accept recommendation");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await recommendationsService.rejectRecommendation(id);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to reject recommendation");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Recommendations
              </h1>
              <p className="text-gray-600 mt-2">
                Personalized insights to grow your farming business
              </p>
            </div>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={generating}
              variant="primary"
            >
              {generating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">🔄</span> Generate New
                </>
              )}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "recommendations"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              💡 Your Recommendations ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "insights"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 Market Insights ({marketInsights.length})
            </button>
          </div>
        </div>

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === "accepted"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
            </div>

            {/* Recommendations Grid */}
            {recommendations.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No recommendations yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate AI-powered recommendations to discover new
                  opportunities
                </p>
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={generating}
                >
                  {generating ? "Generating..." : "Generate Recommendations"}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Market Insights Tab */}
        {activeTab === "insights" && (
          <>
            {marketInsights.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No market insights available
                </h3>
                <p className="text-gray-600">
                  Market insights will appear as transaction data accumulates
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketInsights.map((insight) => (
                  <MarketInsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Recommendations;

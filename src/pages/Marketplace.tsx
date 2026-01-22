import React, { useState, useEffect, useRef, useCallback } from "react";
import { LoadingSpinner } from "../components/common";
import ListingCard from "../components/marketplace/ListingCard";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import { listingsService } from "../services/listingsService";
import type { ListingWithFarmer, ListingFilters } from "../types";

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<ListingWithFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ListingFilters>({
    limit: 10, // smaller page size for low bandwidth
    sortBy: "date_desc",
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const inFlight = useRef(false);

  const lastListingRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !inFlight.current) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore],
  );

  useEffect(() => {
    // Load data on initial mount and when filters or page changes
    const controller = new AbortController();
    const loadListings = async () => {
      try {
        setError("");
        inFlight.current = true;
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const response = await listingsService.getListings({
          ...filters,
          page,
          limit: filters.limit || 10,
        });

        if (response.success && response.data) {
          const { listings: fetched, pagination: p } = response.data;
          if (page === 1) setListings(fetched);
          else setListings((prev) => [...prev, ...fetched]);

          setPagination(p);
          const computedHasMore =
            p.page < p.totalPages && fetched.length >= (filters.limit || 10);
          setHasMore(computedHasMore);
        }
      } catch (err: any) {
        // Swallow abort errors quietly
        if (err?.name !== "CanceledError") {
          setError(err.message || "Failed to load listings");
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        inFlight.current = false;
      }
    };

    loadListings();
    return () => controller.abort();
  }, [page, filters]);

  const handleFilterChange = (newFilters: ListingFilters) => {
    // Reset list and pagination
    setListings([]);
    setPage(1);
    setHasMore(true);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters({ ...newFilters, limit: newFilters.limit || 10 });
  };

  const loadMoreManually = () => {
    if (!loadingMore && hasMore) setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
            Marketplace
          </h1>
          <p className="text-gray-600">
            Browse agricultural products from verified farmers across Zimbabwe
          </p>
        </div>

        {/* Filters */}
        <MarketplaceFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Boost Info Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚀</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">
                Smart Ranking Active
              </h3>
              <p className="text-sm text-gray-700">
                Products from the most active and reliable farmers appear first.
                Look for the{" "}
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full px-2 py-0.5 text-xs">
                  <span>🏆</span>
                  <span>3.5x</span>
                </span>{" "}
                badges to find top-rated sellers!
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {listings.length} of {pagination.total} listings
              </p>
            </div>

            {/* Listings Grid */}
            {listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {listings.map((listing, index) => {
                    if (index === listings.length - 1) {
                      return (
                        <div ref={lastListingRef} key={listing.listing.id}>
                          <ListingCard listing={listing} />
                        </div>
                      );
                    }
                    return (
                      <ListingCard key={listing.listing.id} listing={listing} />
                    );
                  })}
                </div>

                {/* Load More Fallback Button (Hybrid UX) */}
                <div className="flex justify-center">
                  {hasMore && !loadingMore && (
                    <button
                      onClick={loadMoreManually}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Load More
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />

                  {/* Loading More Indicator */}
                  {loadingMore && (
                    <div className="text-center py-8">
                      <div className="animate-spin text-4xl mb-2">🌾</div>
                      <p className="text-gray-600">Loading more...</p>
                    </div>
                  )}

                  {/* End of List */}
                  {!hasMore && listings.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>You've reached the end of the listings</p>
                    </div>
                  )}
                </svg>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new
                  products.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;

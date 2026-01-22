import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  objectFit = "cover",
}) => {
  const [error, setError] = useState(false);

  // Generate low-quality placeholder (you can replace with actual thumbnail URLs)
  const placeholderSrc = src.replace("/upload/", "/upload/w_50,q_50,f_auto/");

  // Optimize Cloudinary URL for different screen sizes
  const getOptimizedUrl = (url: string, width: number = 800) => {
    if (!url.includes("cloudinary.com")) return url;

    // Add Cloudinary transformations for optimization
    return url.replace(
      "/upload/",
      `/upload/w_${width},q_auto,f_auto,dpr_auto/`,
    );
  };

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-4xl">🖼️</span>
      </div>
    );
  }

  return (
    <LazyLoadImage
      src={getOptimizedUrl(src)}
      alt={alt}
      width={width}
      height={height}
      effect="blur"
      placeholderSrc={placeholderSrc}
      className={className}
      style={{ objectFit }}
      onError={() => setError(true)}
      threshold={100} // Start loading 100px before element is visible
    />
  );
};

export default OptimizedImage;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import ImageUpload from "../components/common/ImageUpload";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { agrimallService } from "../services/agrimallService";
import { getErrorMessage } from "../utils/errorHandler";

const ELIGIBLE_ROLES = ["agro_supplier", "vendor", "admin"];

const CreateAgriMallProduct: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();
  const isEditMode = Boolean(productId);

  const [checkingStore, setCheckingStore] = useState(!isEditMode);
  const [hasStore, setHasStore] = useState(isEditMode);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);

  const [storeForm, setStoreForm] = useState({
    storeName: "",
    phone: "",
    storeDescription: "",
    physicalAddress: "",
  });
  const [storeError, setStoreError] = useState("");
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stockQuantity: "",
    unit: "unit",
    brand: "",
    images: [] as string[],
  });
  const [productError, setProductError] = useState("");
  const [productSubmitting, setProductSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) return;

    if (!user || !ELIGIBLE_ROLES.includes(user.role)) {
      setCheckingStore(false);
      return;
    }

    agrimallService
      .getVendorProfile()
      .then(() => setHasStore(true))
      .catch((err: any) => {
        if (err?.response?.status !== 404) {
          setStoreError(
            getErrorMessage(err, "Failed to check your store status."),
          );
        }
        setHasStore(false);
      })
      .finally(() => setCheckingStore(false));
  }, [user, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !productId) return;

    agrimallService
      .getProduct(productId)
      .then((response: any) => {
        const product = response.product;
        if (!product) return;
        setProductForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price != null ? String(product.price) : "",
          compareAtPrice:
            product.compareAtPrice != null
              ? String(product.compareAtPrice)
              : "",
          stockQuantity:
            product.stockQuantity != null
              ? String(product.stockQuantity)
              : "",
          unit: product.unit || "unit",
          brand: product.brand || "",
          images: product.images || [],
        });
      })
      .catch((err: any) => {
        setProductError(
          getErrorMessage(err, "Failed to load this product."),
        );
      })
      .finally(() => setLoadingProduct(false));
  }, [isEditMode, productId]);

  const handleStoreChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setStoreForm({ ...storeForm, [e.target.name]: e.target.value });
  };

  const handleProductChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleImagesUploaded = (urls: string[]) => {
    setProductForm({ ...productForm, images: urls });
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreError("");

    if (!storeForm.storeName.trim() || !storeForm.phone.trim()) {
      setStoreError("Store name and phone are required.");
      return;
    }

    try {
      setStoreSubmitting(true);
      await agrimallService.registerVendor({
        storeName: storeForm.storeName.trim(),
        phone: storeForm.phone.trim(),
        storeDescription: storeForm.storeDescription.trim() || undefined,
        physicalAddress: storeForm.physicalAddress.trim() || undefined,
      });
      setHasStore(true);
    } catch (err: any) {
      setStoreError(
        getErrorMessage(err, "Failed to set up your store. Please try again."),
      );
    } finally {
      setStoreSubmitting(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");

    if (!productForm.name.trim() || !productForm.price) {
      setProductError("Product name and price are required.");
      return;
    }

    if (productForm.images.length === 0) {
      setProductError("Please upload at least one product image.");
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || undefined,
      price: productForm.price,
      compareAtPrice: productForm.compareAtPrice || undefined,
      stockQuantity: productForm.stockQuantity
        ? Number(productForm.stockQuantity)
        : undefined,
      unit: productForm.unit,
      brand: productForm.brand.trim() || undefined,
      images: productForm.images,
    };

    try {
      setProductSubmitting(true);
      const response = isEditMode
        ? await agrimallService.updateProduct(productId as string, payload)
        : await agrimallService.createProduct(payload);

      if (response.success) {
        navigate("/agrimall/my-products");
        return;
      }

      setProductError("Something went wrong. Please try again.");
    } catch (err: any) {
      setProductError(
        getErrorMessage(
          err,
          `Failed to ${isEditMode ? "update" : "create"} product. Please try again.`,
        ),
      );
    } finally {
      setProductSubmitting(false);
    }
  };

  if (!user || !ELIGIBLE_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-warning mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only Agri-Mall suppliers can add products.
          </p>
          <Button variant="primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (checkingStore || loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasStore) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
              Set Up Your Agri-Mall Store
            </h1>
            <p className="text-gray-600">
              Before you can add products, tell buyers a little about your
              store.
            </p>
          </div>

          {storeError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {storeError}
            </div>
          )}

          <Card className="p-8">
            <form onSubmit={handleStoreSubmit} className="space-y-6">
              <Input
                label="Store Name *"
                type="text"
                name="storeName"
                value={storeForm.storeName}
                onChange={handleStoreChange}
                placeholder="e.g., Green Valley Agro Supplies"
                required
              />
              <Input
                label="Phone Number *"
                type="tel"
                name="phone"
                value={storeForm.phone}
                onChange={handleStoreChange}
                placeholder="e.g., 0771234567"
                required
              />
              <div>
                <label className="block mb-2 font-semibold text-dark-green">
                  Store Description
                </label>
                <textarea
                  name="storeDescription"
                  value={storeForm.storeDescription}
                  onChange={handleStoreChange}
                  placeholder="What do you sell? Seeds, fertilizer, equipment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                />
              </div>
              <Input
                label="Physical Address"
                type="text"
                name="physicalAddress"
                value={storeForm.physicalAddress}
                onChange={handleStoreChange}
                placeholder="e.g., 12 Main Street, Harare"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={storeSubmitting}
                disabled={storeSubmitting}
              >
                {storeSubmitting ? "Setting Up..." : "Continue"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
            {isEditMode ? "Edit Product" : "Add Product to Agri-Mall"}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? "Update this product's details."
              : "List an agricultural input — seeds, fertilizer, equipment, etc."}
          </p>
        </div>

        {productError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {productError}
          </div>
        )}

        <Card className="p-8">
          <form onSubmit={handleProductSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-dark-green">
                Product Images *
              </label>
              <ImageUpload
                onUploadComplete={handleImagesUploaded}
                maxImages={5}
                existingImages={productForm.images}
              />
            </div>

            <Input
              label="Product Name *"
              type="text"
              name="name"
              value={productForm.name}
              onChange={handleProductChange}
              placeholder="e.g., NPK Compound Fertilizer 50kg"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Price (USD) *"
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleProductChange}
                placeholder="45.00"
                min="0.01"
                step="0.01"
                required
              />
              <Input
                label="Compare-at Price (USD)"
                type="number"
                name="compareAtPrice"
                value={productForm.compareAtPrice}
                onChange={handleProductChange}
                placeholder="Optional original price"
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Stock Quantity"
                type="number"
                name="stockQuantity"
                value={productForm.stockQuantity}
                onChange={handleProductChange}
                placeholder="100"
                min="0"
                step="1"
              />
              <div>
                <label className="block mb-2 font-semibold text-dark-green">
                  Unit
                </label>
                <select
                  name="unit"
                  value={productForm.unit}
                  onChange={handleProductChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                >
                  <option value="unit">Unit</option>
                  <option value="kg">Kilograms</option>
                  <option value="bag">Bag</option>
                  <option value="litre">Litre</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
            </div>

            <Input
              label="Brand"
              type="text"
              name="brand"
              value={productForm.brand}
              onChange={handleProductChange}
              placeholder="e.g., Windmill, Zimphos"
            />

            <div>
              <label className="block mb-2 font-semibold text-dark-green">
                Description
              </label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleProductChange}
                placeholder="Describe the product, usage, and any specifications."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={productSubmitting}
                disabled={productSubmitting || productForm.images.length === 0}
              >
                {productSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Adding Product..."
                  : isEditMode
                    ? "Save Changes"
                    : "Add Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/agrimall/my-products")}
                disabled={productSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateAgriMallProduct;

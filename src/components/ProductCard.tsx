import React, { useState } from "react";
import { Product, CupSize } from "../types";
import { usePOS } from "../context/POSContext";
import { formatCurrency } from "../utils/calculations";
import { Plus, Package, ChevronDown, ChevronUp } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = usePOS();
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<CupSize | null>(null);

  // Defensive mapping for Supabase snake_case
  const isCustomizable = product.isCustomizable ?? product.is_customizable;
  const flavors = product.flavors ?? [];
  const sizes = product.sizes ?? [];

  const handleAddToCart = () => {
    if ((product.current_stock ?? product.stock) > 0) {
      if (isCustomizable) {
        if (!selectedFlavor || !selectedSize) {
          alert("Please select both flavor and size");
          return;
        }
        addToCart(product, selectedFlavor, selectedSize);
      } else {
        addToCart(product);
      }
      setSelectedFlavor("");
      setSelectedSize(null);
    }
  };

  const getDisplayPrice = () => {
    if (isCustomizable && selectedSize) {
      return selectedSize.price;
    }
    return product.price;
  };

  const getDisplayName = () => {
    if (isCustomizable && selectedFlavor && selectedSize) {
      return `${product.name} - ${selectedFlavor} (${selectedSize.size})`;
    }
    return product.name;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-visible min-w-[260px] min-h-[420px] h-auto p-4 flex flex-col justify-between">
      <div className="relative">
        {/* Removed product image */}
        {/* <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/80x80?text=No+Image";
          }}
        /> */}
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Low: {product.stock}
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm sm:text-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {isCustomizable && (
          <div className="mb-2">
            <span className="inline-block bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
              Customizable
            </span>
          </div>
        )}
        <h3 className="font-semibold text-sm sm:text-lg text-gray-800 mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg sm:text-2xl font-bold text-green-600">
            {formatCurrency(getDisplayPrice())}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            SKU: {product.sku}
          </span>
        </div>

        {/* Flavors and Sizes Summary for Customizable Products */}
        {isCustomizable && (
          <div className="mb-2">
            <div className="mb-1">
              <span className="font-semibold text-xs text-gray-700">
                Flavors: {flavors.length === 0 ? "None" : ""}
              </span>
              {flavors.map((flavor) => (
                <span
                  key={flavor}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mr-1 mb-1"
                >
                  {flavor}
                </span>
              ))}
            </div>
            <div>
              <span className="font-semibold text-xs text-gray-700">
                Sizes: {sizes.length === 0 ? "None" : ""}
              </span>
              {sizes.map((size) => (
                <span
                  key={size.size}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mr-1 mb-1"
                >
                  {size.size}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Customization Options */}
        {isCustomizable && (
          <div className="mb-3">
            {/* Flavor Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Flavor
              </label>
              <select
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Select flavor</option>
                {flavors.map((flavor) => (
                  <option key={flavor} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Selection */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      selectedSize?.size === size.size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{size.size}</div>
                    <div className="text-xs">{formatCurrency(size.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Options Display */}
            {(selectedFlavor || selectedSize) && (
              <div className="p-2 bg-blue-50 rounded text-xs mt-3">
                {selectedFlavor && (
                  <div>
                    <strong>Flavor:</strong> {selectedFlavor}
                  </div>
                )}
                {selectedSize && (
                  <div>
                    <strong>Size:</strong> {selectedSize.size} -{" "}
                    {formatCurrency(selectedSize.price)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span
            className={`text-xs sm:text-sm ${
              (product.current_stock ?? product.stock) > 5
                ? "text-green-600"
                : (product.current_stock ?? product.stock) > 0
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {product.current_stock ?? product.stock} in stock
          </span>

          <button
            onClick={handleAddToCart}
            disabled={
              product.stock === 0 ||
              (isCustomizable && (!selectedFlavor || !selectedSize))
            }
            className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
              product.stock > 0 &&
              (!isCustomizable || (selectedFlavor && selectedSize))
                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

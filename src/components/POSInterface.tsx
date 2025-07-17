import React, { useState } from "react";
import { usePOS } from "../context/POSContext";
import { categories } from "../data/products";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import Payment from "./Payment";
import { ShoppingCart, CreditCard, Package, Menu, X } from "lucide-react";

const POSInterface: React.FC = () => {
  const { state, setCategory, loadingProducts } = usePOS();
  const { products, selectedCategory } = state;
  const [activeTab, setActiveTab] = useState<"cart" | "payment">("cart");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🍹</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Fruity Soda POS
                </h1>
                <p className="text-xs text-gray-600">Point of Sale</p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 hidden lg:block">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍹</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Fruity Soda POS
                </h1>
                <p className="text-sm text-gray-600">Point of Sale System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="font-medium text-gray-800">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Layout */}
        <div className="lg:hidden flex-1 flex flex-col">
          {/* Category Filter - Mobile */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-800">
                Products
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategory(category)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("cart")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "cart"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "payment"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Payment
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "cart" ? (
              <div className="h-full p-4">
                <Cart />
              </div>
            ) : (
              <div className="h-full p-4">
                <Payment />
              </div>
            )}
          </div>

          {/* Mobile Product Grid - Bottom Sheet */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-60"
                style={{ height: "90vh", maxHeight: "95vh" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Products
                    </h3>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 pb-20">
                    <div className="grid grid-cols-2 gap-6">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-base font-semibold text-gray-600 mb-2">
                          No products found
                        </h3>
                        <p className="text-sm text-gray-500">
                          Try selecting a different category.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1">
          {/* Left Panel - Product Catalog */}
          <div className="flex-1 flex flex-col">
            {/* Category Filter */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Products
                </h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingProducts ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-base font-semibold text-gray-600 mb-2">
                        No products found
                      </h3>
                      <p className="text-sm text-gray-500">
                        Try selecting a different category.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Cart & Payment */}
          <div className="w-96 bg-gray-100 border-l border-gray-200 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("cart")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === "cart"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === "payment"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Payment
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "cart" ? (
                <div className="h-full p-4">
                  <Cart />
                </div>
              ) : (
                <div className="h-full p-4">
                  <Payment />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default POSInterface;

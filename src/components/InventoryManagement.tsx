import React, { useState } from "react";
import { usePOS } from "../context/POSContext";
import { Product } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Package, Edit, Save, X, Plus, Search } from "lucide-react";
import {
  restockProduct,
  recordIngredientPurchase,
} from "../utils/supabaseProducts";

const InventoryManagement: React.FC = () => {
  const { state, updateProduct, addStockToProduct } = usePOS();
  const { products } = state;

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingValues, setEditingValues] = useState<Partial<Product>>({});
  const [addingStockProduct, setAddingStockProduct] = useState<string | null>(
    null
  );
  const [addStockAmount, setAddStockAmount] = useState<number>(0);
  const [addStockLoading, setAddStockLoading] = useState(false);
  const [addStockError, setAddStockError] = useState<string | null>(null);
  const [addStockSuccess, setAddStockSuccess] = useState<string | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<string | null>(
    null
  );
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockError, setRestockError] = useState<string | null>(null);
  const [restockSuccess, setRestockSuccess] = useState<string | null>(null);
  const [restockCost, setRestockCost] = useState<number>(0);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditingValues({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
    });
  };

  const handleSave = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product && editingValues) {
      const updatedProduct: Product = {
        ...product,
        ...editingValues,
      };
      updateProduct(updatedProduct);
    }
    setEditingProduct(null);
    setEditingValues({});
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditingValues({});
  };

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setEditingValues((prev) => ({
      ...prev,
      [field]: field === "price" || field === "stock" ? Number(value) : value,
    }));
  };

  const handleAddStock = async (productId: string) => {
    setAddStockLoading(true);
    setAddStockError(null);
    setAddStockSuccess(null);
    try {
      await addStockToProduct(productId, addStockAmount);
      setAddStockSuccess("Stock added successfully!");
      setAddStockAmount(0);
      setAddingStockProduct(null);
    } catch (e: any) {
      setAddStockError(e.message || "Failed to add stock");
    } finally {
      setAddStockLoading(false);
    }
  };

  const handleRestock = async (productId: string) => {
    setRestockLoading(true);
    setRestockError(null);
    setRestockSuccess(null);
    try {
      if (restockAmount > 0) {
        await restockProduct(productId, restockAmount);
      }
      if (restockCost > 0) {
        await recordIngredientPurchase(productId, restockAmount, restockCost);
      }
      setRestockSuccess("Restock/cost recorded successfully!");
      setRestockAmount(0);
      setRestockCost(0);
      setRestockingProduct(null);
      window.location.reload();
    } catch (e: any) {
      setRestockError(e.message || "Failed to restock");
    } finally {
      setRestockLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { color: "text-red-600", bg: "bg-red-100", text: "Out of Stock" };
    if (stock <= 5)
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        text: "Low Stock",
      };
    return { color: "text-green-600", bg: "bg-green-100", text: "In Stock" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage your product catalog and stock levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="text-sm text-gray-600">
            {products.length} products total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Status
            </label>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                In Stock:{" "}
                {
                  products.filter((p) => (p.current_stock ?? p.stock) > 5)
                    .length
                }
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Low Stock:{" "}
                {
                  products.filter(
                    (p) =>
                      (p.current_stock ?? p.stock) <= 5 &&
                      (p.current_stock ?? p.stock) > 0
                  ).length
                }
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Out of Stock:{" "}
                {
                  products.filter((p) => (p.current_stock ?? p.stock) === 0)
                    .length
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(
                  product.current_stock ?? product.stock
                );
                const isEditing = editingProduct === product.id;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://via.placeholder.com/40x40?text=Soda";
                          }}
                        />
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingValues.name || product.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          )}
                          {isEditing ? (
                            <textarea
                              value={
                                editingValues.description || product.description
                              }
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs mt-1"
                              rows={2}
                            />
                          ) : (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editingValues.price || product.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editingValues.stock || product.stock}
                          onChange={(e) =>
                            handleInputChange("stock", e.target.value)
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {product.current_stock ?? product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}
                      >
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(product.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAddingStockProduct(product.id)}
                            className="ml-2 text-green-600 hover:text-green-900"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {addingStockProduct === product.id && (
                            <div className="flex flex-col gap-2 mt-2">
                              <input
                                type="number"
                                min={1}
                                value={addStockAmount}
                                onChange={(e) =>
                                  setAddStockAmount(Number(e.target.value))
                                }
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Add stock"
                                disabled={addStockLoading}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddStock(product.id)}
                                  className="text-green-700 font-semibold"
                                  disabled={
                                    addStockLoading || addStockAmount <= 0
                                  }
                                >
                                  {addStockLoading ? "Adding..." : "Confirm"}
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingStockProduct(null);
                                    setAddStockAmount(0);
                                    setAddStockError(null);
                                    setAddStockSuccess(null);
                                  }}
                                  className="text-gray-500"
                                  disabled={addStockLoading}
                                >
                                  Cancel
                                </button>
                              </div>
                              {addStockError && (
                                <div className="text-xs text-red-600">
                                  {addStockError}
                                </div>
                              )}
                              {addStockSuccess && (
                                <div className="text-xs text-green-600">
                                  {addStockSuccess}
                                </div>
                              )}
                            </div>
                          )}
                          <button
                            onClick={() => setRestockingProduct(product.id)}
                            className="ml-2 text-blue-600 hover:text-blue-900"
                          >
                            Restock
                          </button>
                          {restockingProduct === product.id && (
                            <div className="flex flex-col gap-2 mt-2">
                              <label className="text-xs text-gray-700 font-medium">
                                Add Stock (Quantity)
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={restockAmount}
                                onChange={(e) =>
                                  setRestockAmount(Number(e.target.value))
                                }
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Add stock"
                                disabled={restockLoading}
                              />
                              <div className="flex items-center my-3">
                                <div className="flex-grow border-t border-gray-300" />
                                <span className="mx-3 text-xs text-gray-400 font-semibold">
                                  Cost Section
                                </span>
                                <div className="flex-grow border-t border-gray-300" />
                              </div>
                              <div className="bg-blue-50 rounded p-2">
                                <div className="font-semibold text-xs text-blue-700 mb-1">
                                  Restock Cost
                                </div>
                                <label className="text-xs text-gray-700 font-medium">
                                  Total Cost (₱)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={restockCost}
                                  onChange={(e) =>
                                    setRestockCost(Number(e.target.value))
                                  }
                                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Total cost (₱)"
                                  disabled={restockLoading}
                                />
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleRestock(product.id)}
                                  className="text-blue-700 font-semibold"
                                  disabled={
                                    restockLoading ||
                                    (restockAmount <= 0 && restockCost <= 0)
                                  }
                                >
                                  {restockLoading ? "Restocking..." : "Confirm"}
                                </button>
                                <button
                                  onClick={() => {
                                    setRestockingProduct(null);
                                    setRestockAmount(0);
                                    setRestockCost(0);
                                    setRestockError(null);
                                    setRestockSuccess(null);
                                  }}
                                  className="text-gray-500"
                                  disabled={restockLoading}
                                >
                                  Cancel
                                </button>
                              </div>
                              {restockError && (
                                <div className="text-xs text-red-600">
                                  {restockError}
                                </div>
                              )}
                              {restockSuccess && (
                                <div className="text-xs text-green-600">
                                  {restockSuccess}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-600">
            Total Products
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {products.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(
              products.reduce(
                (sum, p) => sum + p.price * (p.current_stock ?? p.stock),
                0
              )
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-600">
            Low Stock Items
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {
              products.filter(
                (p) =>
                  (p.current_stock ?? p.stock) <= 5 &&
                  (p.current_stock ?? p.stock) > 0
              ).length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-600">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">
            {products.filter((p) => (p.current_stock ?? p.stock) === 0).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;

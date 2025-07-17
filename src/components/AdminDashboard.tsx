import React, { useState, useEffect } from "react";
import { usePOS } from "../context/POSContext";
import { formatCurrency, formatDate } from "../utils/calculations";
import { supabase } from "../utils/supabaseClient";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  ArrowUpRight,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { Product } from "../types";

const AdminDashboard: React.FC = () => {
  const { state, addProduct, updateProduct, deleteProduct } = usePOS();
  const { salesData, transactions, products } = state;
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "today" | "week" | "month"
  >("today");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 25,
    description: "",
    stock: 100,
    sku: "",
    category: "Customizable",
    isCustomizable: true,
    flavors: ["Lychee", "Strawberry", "Mango", "Blueberry", "Grape"],
    sizes: [
      { size: "12oz", price: 25, description: "Small" },
      { size: "16oz", price: 35, description: "Medium" },
      { size: "22oz", price: 45, description: "Large" },
    ],
    image: "",
  });
  const [newFlavor, setNewFlavor] = useState("");
  const [loading, setLoading] = useState(false);
  const [ingredientCost, setIngredientCost] = useState(0);

  useEffect(() => {
    // Fetch total ingredient cost from Supabase
    const fetchIngredientCost = async () => {
      const { data, error } = await supabase
        .from("ingredient_purchases")
        .select("cost");
      if (!error && data) {
        const total = data.reduce((sum, row) => sum + Number(row.cost), 0);
        setIngredientCost(total);
      }
    };
    fetchIngredientCost();
  }, []);

  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.timestamp);
      switch (selectedTimeframe) {
        case "today":
          return transactionDate >= today;
        case "week":
          return transactionDate >= weekAgo;
        case "month":
          return transactionDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku) {
      alert("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await addProduct(newProduct as any);
      setNewProduct({
        name: "",
        price: 25,
        description: "",
        stock: 100,
        sku: "",
        category: "Customizable",
        isCustomizable: true,
        flavors: ["Lychee", "Strawberry", "Mango", "Blueberry", "Grape"],
        sizes: [
          { size: "12oz", price: 25, description: "Small" },
          { size: "16oz", price: 35, description: "Medium" },
          { size: "22oz", price: 45, description: "Large" },
        ],
        image: "",
      });
      setShowAddProduct(false);
    } catch (e) {
      alert("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await deleteProduct(productId);
      } catch (e) {
        alert("Failed to delete product. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddFlavor = () => {
    if (newFlavor.trim() && !newProduct.flavors.includes(newFlavor.trim())) {
      setNewProduct({
        ...newProduct,
        flavors: [...newProduct.flavors, newFlavor.trim()],
      });
      setNewFlavor("");
    }
  };

  const handleRemoveFlavor = (flavorToRemove: string) => {
    setNewProduct({
      ...newProduct,
      flavors: newProduct.flavors.filter((flavor) => flavor !== flavorToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFlavor();
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const timeframeSales = filteredTransactions.reduce(
    (sum, t) => sum + t.total,
    0
  );
  const timeframeTransactions = filteredTransactions.length;
  const averageOrderValue =
    timeframeTransactions > 0 ? timeframeSales / timeframeTransactions : 0;
  // Use filteredTransactions for all summary cards
  const totalSales = timeframeSales;
  const netProfit = totalSales - ingredientCost;

  // Aggregate daily income data for the chart
  const dailyIncomeMap: { [date: string]: number } = {};
  transactions.forEach((transaction) => {
    const date = new Date(transaction.timestamp).toISOString().slice(0, 10); // YYYY-MM-DD
    dailyIncomeMap[date] = (dailyIncomeMap[date] || 0) + transaction.total;
  });
  // Convert to array and sort by date ascending
  const dailyIncomeData = Object.entries(dailyIncomeMap)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Restore lowStockProducts calculation
  const lowStockProducts = products.filter((product) => product.stock <= 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor your business performance</p>
        </div>
        <div className="flex gap-2">
          {(["today", "week", "month"] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">
                {timeframeTransactions}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Order Value
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(averageOrderValue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {lowStockProducts.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-sm">Total Sales</span>
          <span className="text-2xl font-bold text-green-700">
            ₱
            {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-sm">Total Ingredient Cost</span>
          <span className="text-2xl font-bold text-blue-700">
            ₱
            {ingredientCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-sm">Net Profit</span>
          <span className="text-2xl font-bold text-purple-700">
            ₱{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Daily Income Line Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Daily Income
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={dailyIncomeData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="black"
              fill="#00000022"
              fillOpacity={0.2}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="black"
              strokeWidth={3}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Top Selling Products
        </h2>
        <div className="space-y-3">
          {salesData.topProducts.slice(0, 5).map((item, index) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-800">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.quantitySold} units sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {formatCurrency(item.revenue)}
                </p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Top Seller
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Receipt #
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Items
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Total
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-800">
                    {transaction.receiptNumber}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {formatDate(transaction.timestamp)}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {transaction.items.length} items
                  </td>
                  <td className="py-3 text-sm font-semibold text-gray-800">
                    {formatCurrency(transaction.total)}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.paymentMethod === "cash"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Low Stock Alert
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-yellow-700">
                    Only {product.stock} left in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Product Management
          </h2>
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Product
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  SKU
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Price
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Stock
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Category
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{product.sku}</td>
                  <td className="py-3 text-sm font-semibold text-gray-800">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock <= 5
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New Product
              </h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, sku: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newProduct.image || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste image URL here"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCustomizable"
                  checked={newProduct.isCustomizable}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      isCustomizable: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isCustomizable"
                  className="text-sm font-medium text-gray-700"
                >
                  Customizable (flavors & sizes)
                </label>
              </div>

              {newProduct.isCustomizable && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Flavors
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newFlavor}
                        onChange={(e) => setNewFlavor(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add new flavor (e.g., Pineapple)"
                      />
                      <button
                        type="button"
                        onClick={handleAddFlavor}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newProduct.flavors.map((flavor, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <span>{flavor}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlavor(flavor)}
                            className="text-blue-600 hover:text-blue-800 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Options
                    </label>
                    {(newProduct.sizes || []).map((size, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={size.size}
                          onChange={(e) => {
                            const sizes = [...newProduct.sizes];
                            sizes[idx].size = e.target.value;
                            setNewProduct({ ...newProduct, sizes });
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                          placeholder="Size"
                        />
                        <input
                          type="number"
                          value={size.price}
                          onChange={(e) => {
                            const sizes = [...newProduct.sizes];
                            sizes[idx].price = Number(e.target.value);
                            setNewProduct({ ...newProduct, sizes });
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                          placeholder="Price"
                          min="0"
                        />
                        <input
                          type="text"
                          value={size.description}
                          onChange={(e) => {
                            const sizes = [...newProduct.sizes];
                            sizes[idx].description = e.target.value;
                            setNewProduct({ ...newProduct, sizes });
                          }}
                          className="w-28 px-2 py-1 border border-gray-300 rounded"
                          placeholder="Description"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const sizes = [...newProduct.sizes];
                            sizes.splice(idx, 1);
                            setNewProduct({ ...newProduct, sizes });
                          }}
                          className="text-red-600 hover:text-red-800 font-bold px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setNewProduct({
                          ...newProduct,
                          sizes: [
                            ...newProduct.sizes,
                            { size: "", price: 0, description: "" },
                          ],
                        })
                      }
                      className="mt-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      + Add Size Option
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                Add Product
              </button>
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Product
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <EditProductForm
              product={editingProduct}
              onSave={(updatedProduct) => {
                updateProduct(updatedProduct);
                setEditingProduct(null);
              }}
              onCancel={() => setEditingProduct(null)}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

interface EditProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
  loading: boolean;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  product,
  onSave,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState<Product>({
    ...product,
    image: product.image || "",
  });
  const [newFlavor, setNewFlavor] = useState("");

  const handleAddFlavor = () => {
    if (newFlavor.trim() && !(form.flavors ?? []).includes(newFlavor.trim())) {
      setForm({
        ...form,
        flavors: [...(form.flavors ?? []), newFlavor.trim()],
      });
      setNewFlavor("");
    }
  };

  const handleRemoveFlavor = (flavorToRemove: string) => {
    setForm({
      ...form,
      flavors: (form.flavors ?? []).filter((f) => f !== flavorToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFlavor();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SKU *
        </label>
        <input
          type="text"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={form.image || ""}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Paste image URL here"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isCustomizableEdit"
          checked={form.isCustomizable}
          onChange={(e) =>
            setForm({ ...form, isCustomizable: e.target.checked })
          }
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="isCustomizableEdit"
          className="text-sm font-medium text-gray-700"
        >
          Customizable (flavors & sizes)
        </label>
      </div>
      {form.isCustomizable && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Flavors
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFlavor}
                onChange={(e) => setNewFlavor(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add new flavor (e.g., Pineapple)"
              />
              <button
                type="button"
                onClick={handleAddFlavor}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.flavors ?? []).map((flavor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{flavor}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFlavor(flavor)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size Options
            </label>
            {(form.sizes ?? []).map((size, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={size.size}
                  onChange={(e) => {
                    const updatedSizes = [...(form.sizes ?? [])];
                    updatedSizes[idx].size = e.target.value;
                    setForm({ ...form, sizes: updatedSizes });
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  placeholder="Size"
                />
                <input
                  type="number"
                  value={size.price}
                  onChange={(e) => {
                    const updatedSizes = [...(form.sizes ?? [])];
                    updatedSizes[idx].price = Number(e.target.value);
                    setForm({ ...form, sizes: updatedSizes });
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  placeholder="Price"
                  min="0"
                />
                <input
                  type="text"
                  value={size.description}
                  onChange={(e) => {
                    const updatedSizes = [...(form.sizes ?? [])];
                    updatedSizes[idx].description = e.target.value;
                    setForm({ ...form, sizes: updatedSizes });
                  }}
                  className="w-28 px-2 py-1 border border-gray-300 rounded"
                  placeholder="Description"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedSizes = [...(form.sizes ?? [])];
                    updatedSizes.splice(idx, 1);
                    setForm({ ...form, sizes: updatedSizes });
                  }}
                  className="text-red-600 hover:text-red-800 font-bold px-2"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  sizes: [
                    ...(form.sizes ?? []),
                    { size: "", price: 0, description: "" },
                  ],
                })
              }
              className="mt-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + Add Size Option
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

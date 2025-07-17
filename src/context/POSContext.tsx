import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Product, CartItem, Transaction, SalesData } from "../types";
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  updateInventory,
} from "../utils/calculations";
import {
  fetchProductsWithSales,
  addProduct as supabaseAddProduct,
  updateProduct as supabaseUpdateProduct,
  deleteProduct as supabaseDeleteProduct,
} from "../utils/supabaseProducts";
import { supabase } from "../utils/supabaseClient";
import { addTransaction as supabaseAddTransaction } from "../utils/supabaseTransactions";

interface POSState {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  salesData: SalesData;
  currentView: "pos" | "admin" | "inventory";
  selectedCategory: string;
}

type POSAction =
  | {
      type: "ADD_TO_CART";
      payload: {
        product: Product;
        selectedFlavor?: string;
        selectedSize?: any;
      };
    }
  | { type: "REMOVE_FROM_CART"; payload: CartItem }
  | {
      type: "UPDATE_QUANTITY";
      payload: { item: CartItem; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "COMPLETE_TRANSACTION"; payload: Transaction }
  | { type: "SET_VIEW"; payload: "pos" | "admin" | "inventory" }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "LOAD_DATA" }
  | { type: "LOAD_PRODUCTS"; payload: Product[] }
  | { type: "LOAD_TRANSACTIONS"; payload: Transaction[] };

const initialState: POSState = {
  products: [],
  cart: [],
  transactions: [],
  salesData: {
    totalSales: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    topProducts: [],
    dailySales: [],
  },
  currentView: "pos",
  selectedCategory: "All",
};

const POSReducer = (state: POSState, action: POSAction): POSState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, selectedFlavor, selectedSize } = action.payload;
      const cartItemKey = `${product.id}-${selectedFlavor || ""}-${
        selectedSize?.size || ""
      }`;

      const existingItem = state.cart.find((item) => {
        const itemKey = `${item.product.id}-${item.selectedFlavor || ""}-${
          item.selectedSize?.size || ""
        }`;
        return itemKey === cartItemKey;
      });

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) => {
            const itemKey = `${item.product.id}-${item.selectedFlavor || ""}-${
              item.selectedSize?.size || ""
            }`;
            if (itemKey === cartItemKey) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          }),
        };
      } else {
        const newCartItem: CartItem = {
          product,
          quantity: 1,
          selectedFlavor,
          selectedSize,
        };
        return {
          ...state,
          cart: [...state.cart, newCartItem],
        };
      }
    }

    case "REMOVE_FROM_CART": {
      return {
        ...state,
        cart: state.cart.filter(
          (cartItem) =>
            !(
              cartItem.product.id === action.payload.product.id &&
              cartItem.selectedFlavor === action.payload.selectedFlavor &&
              cartItem.selectedSize?.size === action.payload.selectedSize?.size
            )
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(
            (cartItem) =>
              !(
                cartItem.product.id === action.payload.item.product.id &&
                cartItem.selectedFlavor ===
                  action.payload.item.selectedFlavor &&
                cartItem.selectedSize?.size ===
                  action.payload.item.selectedSize?.size
              )
          ),
        };
      }
      return {
        ...state,
        cart: state.cart.map((cartItem) =>
          cartItem.product.id === action.payload.item.product.id &&
          cartItem.selectedFlavor === action.payload.item.selectedFlavor &&
          cartItem.selectedSize?.size === action.payload.item.selectedSize?.size
            ? { ...cartItem, quantity: action.payload.quantity }
            : cartItem
        ),
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        cart: [],
      };
    }

    case "COMPLETE_TRANSACTION": {
      const updatedProducts = updateInventory(
        action.payload.items,
        state.products
      );
      const newTransactions = [action.payload, ...state.transactions];

      // Calculate new sales data
      const totalSales = newTransactions.reduce((sum, t) => sum + t.total, 0);
      const averageOrderValue = totalSales / newTransactions.length;

      // Calculate top products
      const productSales = new Map<
        string,
        { product: Product; quantitySold: number; revenue: number }
      >();
      newTransactions.forEach((transaction) => {
        transaction.items.forEach((item) => {
          const productKey = item.product.id;
          const existing = productSales.get(productKey);
          const itemPrice = item.selectedSize
            ? item.selectedSize.price
            : item.product.price;
          if (existing) {
            existing.quantitySold += item.quantity;
            existing.revenue += itemPrice * item.quantity;
          } else {
            productSales.set(productKey, {
              product: item.product,
              quantitySold: item.quantity,
              revenue: itemPrice * item.quantity,
            });
          }
        });
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        ...state,
        products: updatedProducts,
        transactions: newTransactions,
        cart: [],
        salesData: {
          totalSales,
          totalTransactions: newTransactions.length,
          averageOrderValue,
          topProducts,
          dailySales: state.salesData.dailySales, // Keep existing daily sales for now
        },
      };
    }

    case "SET_VIEW": {
      return {
        ...state,
        currentView: action.payload,
      };
    }

    case "SET_CATEGORY": {
      return {
        ...state,
        selectedCategory: action.payload,
      };
    }

    case "UPDATE_PRODUCT": {
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    }

    case "ADD_PRODUCT": {
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    }

    case "DELETE_PRODUCT": {
      return {
        ...state,
        products: state.products.filter(
          (product) => product.id !== action.payload
        ),
      };
    }

    case "LOAD_DATA": {
      // Load data from localStorage if available
      const savedTransactions = localStorage.getItem("pos_transactions");

      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));

        // Recalculate sales data
        const totalSales = transactions.reduce(
          (sum: number, t: Transaction) => sum + t.total,
          0
        );
        const averageOrderValue =
          transactions.length > 0 ? totalSales / transactions.length : 0;

        const productSales = new Map<
          string,
          { product: Product; quantitySold: number; revenue: number }
        >();
        transactions.forEach((transaction: Transaction) => {
          transaction.items.forEach((item) => {
            const productKey = item.product.id;
            const existing = productSales.get(productKey);
            const itemPrice = item.selectedSize
              ? item.selectedSize.price
              : item.product.price;
            if (existing) {
              existing.quantitySold += item.quantity;
              existing.revenue += itemPrice * item.quantity;
            } else {
              productSales.set(productKey, {
                product: item.product,
                quantitySold: item.quantity,
                revenue: itemPrice * item.quantity,
              });
            }
          });
        });

        const topProducts = Array.from(productSales.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        return {
          ...state,
          transactions,
          salesData: {
            totalSales,
            totalTransactions: transactions.length,
            averageOrderValue,
            topProducts,
            dailySales: state.salesData.dailySales,
          },
        };
      }

      return state;
    }

    case "LOAD_PRODUCTS": {
      return {
        ...state,
        products: action.payload,
      };
    }

    case "LOAD_TRANSACTIONS": {
      return {
        ...state,
        transactions: action.payload,
      };
    }

    default:
      return state;
  }
};

interface POSContextType {
  state: POSState;
  dispatch: React.Dispatch<POSAction>;
  loadingProducts: boolean;
  addToCart: (
    product: Product,
    selectedFlavor?: string,
    selectedSize?: any
  ) => void;
  removeFromCart: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  clearCart: () => void;
  completeTransaction: (transaction: Transaction) => void;
  setView: (view: "pos" | "admin" | "inventory") => void;
  setCategory: (category: string) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addStockToProduct: (productId: string, amount: number) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(POSReducer, initialState);
  const [loadingProducts, setLoadingProducts] = React.useState(true);

  // Fetch products from Supabase on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const products = await fetchProductsWithSales();
        dispatch({ type: "LOAD_PRODUCTS", payload: products });
      } catch (e) {
        console.error("Failed to load products from Supabase:", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Fetch transactions from Supabase on mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("timestamp", { ascending: false });
        if (error) throw error;
        // Convert timestamp string to Date object and parse items for each transaction
        const transactions = (data || []).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
          items: typeof t.items === "string" ? JSON.parse(t.items) : t.items,
        }));
        dispatch({ type: "LOAD_TRANSACTIONS", payload: transactions });
      } catch (e) {
        console.error("Failed to load transactions from Supabase:", e);
      }
    };
    loadTransactions();
  }, []);

  // Override add, update, delete product actions to use Supabase
  const addProduct = async (product: Product) => {
    const newProduct = await supabaseAddProduct(product);
    dispatch({ type: "ADD_PRODUCT", payload: newProduct });
  };
  const updateProduct = async (product: Product) => {
    const updated = await supabaseUpdateProduct(product);
    dispatch({ type: "UPDATE_PRODUCT", payload: updated });
  };

  // Add stock to an existing product
  const addStockToProduct = async (productId: string, amount: number) => {
    const updated = await import("../utils/supabaseProducts").then((m) =>
      m.addStockToProduct(productId, amount)
    );
    dispatch({ type: "UPDATE_PRODUCT", payload: updated });
  };
  const deleteProduct = async (productId: string) => {
    await supabaseDeleteProduct(productId);
    dispatch({ type: "DELETE_PRODUCT", payload: productId });
  };

  const addToCart = (
    product: Product,
    selectedFlavor?: string,
    selectedSize?: any
  ) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, selectedFlavor, selectedSize },
    });
  };

  const removeFromCart = (item: CartItem) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: item });
  };

  const updateQuantity = (item: CartItem, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { item, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const completeTransaction = async (transaction: Transaction) => {
    try {
      // Prepare transaction for Supabase (items as JSON string)
      const dbTransaction = {
        subtotal: transaction.subtotal,
        tax: transaction.tax,
        total: transaction.total,
        payment_method: transaction.paymentMethod,
        cash_received: transaction.cashReceived,
        change: transaction.change,
        timestamp:
          transaction.timestamp instanceof Date
            ? transaction.timestamp.toISOString()
            : transaction.timestamp,
        receipt_number: transaction.receiptNumber,
        items: JSON.stringify(transaction.items), // only for Supabase
      };
      await supabaseAddTransaction(dbTransaction, transaction.items);

      // Update product stock in Supabase for each sold item
      const updateStockPromises = transaction.items.map(async (item) => {
        const product = item.product;
        const newStock = (product.stock ?? 0) - item.quantity;
        if (newStock >= 0) {
          await updateProduct({ ...product, stock: newStock });
        }
      });
      await Promise.all(updateStockPromises);

      // Dispatch the original transaction (items is still an array)
      dispatch({ type: "COMPLETE_TRANSACTION", payload: transaction });
    } catch (error) {
      console.error(
        "Failed to save transaction to Supabase or update stock:",
        error
      );
      alert("Failed to save transaction or update stock. Please try again.");
    }
  };

  const setView = (view: "pos" | "admin" | "inventory") => {
    dispatch({ type: "SET_VIEW", payload: view });
  };

  const setCategory = (category: string) => {
    dispatch({ type: "SET_CATEGORY", payload: category });
  };

  const value: POSContextType = {
    state,
    dispatch,
    loadingProducts,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    completeTransaction,
    setView,
    setCategory,
    updateProduct,
    addProduct,
    deleteProduct,
    addStockToProduct,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  sku: string;
  isCustomizable?: boolean;
  is_customizable?: boolean;
  flavors?: string[];
  sizes?: CupSize[];
  initial_stock?: number;
  current_stock?: number;
  total_sold?: number;
}

export interface CupSize {
  size: string;
  price: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFlavor?: string;
  selectedSize?: CupSize;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card";
  cashReceived?: number;
  change?: number;
  timestamp: Date;
  receiptNumber: string;
}

export interface SalesData {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: Product;
    quantitySold: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
}

export interface InventoryItem {
  product: Product;
  currentStock: number;
  lowStockThreshold: number;
  lastUpdated: Date;
}

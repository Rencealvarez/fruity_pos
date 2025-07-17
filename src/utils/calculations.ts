import { CartItem, Transaction } from "../types";

export const TAX_RATE = 0; // 8.5% tax rate

export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const itemPrice = item.selectedSize
      ? item.selectedSize.price
      : item.product.price;
    return total + itemPrice * item.quantity;
  }, 0);
};

export const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
};

export const calculateTotal = (subtotal: number, tax: number): number => {
  return Math.round((subtotal + tax) * 100) / 100;
};

export const calculateChange = (
  total: number,
  cashReceived: number
): number => {
  return Math.round((cashReceived - total) * 100) / 100;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    currencyDisplay: "symbol",
  }).format(amount);
};

export const generateReceiptNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `R${timestamp}${random}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

export const updateInventory = (
  items: CartItem[],
  currentProducts: any[]
): any[] => {
  return currentProducts.map((product) => {
    const cartItem = items.find((item) => item.product.id === product.id);
    if (cartItem) {
      return {
        ...product,
        stock: Math.max(0, product.stock - cartItem.quantity),
      };
    }
    return product;
  });
};

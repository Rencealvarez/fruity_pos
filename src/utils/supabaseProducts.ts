import { supabase } from "./supabaseClient";
import { Product } from "../types";

function toSupabaseProduct(product: any) {
  return {
    name: product.name,
    sku: product.sku,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    is_customizable: product.isCustomizable ?? product.is_customizable,
    flavors: product.flavors,
    sizes: product.sizes,
    image: product.image,
    id: product.id,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  // Map snake_case to camelCase
  return (data ?? []).map((p: any) => ({
    ...p,
    isCustomizable: p.is_customizable,
    // Optionally, map other fields if needed
  })) as Product[];
}

export async function addProduct(product: Product): Promise<Product> {
  const { id, ...rest } = toSupabaseProduct(product);
  const { data, error } = await supabase
    .from("products")
    .insert([rest])
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(product: Product): Promise<Product> {
  const { id, ...rest } = toSupabaseProduct(product);
  const { data, error } = await supabase
    .from("products")
    .update(rest)
    .eq("id", product.id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}

export async function fetchProductsWithSales() {
  // Fetch all products (including initial_stock)
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*, initial_stock");
  if (prodError) throw prodError;

  // Fetch all transaction_items (for sales stats)
  const { data: items, error: itemsError } = await supabase
    .from("transaction_items")
    .select("product_id, quantity");
  if (itemsError) throw itemsError;

  // Calculate total sold for each product
  const soldMap: Record<string, number> = {};
  for (const item of items ?? []) {
    soldMap[item.product_id] = (soldMap[item.product_id] || 0) + item.quantity;
  }

  // Attach current_stock to each product (calculated)
  const productsWithStock = (products ?? []).map((p) => ({
    ...p,
    current_stock: (p.initial_stock ?? 0) - (soldMap[p.id] || 0), // Calculated stock
    total_sold: soldMap[p.id] || 0,
  }));

  return productsWithStock;
}

/**
 * Adds stock to an existing product by a given amount.
 * @param productId The ID of the product to update.
 * @param amount The amount of stock to add (must be positive).
 * @returns The updated Product.
 */
export async function addStockToProduct(
  productId: string,
  amount: number
): Promise<Product> {
  if (amount <= 0) throw new Error("Amount to add must be positive");
  // Fetch current product
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  if (fetchError) throw fetchError;
  // Update stock
  const newStock = (product.stock ?? 0) + amount;
  const { data: updated, error: updateError } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId)
    .select()
    .single();
  if (updateError) throw updateError;
  return updated as Product;
}

export async function restockProduct(
  productId: string,
  amount: number
): Promise<void> {
  // Fetch current initial_stock
  const { data: product, error } = await supabase
    .from("products")
    .select("initial_stock")
    .eq("id", productId)
    .single();
  if (error) throw error;
  const newInitialStock = (product.initial_stock ?? 0) + amount;
  // Update initial_stock
  const { error: updateError } = await supabase
    .from("products")
    .update({ initial_stock: newInitialStock })
    .eq("id", productId);
  if (updateError) throw updateError;
}

export async function recordIngredientPurchase(
  productId: string,
  quantity: number,
  cost: number
): Promise<void> {
  const { error } = await supabase
    .from("ingredient_purchases")
    .insert([{ product_id: productId, quantity, cost }]);
  if (error) throw error;
}

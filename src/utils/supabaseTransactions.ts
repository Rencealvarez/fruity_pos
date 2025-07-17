import { supabase } from "./supabaseClient";
import { CartItem } from "../types";

export async function addTransaction(transaction: any, items: CartItem[]) {
  // Insert transaction and get the new id
  const { data, error } = await supabase
    .from("transactions")
    .insert([transaction])
    .select()
    .single();
  if (error) throw error;

  // Insert transaction items
  const transactionId = data.id;
  const itemsWithTransaction = items.map((item: CartItem) => ({
    transaction_id: transactionId,
    product_id: item.product.id,
    flavor: item.selectedFlavor,
    size: item.selectedSize?.size,
    quantity: item.quantity,
    price: item.selectedSize ? item.selectedSize.price : item.product.price,
  }));

  const { error: itemsError } = await supabase
    .from("transaction_items")
    .insert(itemsWithTransaction);

  if (itemsError) throw itemsError;

  return data;
}

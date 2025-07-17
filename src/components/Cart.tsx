import React from "react";
import { usePOS } from "../context/POSContext";
import {
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
} from "../utils/calculations";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

const Cart: React.FC = () => {
  const { state, removeFromCart, updateQuantity, clearCart } = usePOS();
  const { cart } = state;

  const subtotal = calculateSubtotal(cart);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (item: any, newQuantity: number) => {
    updateQuantity(item, newQuantity);
  };

  const handleRemoveItem = (item: any) => {
    removeFromCart(item);
  };

  const getItemPrice = (item: any) => {
    return item.selectedSize ? item.selectedSize.price : item.product.price;
  };

  const getItemName = (item: any) => {
    let name = item.product.name;
    if (item.selectedFlavor) {
      name += ` - ${item.selectedFlavor}`;
    }
    if (item.selectedSize) {
      name += ` (${item.selectedSize.size})`;
    }
    return name;
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500">
              Add some delicious drinks to get started!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      {/* Cart Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Cart ({cart.length} items, {totalItems} total)
          </h2>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto cart-scrollbar p-3 sm:p-4">
        <div className="space-y-3">
          {cart.map((item, index) => (
            <div
              key={`${item.product.id}-${item.selectedFlavor || ""}-${
                item.selectedSize?.size || ""
              }-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Removed product image */}
              {/*
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/48x48?text=Drink";
                }}
              />
              */}

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base text-gray-800 truncate">
                  {getItemName(item)}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {formatCurrency(getItemPrice(item))} each
                </p>
                {item.product.isCustomizable && (
                  <div className="text-xs text-blue-600 mt-1">
                    {item.selectedFlavor && (
                      <span className="mr-2">
                        Flavor: {item.selectedFlavor}
                      </span>
                    )}
                    {item.selectedSize && (
                      <span>Size: {item.selectedSize.size}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                <span className="w-8 text-center font-medium text-sm sm:text-base">
                  {item.quantity}
                </span>

                <button
                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="text-right min-w-0">
                <p className="font-semibold text-sm sm:text-base text-gray-800">
                  {formatCurrency(getItemPrice(item) * item.quantity)}
                </p>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="text-red-500 hover:text-red-700 mt-1 p-1"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8.5%):</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="border-t border-gray-300 pt-2">
            <div className="flex justify-between text-base sm:text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

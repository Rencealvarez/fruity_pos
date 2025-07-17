import React, { useState } from "react";
import { usePOS } from "../context/POSContext";
import {
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  calculateChange,
  generateReceiptNumber,
} from "../utils/calculations";
import { Transaction } from "../types";
import { DollarSign, Calculator, Receipt } from "lucide-react";

const Payment: React.FC = () => {
  const { state, completeTransaction, clearCart } = usePOS();
  const { cart } = state;

  const [cashReceived, setCashReceived] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);

  const subtotal = calculateSubtotal(cart);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);
  const change = cashReceived
    ? calculateChange(total, parseFloat(cashReceived))
    : 0;

  const handleCashInput = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = numericValue.split(".");
    if (parts.length > 2) return;

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;

    setCashReceived(numericValue);
  };

  const handleQuickAmount = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleCompleteTransaction = async () => {
    if (!cashReceived || parseFloat(cashReceived) < total) {
      alert("Please enter sufficient cash amount");
      return;
    }

    setIsProcessing(true);

    try {
      const transaction: Transaction = {
        id: Date.now().toString(),
        items: [...cart],
        subtotal,
        tax,
        total,
        paymentMethod: "cash",
        cashReceived: parseFloat(cashReceived),
        change,
        timestamp: new Date(),
        receiptNumber: generateReceiptNumber(),
      };

      completeTransaction(transaction);
      setCurrentTransaction(transaction);
      setShowReceipt(true);
      setCashReceived("");

      // Auto-hide receipt after 5 seconds
      setTimeout(() => {
        setShowReceipt(false);
        setCurrentTransaction(null);
      }, 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (currentTransaction) {
      window.print();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-300" />
          <p className="text-sm sm:text-base">
            Add items to cart to process payment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-h-[80vh] overflow-y-auto pb-24">
      <div className="flex items-center gap-2 mb-4">
        {/* Replace DollarSign icon with Peso sign */}
        <span className="text-green-600 text-2xl font-bold">₱</span>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Payment
        </h2>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-3">
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8.5%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="border-t border-gray-300 pt-2">
            <div className="flex justify-between font-bold text-base sm:text-lg">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Input */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cash Received
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            ₱
          </span>
          <input
            type="text"
            value={cashReceived}
            onChange={(e) => handleCashInput(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Amounts
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 20, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAmount(amount)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              ₱{amount}
            </button>
          ))}
        </div>
      </div>

      {/* Change Display */}
      {cashReceived && parseFloat(cashReceived) > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="font-medium text-sm sm:text-base text-blue-800">
              Change Due
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {change >= 0 ? formatCurrency(change) : "Insufficient Amount"}
          </div>
        </div>
      )}

      {/* Complete Transaction Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white p-4 z-10">
        <button
          onClick={handleCompleteTransaction}
          disabled={
            !cashReceived || parseFloat(cashReceived) < total || isProcessing
          }
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors text-base sm:text-lg ${
            !cashReceived || parseFloat(cashReceived) < total || isProcessing
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 active:bg-green-800"
          }`}
        >
          {isProcessing ? "Processing..." : "Complete Transaction"}
        </button>
      </div>

      {/* Receipt Modal */}
      {showReceipt && currentTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 print:bg-white print:shadow-none">
            <div className="text-center mb-4">
              <Receipt className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg sm:text-xl font-bold">
                Transaction Complete!
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <strong>Receipt #:</strong> {currentTransaction.receiptNumber}
              </p>
              <p className="text-sm">
                <strong>Total:</strong>{" "}
                {formatCurrency(currentTransaction.total)}
              </p>
              <p className="text-sm">
                <strong>Cash Received:</strong>{" "}
                {formatCurrency(currentTransaction.cashReceived!)}
              </p>
              <p className="text-sm">
                <strong>Change:</strong>{" "}
                {formatCurrency(currentTransaction.change!)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;

import React from "react";
import { Transaction } from "../types";
import { formatCurrency, formatDate } from "../utils/calculations";

interface ReceiptProps {
  transaction: Transaction;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  return (
    <div className="print-only bg-white p-6 max-w-sm mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-xl font-bold">🍹 Fruity Soda Co.</h1>
        <p className="text-gray-600">Delicious & Refreshing</p>
        <p className="text-gray-600">123 Soda Street, Beverage City</p>
        <p className="text-gray-600">Phone: (555) 123-4567</p>
      </div>

      {/* Transaction Info */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span>Receipt #:</span>
          <span className="font-bold">{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Date:</span>
          <span>{formatDate(transaction.timestamp)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Payment Method:</span>
          <span className="capitalize">{transaction.paymentMethod}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <div className="text-center mb-2 font-bold">ITEMS</div>
        {transaction.items.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span className="font-medium">{item.product.name}</span>
              <span>{formatCurrency(item.product.price)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Qty: {item.quantity}</span>
              <span>{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Subtotal:</span>
          <span>{formatCurrency(transaction.subtotal)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Tax (8.5%):</span>
          <span>{formatCurrency(transaction.tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
          <span>TOTAL:</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
      </div>

      {/* Payment Details */}
      {transaction.paymentMethod === "cash" && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Cash Received:</span>
            <span>{formatCurrency(transaction.cashReceived!)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Change:</span>
            <span>{formatCurrency(transaction.change!)}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center border-t border-gray-300 pt-4">
        <p className="text-gray-600 mb-2">Thank you for your purchase!</p>
        <p className="text-gray-600 text-xs">Please come again</p>
        <p className="text-gray-600 text-xs mt-2">
          * This is a computer-generated receipt *
        </p>
      </div>
    </div>
  );
};

export default Receipt;

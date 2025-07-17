import React, { useState } from "react";
import { POSProvider, usePOS } from "./context/POSContext";
import POSInterface from "./components/POSInterface";
import AdminDashboard from "./components/AdminDashboard";
import InventoryManagement from "./components/InventoryManagement";
import { ShoppingCart, BarChart3, Package, Home, Menu, X } from "lucide-react";

const AppContent: React.FC = () => {
  const { state, setView } = usePOS();
  const { currentView } = state;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { id: "pos", label: "POS", icon: ShoppingCart },
    { id: "admin", label: "Dashboard", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
  ];

  const handleNavigation = (view: "pos" | "admin" | "inventory") => {
    setView(view);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">
                  🍹
                </span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  Fruity Soda
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">POS System</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    handleNavigation(item.id as "pos" | "admin" | "inventory")
                  }
                  className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600">Version 1.0.0</p>
              <p className="text-xs text-gray-500 mt-1">Fruity Soda POS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {currentView === "pos" && "Point of Sale"}
                {currentView === "admin" && "Admin Dashboard"}
                {currentView === "inventory" && "Inventory Management"}
              </h2>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content Area */}
        <div className="h-full overflow-hidden">
          {currentView === "pos" && <POSInterface />}
          {currentView === "admin" && (
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              <AdminDashboard />
            </div>
          )}
          {currentView === "inventory" && (
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              <InventoryManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <POSProvider>
      <AppContent />
    </POSProvider>
  );
};

export default App;

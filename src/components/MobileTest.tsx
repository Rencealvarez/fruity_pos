import React from "react";

const MobileTest: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
      <div className="hidden sm:block">Desktop</div>
      <div className="block sm:hidden">Mobile</div>
    </div>
  );
};

export default MobileTest;

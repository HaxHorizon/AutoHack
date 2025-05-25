import React from "react";

export const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="mt-2">{children}</div>
);

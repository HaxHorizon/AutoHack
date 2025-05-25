import React from "react";

export const Button = ({ children, ...props }) => (
  <button
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl w-full transition duration-200"
    {...props}
  >
    {children}
  </button>
);

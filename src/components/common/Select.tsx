import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helpText,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 font-semibold text-dark-green">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 border rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none ${
          error ? "border-warning" : "border-gray-300"
        } ${className}`}
        {...props}
      >
        {props.children}
      </select>
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-warning">{error}</p>}
    </div>
  );
};

export default Select;

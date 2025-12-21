import React from "react";

interface ModalInputProps {
  label: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  error?: string;
  showError?: boolean;
}

function ModalInput({
  label,
  type = "text",
  value = " ",
  onChange,
  onBlur,
  name,
  error = "",
  showError = false,
}: ModalInputProps) {
  return (
    <div className="mb-2">
      <p>{label}</p>
      <input
        type={type}
        className={`mt-1 block w-full border rounded py-1 px-2 ${showError ? "border-red-500" : "border-gray-700"}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
      />
      {showError && error && (
        <p className="text-xs text-red-500 mb-0">{error}</p>
      )}
    </div>
  );
}

export default ModalInput;

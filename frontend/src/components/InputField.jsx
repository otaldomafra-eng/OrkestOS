import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}) => {
  const [showSenha, setShowSenha] = useState(false);

  const isSenha = type === "password";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-charcoal text-sm font-medium mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={isSenha && showSenha ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="
            w-full bg-surface-deep text-ink border border-hairline-strong rounded-lg 
            px-4 py-3 pr-10
            focus:outline-none focus:ring-2 focus:ring-white/30
            focus:border-transparent 
            transition-all
          "
        />

        {/* Eye Toggle */}
        {isSenha && (
          <button
            type="button"
            onClick={() => setShowSenha(!showSenha)}
            className="absolute right-3 top-4 text-mute hover:text-ink transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  spellCheck,
  name,
  className = "",
}) => {
  const [showSenha, setShowSenha] = useState(false);

  const isSenha = type === "password";
  const inputId = id ?? name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-charcoal text-sm font-medium mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={isSenha && showSenha ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          className="
            w-full bg-surface-deep text-ink border border-hairline-strong rounded-lg
            px-4 py-3 pr-10
            focus:outline-none focus:ring-2 focus:ring-white/30
            focus:border-transparent
            transition-colors transition-shadow duration-150
          "
        />

        {isSenha && (
          <button
            type="button"
            onClick={() => setShowSenha(!showSenha)}
            aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-3 top-4 text-mute hover:text-ink transition-colors duration-200 active:scale-95"
          >
            {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;

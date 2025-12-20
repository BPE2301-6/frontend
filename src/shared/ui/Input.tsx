import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

function Input({
  placeholder = '',
  value = '',
  onChange = () => {},
  error = false,
  disabled = false,
  className = '',
  ...props
}: InputProps) {
  const baseClasses =
    'w-figma-input-width h-figma-input-height border rounded-figma-input px-12 flex items-center font-montserrat font-light text-figma-input-text text-figma-white leading-[59px]';

  const stateClasses = error
    ? 'border-figma-red text-figma-red'
    : 'border-figma-white text-figma-white';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseClasses} ${stateClasses} ${disabledClasses} bg-transparent focus:outline-none`}
        {...props}
      />
      {value === '' && !error && (
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="text-figma-input-text font-montserrat font-light text-figma-white leading-[59px]">
            {placeholder}
          </div>
        </div>
      )}
      {value === '' && error && (
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="text-figma-input-text font-montserrat font-light text-figma-red leading-[59px]">
            {placeholder}
          </div>
        </div>
      )}
      {value !== '' && (
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div
            className={`text-figma-input-text font-montserrat font-light leading-[59px] ${error ? 'text-figma-red' : 'text-figma-white'}`}
          >
            {value}
          </div>
        </div>
      )}
    </div>
  );
}

export default Input;


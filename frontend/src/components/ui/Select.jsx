import React from 'react';

export const Select = React.forwardRef(({ label, error, helperText, options = [], placeholder, className = '', ...rest }, ref) => {
  const id = rest.id || rest.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="font-body text-sm font-medium text-text mb-1.5 block">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`w-full rounded-xl border px-4 py-3 font-body text-sm text-text placeholder:text-text-muted/60 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat ${error ? 'border-error' : 'border-border'} ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled hidden>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-error font-body">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-sm text-text-muted font-body">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

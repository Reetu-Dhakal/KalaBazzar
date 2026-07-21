import React from 'react';

export const Textarea = React.forwardRef(({ label, error, helperText, rows = 4, className = '', ...rest }, ref) => {
  const id = rest.id || rest.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="font-body text-sm font-medium text-text mb-1.5 block">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`w-full rounded-xl border px-4 py-3 font-body text-sm text-text placeholder:text-text-muted/60 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-vertical ${error ? 'border-error' : 'border-border'} ${className}`}
        {...rest}
      />
      {error && (
        <p className="mt-1.5 text-sm text-error font-body">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-sm text-text-muted font-body">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

import React from 'react';

/**
 * Input Component
 * 
 * Types: text, email, password, number, tel, url, search
 * States: default, error
 */

const Input = React.forwardRef(({
    label,
    error,
    helperText,
    required = false,
    className = '',
    leftIcon,
    rightIcon,
    ...props
}, ref) => {

    const inputClasses = `
    input
    ${error ? 'input-error' : ''}
    ${leftIcon ? '!pl-12' : ''}
    ${rightIcon ? '!pr-12' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className="w-full">
            {label && (
                <label className={`label ${required ? 'label-required' : ''}`}>
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    className={inputClasses}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-neutral-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

/**
 * Textarea Component
 */
const Textarea = React.forwardRef(({
    label,
    error,
    helperText,
    required = false,
    className = '',
    rows = 4,
    ...props
}, ref) => {

    const textareaClasses = `
    textarea
    ${error ? 'input-error' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className="w-full">
            {label && (
                <label className={`label ${required ? 'label-required' : ''}`}>
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                rows={rows}
                className={textareaClasses}
                {...props}
            />

            {(error || helperText) && (
                <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-neutral-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

/**
 * Select Component
 */
const Select = React.forwardRef(({
    label,
    error,
    helperText,
    required = false,
    className = '',
    options = [],
    placeholder = 'Select an option',
    ...props
}, ref) => {

    const selectClasses = `
    select
    ${error ? 'input-error' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className="w-full">
            {label && (
                <label className={`label ${required ? 'label-required' : ''}`}>
                    {label}
                </label>
            )}

            <select
                ref={ref}
                className={selectClasses}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {(error || helperText) && (
                <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-neutral-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export { Input, Textarea, Select };
export default Input;

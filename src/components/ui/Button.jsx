import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Button Component
 * 
 * Variants: primary, secondary, outline, ghost
 * Sizes: sm, md (default), lg
 */

const Button = React.forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    as = 'button',
    to,
    ...props
}, ref) => {

    const baseClasses = 'btn';

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
    };

    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    };

    const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    const content = (
        <>
            {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!loading && leftIcon && <span>{leftIcon}</span>}
            <span>{children}</span>
            {!loading && rightIcon && <span>{rightIcon}</span>}
        </>
    );

    if (to) {
        return (
            <Link ref={ref} to={to} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    const Component = as;

    return (
        <Component
            ref={ref}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </Component>
    );
});

Button.displayName = 'Button';

export default Button;

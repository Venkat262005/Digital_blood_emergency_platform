import React from 'react';

/**
 * Badge Component
 * 
 * Variants: primary, success, warning, error, info, neutral
 * Sizes: sm, md (default)
 */

const Badge = ({
    children,
    variant = 'neutral',
    size = 'md',
    className = '',
    leftIcon,
    rightIcon,
    dot = false,
    ...props
}) => {

    const variantClasses = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
        neutral: 'badge-neutral',
    };

    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5',
        md: '',
    };

    const classes = `
    badge
    ${variantClasses[variant] || variantClasses.neutral}
    ${sizeClasses[size] || ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <span className={classes} {...props}>
            {dot && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
            {leftIcon && <span>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span>{rightIcon}</span>}
        </span>
    );
};

export default Badge;

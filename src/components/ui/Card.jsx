import React from 'react';

/**
 * Card Component
 * 
 * Variants: default, hover, elevated, interactive
 */

const Card = ({
    children,
    variant = 'default',
    className = '',
    onClick,
    ...props
}) => {

    const variantClasses = {
        default: 'card',
        hover: 'card-hover',
        elevated: 'card-elevated',
        interactive: 'card-interactive',
    };

    const classes = `
    ${variantClasses[variant] || variantClasses.default}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`p-6 border-b border-neutral-200 ${className}`} {...props}>
        {children}
    </div>
);

const CardBody = ({ children, className = '', ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
    <div className={`p-6 border-t border-neutral-200 bg-neutral-50 ${className}`} {...props}>
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

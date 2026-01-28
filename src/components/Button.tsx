import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    className = '',
    children,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-black hover:shadow-glow hover:scale-105',
        secondary: 'glass-strong border border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:scale-105',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-black hover:scale-105',
        ghost: 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-105',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {/* Ripple effect placeholder */}
            <span className="absolute inset-0 overflow-hidden rounded-xl">
                <span className="absolute inset-0 transition-transform duration-300 transform scale-0 group-active:scale-100 bg-white/20" />
            </span>

            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;

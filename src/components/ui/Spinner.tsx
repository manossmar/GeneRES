interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Spinner({ size = 'lg' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'h-8 w-8 border-4',
        md: 'h-12 w-12 border-4',
        lg: 'h-16 w-16 border-[6px]',
        xl: 'h-20 w-20 border-8',
    };

    return (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-dark">
            <div
                className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-primary border-t-transparent`}
            ></div>
        </div>
    );
}

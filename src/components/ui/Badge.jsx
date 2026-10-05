import { cn } from '../../utils/cn';

export function Badge({ tone = 'neutral', className, children }) {
    return <span className={cn('badge', `badge-${tone}`, className)}>{children}</span>;
}
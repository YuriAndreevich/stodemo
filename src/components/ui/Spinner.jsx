import { cn } from '../../utils/cn';

export function Spinner({ size = 'md', className }) {
    return <span className={cn('spinner', size === 'small' && 'spinner-small', className)} />;
}
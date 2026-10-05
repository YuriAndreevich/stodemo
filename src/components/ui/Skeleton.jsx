import { cn } from '../../utils/cn';

export function Skeleton({ height = 16, width = '100%', className }) {
    return (
        <div
            className={cn('skeleton', className)}
            style={{ height, width }}
        />
    );
}
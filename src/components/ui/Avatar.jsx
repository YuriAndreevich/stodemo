import { cn } from '../../utils/cn';

const getInitials = (name) => {
    if (!name) return '?';

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');
};

export function Avatar({ name, src, size = 42, className }) {
    const style = {
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.36)),
    };

    if (src) {
        return (
            <div className={cn('avatar', className)} style={style}>
                <img src={src} alt={name || 'avatar'} />
            </div>
        );
    }

    return (
        <div className={cn('avatar', className)} style={style}>
            {getInitials(name)}
        </div>
    );
}
import { cn } from '../../utils/cn';

export function EmptyState({
    icon = '📭',
    title = 'Нет данных',
    description,
    action,
    className,
}) {
    return (
        <div className={cn('empty-state', className)}>
            <div className="empty-icon">{icon}</div>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
            {action ? <div className="empty-action">{action}</div> : null}
        </div>
    );
}
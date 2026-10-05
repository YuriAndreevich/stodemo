import { cn } from '../../utils/cn';
import { Card } from './Card';

export function KpiCard({
    title,
    value,
    footer,
    icon,
    tone = 'neutral',
    delta,
    className,
}) {
    const numericDelta = Number(delta);
    const hasDelta = delta !== undefined && delta !== null && !Number.isNaN(numericDelta);

    return (
        <Card className={cn('kpi', tone !== 'neutral' && `kpi-${tone}`, className)}>
            <div className="kpi-top">
                <span>{title}</span>
                {icon ? <span>{icon}</span> : null}
            </div>

            <strong>{value}</strong>

            {hasDelta ? (
                <span
                    className={cn(
                        'kpi-delta',
                        numericDelta >= 0 ? 'positive' : 'negative'
                    )}
                >
                    {numericDelta >= 0 ? '+' : ''}
                    {numericDelta}%
                </span>
            ) : null}

            {footer ? <small>{footer}</small> : null}
        </Card>
    );
}
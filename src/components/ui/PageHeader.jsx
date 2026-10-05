import { cn } from '../../utils/cn';

export function PageHeader({
    title,
    subtitle,
    actions,
    breadcrumbs,
    className,
}) {
    return (
        <header className={cn('page-header', className)}>
            <div>
                {breadcrumbs ? (
                    <div className="text-muted" style={{ marginBottom: 6, fontSize: 13 }}>
                        {breadcrumbs}
                    </div>
                ) : null}

                <h2>{title}</h2>
                {subtitle ? <p>{subtitle}</p> : null}
            </div>

            {actions ? <div className="page-actions">{actions}</div> : null}
        </header>
    );
}
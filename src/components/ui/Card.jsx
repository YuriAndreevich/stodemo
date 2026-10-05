import { cn } from '../../utils/cn';

export function Card({
    title,
    subtitle,
    actions,
    footer,
    className,
    children,
    padded = true,
}) {
    return (
        <section className={cn('card', !padded && 'card-unpadded', className)}>
            {title || actions ? (
                <div className="card-head">
                    <div>
                        {title ? <h3>{title}</h3> : null}
                        {subtitle ? <p>{subtitle}</p> : null}
                    </div>

                    {actions ? <div>{actions}</div> : null}
                </div>
            ) : null}

            {children}

            {footer ? <div className="card-foot">{footer}</div> : null}
        </section>
    );
}
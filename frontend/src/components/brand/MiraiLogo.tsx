import logoWebp from '../../assets/logo.webp'

interface MiraiLogoProps {
    size?: number
    className?: string
    alt?: string
}

export function MiraiLogo({
    size = 40,
    className = '',
    alt = 'Mirai Café Logo',
}: MiraiLogoProps) {
    return (
        <img
            src={logoWebp}
            alt={alt}
            width={size}
            height={size}
            className={`shrink-0 object-contain select-none ${className}`}
            style={{ width: size, height: size }}
            loading="eager"
            decoding="async"
        />
    )
}
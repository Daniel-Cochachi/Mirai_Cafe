interface MiraiLogoProps {
    size?: number
    className?: string
}

export function MiraiLogo({
    size = 40,
    className = '',
}: MiraiLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M15 27H44V38C44 46.2843 37.2843 53 29 53C20.7157 53 14 46.2843 14 38V28C14 27.4477 14.4477 27 15 27Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M44 32H48C53.5228 32 57 35.134 57 39C57 43.4183 53.4183 47 49 47H42"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M11 57H50"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />

            <path
                d="M22 21C17.5 16.5 26.5 13.5 22 8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />

            <path
                d="M34 21C29.5 16.5 38.5 13.5 34 8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    )
}
import { ReactNode } from 'react'

export default function BackgroundLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {/* Fondo con transparencia */}
            <div
                style={{
                    backgroundImage: 'url(/background.png)', // 👈 pon aquí tu imagen en /public/background.png
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.4,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1
                }}
            />
            {/* Contenido */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    )
}

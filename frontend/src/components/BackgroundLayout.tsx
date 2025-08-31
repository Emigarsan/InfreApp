import { ReactNode } from 'react'

export default function BackgroundLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {/* Fondo con transparencia */}
            <div
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.66)',            // 👈 fondo negro por defecto
                    backgroundImage: 'url(/background.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',                       // 👈 transparencia de la imagen
                    position: 'fixed',                   // 👈 se fija al viewport
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1
                }}
            />
            {/* Contenido */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    minHeight: '100vh',                  // 👈 garantiza que el contenido alinee con el fondo
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                {children}
            </div>
        </div>
    )
}

import { ReactNode } from 'react'

export default function BackgroundLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {/* Fondo */}
            <div
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.66)', // 👈 overlay translúcido global
                    backgroundImage: 'url(/background.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1
                }}
            />

            {/* Contenido con recuadro overlay */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '24px'
                }}
            >
                <div
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.75)', // 👈 recuadro interno como en Questionnaire
                        padding: '24px',
                        borderRadius: '12px',
                        maxWidth: '900px',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

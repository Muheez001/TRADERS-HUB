import { useMemo } from 'react';

function ParticleBackground() {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 20}s`,
            duration: `${20 + Math.random() * 15}s`,
            size: `${3 + Math.random() * 5}px`,
            opacity: 0.2 + Math.random() * 0.3,
        }));
    }, []);

    return (
        <div className="particles">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: particle.left,
                        width: particle.size,
                        height: particle.size,
                        opacity: particle.opacity,
                        animationDelay: particle.delay,
                        animationDuration: particle.duration,
                    }}
                />
            ))}
        </div>
    );
}

export default ParticleBackground;

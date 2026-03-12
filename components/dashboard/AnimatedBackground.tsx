'use client'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base dark */}
      <div className="absolute inset-0 bg-[#030712]" />

      {/* Nebula clouds */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute w-[800px] h-[800px] -top-[200px] -left-[200px] rounded-full animate-nebula-1"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] top-[30%] -right-[100px] rounded-full animate-nebula-2"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[700px] h-[700px] -bottom-[200px] left-[20%] rounded-full animate-nebula-3"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0.03) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] top-[10%] left-[40%] rounded-full animate-nebula-4"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full animate-particle"
          style={{
            left: `${5 + (i * 47) % 90}%`,
            top: `${10 + (i * 31) % 80}%`,
            background: i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#a78bfa' : '#ec4899',
            opacity: 0.3 + (i % 5) * 0.1,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${6 + (i % 4) * 2}s`,
            boxShadow: `0 0 ${4 + (i % 3) * 2}px currentColor`,
          }}
        />
      ))}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712]/60" />
    </div>
  )
}

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Species } from '../types/species'

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusColor = 'success' | 'warning' | 'danger' | null
type CompatibilityStatus = 'COMPATIBLE' | 'CAUTION' | 'INCOMPATIBLE' | null

/** Animation personality driven by compatibility status */
type FishBehavior = 'normal' | 'caution' | 'aggressive' | 'fleeing'

interface TankItem {
  species: Species
  quantity: number
}

export interface TankCanvasProps {
  length: number | ''
  height: number | ''
  width?: number | ''        // optional — additive, not breaking
  tankItems: TankItem[]
  bioloadColor: StatusColor
  compatibilityColor?: StatusColor
}

interface FishInstance {
  species: Species
  idx: number        // instance index within species
  cornerIdx: number  // corner assignment for fleeing behavior (0–3)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BORDER_HEX: Record<string, string> = {
  success: '#2ecc71',
  warning: '#e67e22',
  danger:  '#e74c3c',
  default: '#b0bec5',
}

const RANK: Record<string, number> = { danger: 2, warning: 1, success: 0 }

function worstColor(a: StatusColor, b: StatusColor): StatusColor {
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  return RANK[a] >= RANK[b] ? a : b
}

function borderHex(color: StatusColor): string {
  return color ? BORDER_HEX[color] : BORDER_HEX.default
}

function fishHsl(id: number): string {
  return `hsl(${(id * 137) % 360}, 60%, 55%)`
}

/** Linearly blend two hex colors by factor t (0 = a, 1 = b). */
function blendHex(a: string, b: string, t: number): string {
  const parse = (h: string) => {
    const c = h.replace('#', '')
    return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)]
  }
  const [ar,ag,ab] = parse(a)
  const [br,bg,bb] = parse(b)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`
}

// ─── Mobile hook ─────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  )
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

// ─── Tank edge glow ───────────────────────────────────────────────────────────

function TankEdges({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const geo = useMemo(() => {
    const box = new THREE.BoxGeometry(w, h, d)
    const eg  = new THREE.EdgesGeometry(box)
    box.dispose()
    return eg
  }, [w, h, d])

  useEffect(() => () => geo.dispose(), [geo])

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

// ─── Glass panel ─────────────────────────────────────────────────────────────

function GlassPanel({
  pos, size,
}: {
  pos: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        transparent
        opacity={0.13}
        roughness={0.05}
        metalness={0.08}
        color="#b8e0f4"
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Water surface (animated) ─────────────────────────────────────────────────

function WaterSurface({ w, d, y }: { w: number; d: number; y: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = y + Math.sin(t * 0.45) * 0.015
    ref.current.rotation.x = -Math.PI / 2 + Math.sin(t * 0.3) * 0.008
  })
  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d, 1, 1]} />
      <meshStandardMaterial
        color="#38bdf8"
        transparent
        opacity={0.28}
        metalness={0.6}
        roughness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Fish mesh + animation ────────────────────────────────────────────────────

function Fish({
  base, color, phase, halfBounds, radius, behavior, cornerIdx,
}: {
  base: [number, number, number]
  color: string
  phase: number
  halfBounds: [number, number, number]
  radius: number
  behavior: FishBehavior
  cornerIdx: number
}) {
  const g = useRef<THREE.Group>(null)
  const R = radius

  useFrame(({ clock }) => {
    if (!g.current) return
    const t = clock.elapsedTime
    const [hX, hY, hZ] = halfBounds

    if (behavior === 'normal') {
      // Gentle sine-wave drift
      const swingX = Math.sin(t * 0.65 + phase) * Math.min(hX * 0.25, 0.6)
      const swingY = Math.sin(t * 0.4  + phase * 1.2) * Math.min(hY * 0.12, 0.25)
      g.current.position.set(base[0] + swingX, base[1] + swingY, base[2])
      g.current.rotation.y = Math.cos(t * 0.65 + phase) >= 0 ? 0 : Math.PI

    } else if (behavior === 'caution') {
      // 2x speed circular orbit — fish circle each other, staying > 20% apart
      const spd   = 1.3
      const orbitR = Math.min(hX * 0.22, 0.85)
      const ox = Math.sin(t * spd + phase) * orbitR
      const oz = Math.cos(t * spd + phase) * orbitR * 0.65
      const oy = Math.sin(t * 0.8 + phase * 1.2) * Math.min(hY * 0.1, 0.22)
      g.current.position.set(base[0] + ox, base[1] + oy, base[2] + oz)
      // Face direction of circular travel
      g.current.rotation.y = Math.atan2(
        Math.cos(t * spd + phase),
        Math.sin(t * spd + phase) * 0.65,
      )

    } else if (behavior === 'aggressive') {
      // 3x speed — tight aggressive patrol around tank center, darting movements
      const spd    = 1.95
      const orbitR = Math.min(hX * 0.5, 2.0)
      const dartX  = Math.sin(t * spd + phase) * orbitR
      const dartZ  = Math.cos(t * spd * 0.85 + phase * 0.7) * Math.min(hZ * 0.5, 2.0)
      const dartY  = Math.sin(t * 1.4 + phase) * Math.min(hY * 0.18, 0.4)
      // Aggressive fish patrol from center rather than base
      g.current.position.set(dartX, base[1] + dartY, dartZ)
      g.current.rotation.y = Math.atan2(
        Math.cos(t * spd + phase),
        -Math.sin(t * spd * 0.85 + phase * 0.7),
      )

    } else {
      // 'fleeing' — rush to assigned corner, tremble anxiously
      const corners: [number, number, number][] = [
        [ hX * 0.78,  0,  hZ * 0.78],
        [-hX * 0.78,  0,  hZ * 0.78],
        [ hX * 0.78,  0, -hZ * 0.78],
        [-hX * 0.78,  0, -hZ * 0.78],
      ]
      const [cx, , cz] = corners[cornerIdx % 4]
      // Interpolate strongly toward corner
      const tx = base[0] * 0.15 + cx * 0.85
      const tz = base[2] * 0.15 + cz * 0.85
      // Anxious high-frequency tremble at corner
      const trembleX = Math.sin(t * 3.8 + phase) * 0.16
      const trembleZ = Math.cos(t * 3.1 + phase) * 0.13
      const trembleY = Math.sin(t * 2.6 + phase) * Math.min(hY * 0.06, 0.12)
      g.current.position.set(tx + trembleX, base[1] + trembleY, tz + trembleZ)
      // Face away from center (toward corner wall)
      g.current.rotation.y = Math.atan2(cx, cz) + Math.PI
    }
  })

  // Aggressive fish get a red tint overlay; fleeing fish get desaturated
  const matColor = behavior === 'aggressive'
    ? blendHex(color, '#ff4444', 0.35)
    : behavior === 'fleeing'
    ? blendHex(color, '#aaaaaa', 0.3)
    : color

  return (
    <group ref={g} position={base}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[R, 12, 8]} />
        <meshStandardMaterial color={matColor} roughness={0.25} metalness={0.15} />
      </mesh>
      {/* Tail */}
      <mesh position={[-R * 1.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[R * 0.7, R * 1.4, 4]} />
        <meshStandardMaterial color={matColor} roughness={0.4} />
      </mesh>
      {/* Dorsal fin hint */}
      <mesh position={[0, R * 0.9, 0]}>
        <coneGeometry args={[R * 0.22, R * 0.6, 3]} />
        <meshStandardMaterial color={matColor} roughness={0.5} transparent opacity={0.8} />
      </mesh>
      {/* Eye white */}
      <mesh position={[R * 0.55, R * 0.22, R * 0.72]}>
        <sphereGeometry args={[R * 0.18, 7, 6]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Pupil */}
      <mesh position={[R * 0.58, R * 0.22, R * 0.82]}>
        <sphereGeometry args={[R * 0.09, 6, 5]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

// ─── Full 3D scene ────────────────────────────────────────────────────────────

function TankScene({
  tw, th, td, borderColor, fish, compatibilityStatus,
}: {
  tw: number; th: number; td: number
  borderColor: string
  fish: FishInstance[]
  compatibilityStatus: CompatibilityStatus
}) {
  const thick   = 0.045
  const innerW  = tw - thick * 2
  const innerH  = th - thick * 2
  const innerD  = td - thick * 2
  const subH    = 0.12  // substrate height
  const waterTop = th / 2 - thick - 0.02

  // Fish radius — proportional to smallest tank dimension, ~3× larger than before
  const fishR = Math.max(Math.min(tw, th, td) * 0.07, 0.35)

  // Golden-angle deterministic scatter — fills full tank volume, no corner clustering
  const positions = useMemo<[number, number, number][]>(() => {
    const n      = fish.length
    if (!n) return []
    const margin = fishR * 1.3
    const xHalf  = Math.max((innerW / 2 - margin) * 0.88, 0.01)
    const yMin   = -innerH / 2 + subH + margin
    const yMax   =  innerH / 2 - margin - 0.05
    const zHalf  = Math.max((innerD / 2 - margin) * 0.88, 0.01)
    return fish.map((_, i) => {
      const a = i * 2.618034  // golden ratio spreads evenly in X-Z
      const b = i * 1.618034
      const t = n === 1 ? 0.5 : i / (n - 1)
      return [
        Math.sin(a) * xHalf,
        yMin + t * (yMax - yMin),
        Math.cos(b) * zHalf,
      ]
    })
  }, [fish.length, innerW, innerH, innerD, subH, fishR]) // eslint-disable-line react-hooks/exhaustive-deps

  const hB: [number, number, number] = [innerW / 2, innerH / 2, innerD / 2]
  const maxDim = Math.max(tw, th, td)

  // Assign behavioral role to each fish based on compatibility + behaviorTag
  const behaviors = useMemo<FishBehavior[]>(() => {
    if (compatibilityStatus === 'INCOMPATIBLE') {
      const hasAggressor = fish.some(fi => fi.species.behaviorTag === 'AGGRESSIVE')
      return fish.map(fi =>
        fi.species.behaviorTag === 'AGGRESSIVE' && hasAggressor
          ? 'aggressive'
          : 'fleeing'
      )
    }
    if (compatibilityStatus === 'CAUTION') {
      return fish.map(() => 'caution')
    }
    return fish.map(() => 'normal')
  }, [fish, compatibilityStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 6]}   intensity={0.85} />
      <directionalLight position={[-4, 3, -3]} intensity={0.25} color="#a0d8ef" />
      <pointLight position={[0, th * 1.2, 0]}  intensity={0.5}  color="#b0e0ff" distance={maxDim * 4} />

      {/* Glass walls (5 panels — no top) */}
      <GlassPanel pos={[0,  0,  td / 2]}  size={[tw, th, thick]} />
      <GlassPanel pos={[0,  0, -td / 2]}  size={[tw, th, thick]} />
      <GlassPanel pos={[-tw / 2, 0, 0]}   size={[thick, th, td]} />
      <GlassPanel pos={[ tw / 2, 0, 0]}   size={[thick, th, td]} />
      <GlassPanel pos={[0, -th / 2, 0]}   size={[tw, thick, td]} />

      {/* Edge glow */}
      <TankEdges w={tw} h={th} d={td} color={borderColor} />

      {/* Water volume (tinted fill) */}
      <mesh>
        <boxGeometry args={[innerW, innerH, innerD]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      {/* Mid-tank horizontal water plane — gives visible blue water depth */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[innerW * 0.95, innerD * 0.95]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Water surface — animated plane */}
      <WaterSurface w={innerW} d={innerD} y={waterTop} />

      {/* Substrate / gravel bottom */}
      <mesh position={[0, -th / 2 + thick / 2 + subH / 2, 0]}>
        <boxGeometry args={[innerW, subH, innerD]} />
        <meshStandardMaterial color="#c4a882" roughness={0.95} metalness={0} />
      </mesh>

      {/* Subtle water column tint (back face of inner box) */}
      <mesh position={[0, subH / 4, 0]}>
        <boxGeometry args={[innerW * 0.98, innerH - subH, innerD * 0.98]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.032} side={THREE.BackSide} />
      </mesh>

      {/* Fish */}
      {fish.map((fi, i) => (
        <Fish
          key={`${fi.species.id}-${fi.idx}`}
          base={positions[i] ?? [0, 0, 0]}
          color={fishHsl(fi.species.id)}
          phase={(fi.species.id * 2.618 + fi.idx * 1.414) % (Math.PI * 2)}
          halfBounds={hB}
          radius={fishR}
          behavior={behaviors[i] ?? 'normal'}
          cornerIdx={fi.cornerIdx}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={maxDim * 0.5}
        maxDistance={maxDim * 4}
        target={[0, 0, 0]}
      />
    </>
  )
}

// ─── 2D SVG fallback (mobile) ─────────────────────────────────────────────────

function TankCanvas2D({
  L, H, tankItems, effectiveColor,
}: {
  L: number; H: number
  tankItems: TankItem[]
  effectiveColor: StatusColor
}) {
  const PAD  = 12
  const vW   = Math.max(L, 100)
  const vH   = Math.max(H, 50)
  const stroke = borderHex(effectiveColor)
  const MAX  = 10
  const displayItems = tankItems.slice(0, MAX)
  const remaining    = tankItems.length - MAX
  const innerW = vW - PAD * 2
  const innerH = vH - PAD * 2
  const n    = displayItems.length
  const cols = n > 0 ? Math.ceil(Math.sqrt(n)) : 1
  const rows = n > 0 ? Math.ceil(n / cols) : 1
  const cW   = innerW / cols
  const cH   = innerH / rows
  const R    = Math.min(cW * 0.28, cH * 0.28, vW * 0.06, 14)
  const fs   = R * 0.9
  const ls   = R * 0.65

  return (
    <svg viewBox={`0 0 ${vW} ${vH}`} width="100%" style={{ maxHeight: 320, display: 'block' }}>
      <rect x="2" y="2" width={vW - 4} height={vH - 4} rx="4"
        fill="oklch(96% 0.01 222 / 0.5)" stroke={stroke} strokeWidth="3" />
      <rect x="3" y="3" width={vW - 6} height={vH - 6} rx="3"
        fill="oklch(92% 0.04 222 / 0.3)" />

      {n === 0 && (
        <text x={vW / 2} y={vH / 2} textAnchor="middle" dominantBaseline="middle"
          fill="oklch(70% 0.01 222)" fontSize={Math.min(vW * 0.045, 12)}
          fontFamily="'Be Vietnam Pro', sans-serif">
          Thêm cá để bắt đầu mô phỏng
        </text>
      )}

      {displayItems.map((item, i) => {
        const col = i % cols, row = Math.floor(i / cols)
        const cx  = PAD + cW * col + cW / 2
        const cy  = PAD + cH * row + cH / 2
        const hue = (item.species.id * 137) % 360
        const fill = `hsl(${hue}, 60%, 55%)`
        return (
          <g key={item.species.id}>
            <circle cx={cx} cy={cy} r={R} fill={fill} opacity={0.9} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fill="white" fontSize={fs} fontWeight="600"
              fontFamily="'Be Vietnam Pro', sans-serif">
              {item.species.commonName.charAt(0).toUpperCase()}
            </text>
            <text x={cx} y={cy + R + ls + 1} textAnchor="middle" dominantBaseline="central"
              fill="oklch(30% 0.02 222)" fontSize={ls}
              fontFamily="'Be Vietnam Pro', sans-serif">
              ×{item.quantity}
            </text>
          </g>
        )
      })}

      {remaining > 0 && (
        <text x={vW - PAD} y={vH - PAD} textAnchor="end"
          fill="oklch(45% 0.02 222)" fontSize={Math.min(vW * 0.04, 10)}
          fontFamily="'Be Vietnam Pro', sans-serif">
          +{remaining} loài nữa
        </text>
      )}
    </svg>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function TankCanvas({
  length, height, width,
  tankItems, bioloadColor, compatibilityColor,
}: TankCanvasProps) {
  const isMobile = useIsMobile()

  const L = Number(length)
  const W = Number(width  || (length ? Number(length) * 0.5 : 0))
  const H = Number(height)
  const validDims = L > 0 && W > 0 && H > 0

  const effectiveColor = worstColor(compatibilityColor ?? null, bioloadColor)

  // Map color → semantic status for behavioral animations
  const compatibilityStatus: CompatibilityStatus =
    compatibilityColor === 'danger'  ? 'INCOMPATIBLE' :
    compatibilityColor === 'warning' ? 'CAUTION'      :
    compatibilityColor === 'success' ? 'COMPATIBLE'   : null

  // ── Invalid dims placeholder ──
  if (!validDims) {
    return (
      <div className="w-full flex-1 min-h-0 bg-background border-2 border-dashed border-border rounded-xl flex items-center justify-center" style={{ minHeight: 300 }}>
        <p className="text-ink-disabled text-sm">Nhập kích thước bể để hiển thị mô phỏng</p>
      </div>
    )
  }

  // ── Normalise to max 10 Three.js units — fills canvas better ──
  const scale = 10 / Math.max(L, W, H)
  const tw = L * scale
  const td = W * scale
  const th = H * scale

  // ── Flatten tank items → max 10 fish instances ──
  const fish: FishInstance[] = []
  for (const item of tankItems) {
    for (let i = 0; i < item.quantity && fish.length < 10; i++) {
      fish.push({ species: item.species, idx: i, cornerIdx: fish.length })
    }
  }

  const bColor = borderHex(effectiveColor)
  const camZ   = Math.max(tw, th, td) * 1.5

  // ── Mobile: disable OrbitControls, show 2D SVG ──
  if (isMobile) {
    return (
      <div className="w-full">
        <TankCanvas2D L={L} H={H} tankItems={tankItems} effectiveColor={effectiveColor} />
        {effectiveColor && (
          <p className="text-xs text-ink-muted text-center mt-1">
            Viền bể:{' '}
            <span className={
              effectiveColor === 'success' ? 'text-success font-medium' :
              effectiveColor === 'warning' ? 'text-warning font-medium' : 'text-danger font-medium'
            }>
              {effectiveColor === 'success' ? 'Tốt' :
               effectiveColor === 'warning' ? 'Cần chú ý' : 'Cảnh báo'}
            </span>
          </p>
        )}
      </div>
    )
  }

  // ── Desktop: full 3D Canvas ──
  const totalFishCount = tankItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      {/* Canvas fills remaining flex space */}
      <div className="relative flex-1 min-h-0" style={{ minHeight: 300 }}>
        {/* Empty-state overlay */}
        {fish.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <p className="text-ink-disabled text-sm bg-surface/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              Thêm cá để bắt đầu mô phỏng
            </p>
          </div>
        )}

        {/* Overflow caption */}
        {totalFishCount > 10 && (
          <p className="absolute bottom-2 right-3 text-xs text-ink-muted z-10">
            +{totalFishCount - 10} cá nữa
          </p>
        )}

        <Canvas
          camera={{ position: [tw * 0.25, th * 0.4, camZ], fov: 65 }}
          gl={{ antialias: true, alpha: true }}
          style={{ borderRadius: 8, position: 'absolute', inset: 0 }}
        >
          <TankScene
            tw={tw} th={th} td={td}
            borderColor={bColor}
            fish={fish}
            compatibilityStatus={compatibilityStatus}
          />
        </Canvas>
      </div>

      {/* Single-row status bar — always below canvas, never overlapped */}
      <div className="flex items-center justify-between mt-1.5 px-1 shrink-0">
        <span className="text-xs text-ink-disabled">Kéo để xoay · Scroll để zoom</span>
        {effectiveColor && (
          <span className={`text-xs font-medium ${
            effectiveColor === 'success' ? 'text-success' :
            effectiveColor === 'warning' ? 'text-warning' : 'text-danger'
          }`}>
            Viền:{' '}
            {effectiveColor === 'success' ? 'Tốt' :
             effectiveColor === 'warning' ? 'Cần chú ý' : 'Cảnh báo'}
          </span>
        )}
      </div>
    </div>
  )
}

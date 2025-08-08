import { useThree, useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import * as THREE from 'three'
import { Target, TargetObject } from "./Target"
import { Forest } from './Forest'
import { Bow } from './Bow'
import { Arrow } from './Arrow'
import { Sky } from '@react-three/drei'

interface FlyingArrowState {
	position: THREE.Vector3
	velocity: THREE.Vector3
	quaternion: THREE.Quaternion
	target?: Target
	alive: boolean
}

interface LodgedArrow {
	position: THREE.Vector3
	quaternion: THREE.Quaternion
}

// Main game scene component
export const ArcheryScene = ({ 
	targets, 
	isBowDrawn, 
	setIsBowDrawn, 
	onTargetHit,
}: { 
		targets: Target[], 
		isBowDrawn: boolean, 
		setIsBowDrawn: (value: boolean) => void,
		onTargetHit: (target: Target) => void,
	}) => {
	const { camera, gl, scene } = useThree()
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const [isAiming, setIsAiming] = useState(false)
	const [showArrow, setShowArrow] = useState(false)
	const [selectedTarget, setSelectedTarget] = useState<Target | null>(null)
	const bowBasePosition = useRef(new THREE.Vector3(0.22, 1.4, 1.25))
	const raycaster = useMemo(() => new THREE.Raycaster(), [])
	const [flyingArrow, setFlyingArrow] = useState<FlyingArrowState | null>(null)
	const gravity = useMemo(() => new THREE.Vector3(0, -9.81, 0), [])
	const drawStartRef = useRef<number | null>(null)
	const [drawAmount, setDrawAmount] = useState(0)
	const bowQuaternionRef = useRef(new THREE.Quaternion())
	const bowGroupRef = useRef<THREE.Group>(null)
	const tmpQ = useRef(new THREE.Quaternion()).current
	const aimPointRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, -20))
	const aimPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 20), []) // z = -20
	const [lodgedArrows, setLodgedArrows] = useState<LodgedArrow[]>([])

	// Reset arrows and aiming state when targets refresh (new word)
	useEffect(() => {
		setFlyingArrow(null)
		setLodgedArrows([])
		setShowArrow(false)
		setIsAiming(false)
		setIsBowDrawn(false)
		setSelectedTarget(null)
	}, [targets, setIsBowDrawn])

	// Camera & canvas
	useEffect(() => {
		camera.position.set(0, 1.6, 2.5)
		camera.lookAt(0, 1.6, 0)
		if (gl.domElement) canvasRef.current = gl.domElement
		scene.fog = new THREE.Fog('#bfe3ff', 10, 80)
	}, [camera, gl, scene])

	// Subtle idle camera sway (disabled while aiming)
	useFrame(({ clock }) => {
		if (isAiming) return
		const t = clock.getElapsedTime()
		camera.position.x = Math.sin(t * 0.4) * 0.03
		camera.position.y = 1.6 + Math.sin(t * 0.7) * 0.015
		camera.lookAt(0, 1.6, 0)
	})

	// Apply bow quaternion to group every frame (ensures smooth updates)
	useFrame(() => {
		if (bowGroupRef.current) {
			bowGroupRef.current.quaternion.copy(bowQuaternionRef.current)
		}
	})

	// Update bow draw amount while aiming
	useFrame(() => {
		if (isAiming && drawStartRef.current !== null) {
			const elapsed = (performance.now() - drawStartRef.current) / 1000
			setDrawAmount(THREE.MathUtils.clamp(elapsed / 0.8, 0, 1))
		} else if (!isAiming && drawAmount !== 0) {
			setDrawAmount(0)
		}
	})

	const screenToRay = useCallback((clientX: number, clientY: number) => {
		if (!canvasRef.current) return null
		const rect = canvasRef.current.getBoundingClientRect()
		const x = (clientX - rect.left) / rect.width * 2 - 1
		const y = -((clientY - rect.top) / rect.height * 2 - 1)
		const ndc = new THREE.Vector2(x, y)
		raycaster.setFromCamera(ndc, camera)
		return raycaster.ray.clone()
	}, [camera, raycaster])

	// Predict simple ballistic path and choose target closest to path rather than cursor ray
	const pickTargetByBallistic = useCallback(() => {
		// starting point and velocity from bow
		let forward = new THREE.Vector3(0, 1, 0)
		if (bowGroupRef.current) {
			bowGroupRef.current.getWorldQuaternion(tmpQ)
			forward = forward.applyQuaternion(tmpQ).normalize()
		}
		const origin = new THREE.Vector3()
		if (bowGroupRef.current) bowGroupRef.current.getWorldPosition(origin)
		const speed = 16 + 12 * drawAmount
		const vel0 = forward.multiplyScalar(speed)

		// sample points along the arc
		let best: Target | null = null
		let bestDist = Infinity
		const steps = 30
		const dt = 0.06
		let pos = origin.clone()
		let vel = vel0.clone()
		for (let i = 0; i < steps; i++) {
			pos = pos.clone().add(vel.clone().multiplyScalar(dt))
			vel = vel.clone().add(gravity.clone().multiplyScalar(dt))
			for (const t of targets) {
				const d = pos.distanceTo(t.position)
				if (d < bestDist) { bestDist = d; best = t }
			}
		}
		return best
	}, [drawAmount, gravity, targets, tmpQ])

	const updateAimAndSelection = useCallback((clientX: number, clientY: number) => {
		const ray = screenToRay(clientX, clientY)
		if (!ray) return

		// Aim point: intersect the ray with an arbitrary plane in front
		const hit = new THREE.Vector3()
		ray.intersectPlane(aimPlane, hit)
		aimPointRef.current.copy(hit)

		// Update bow orientation to look from bow world pos toward aim point
		let bowWorld = new THREE.Vector3()
		if (bowGroupRef.current) {
			bowGroupRef.current.getWorldPosition(bowWorld)
		} else {
			bowWorld = bowBasePosition.current.clone()
		}
		const toAim = hit.clone().sub(bowWorld).normalize()
		const up = new THREE.Vector3(0, 1, 0)
		bowQuaternionRef.current.copy(new THREE.Quaternion().setFromUnitVectors(up, toAim))

		// Select target by predicted ballistic path
		setSelectedTarget(pickTargetByBallistic())
	}, [aimPlane, screenToRay, pickTargetByBallistic])

	const handlePointerDown = useCallback((ev: MouseEvent | TouchEvent) => {
		ev.preventDefault()
		const touch = 'touches' in ev ? ev.touches[0] : (ev as MouseEvent)
		updateAimAndSelection(touch.clientX, touch.clientY)
		setIsAiming(true)
		setIsBowDrawn(true)
		setShowArrow(true)
		drawStartRef.current = performance.now()
	}, [setIsBowDrawn, updateAimAndSelection])

	const handlePointerMove = useCallback((ev: MouseEvent | TouchEvent) => {
		ev.preventDefault()
		if (!canvasRef.current) return
		const clientX = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX
		const clientY = 'touches' in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY
		if (isAiming) updateAimAndSelection(clientX, clientY)
	}, [isAiming, updateAimAndSelection])

	const getBowMuzzleWorld = useCallback(() => {
		const localArrowOrigin = new THREE.Vector3(0, 0, 0.05)
		const world = localArrowOrigin.clone()
		if (bowGroupRef.current) {
			bowGroupRef.current.updateWorldMatrix(true, false)
			bowGroupRef.current.localToWorld(world)
		}
		return world
	}, [])

	const spawnArrow = useCallback(() => {
		const origin = getBowMuzzleWorld()
		let forward = new THREE.Vector3(0, 1, 0)
		if (bowGroupRef.current) {
			bowGroupRef.current.getWorldQuaternion(tmpQ)
			forward = forward.applyQuaternion(tmpQ).normalize()
		}
		const speed = 16 + 12 * drawAmount
		const velocity = forward.clone().multiplyScalar(speed)
		setFlyingArrow({ position: origin, velocity, quaternion: new THREE.Quaternion().copy(tmpQ), target: selectedTarget ?? undefined, alive: true })
	}, [drawAmount, getBowMuzzleWorld, selectedTarget, tmpQ])

	const handlePointerUp = useCallback((ev: MouseEvent | TouchEvent) => {
		ev.preventDefault()
		if (!isAiming) return
		setIsAiming(false)
		setIsBowDrawn(false)
		setShowArrow(false)
		drawStartRef.current = null
		spawnArrow()
	}, [isAiming, setIsBowDrawn, spawnArrow])

	// Arrow physics
	useFrame((_, delta) => {
		if (!flyingArrow || !flyingArrow.alive) return
		const nextVelocity = flyingArrow.velocity.clone().add(gravity.clone().multiplyScalar(delta))
		const nextPosition = flyingArrow.position.clone().add(nextVelocity.clone().multiplyScalar(delta))

		// Face direction of travel
		const travelDir = nextVelocity.clone().normalize()
		const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), travelDir)

		// Hit detection: nearest target within a radius
		let hitTarget: Target | null = null
		let bestDist = Infinity
		for (const t of targets) {
			const dist = nextPosition.distanceTo(t.position)
			if (dist < 0.6 && dist < bestDist) { bestDist = dist; hitTarget = t }
		}

		// Stop if goes far away
		const tooFar = nextPosition.length() > 200 || nextPosition.y < -2
		if (hitTarget || tooFar) {
			setFlyingArrow(prev => prev ? { ...prev, alive: false } : null)
			if (hitTarget) {
				// Embed arrow into target: small offset forward to simulate penetration
				const embedPos = nextPosition.clone()
				const embedQuat = quat.clone()
				setLodgedArrows(prev => [...prev, { position: embedPos, quaternion: embedQuat }])
				onTargetHit(hitTarget)
			}
			return
		}

		setFlyingArrow({
			position: nextPosition,
			velocity: nextVelocity,
			quaternion: quat,
			target: flyingArrow.target,
			alive: true,
		})
	})

	// Event listeners
	useEffect(() => {
		const canvas = gl.domElement
		canvas.addEventListener('mousedown', handlePointerDown)
		canvas.addEventListener('mouseup', handlePointerUp)
		canvas.addEventListener('mousemove', handlePointerMove)
		canvas.addEventListener('touchstart', handlePointerDown)
		canvas.addEventListener('touchend', handlePointerUp)
		canvas.addEventListener('touchmove', handlePointerMove)
		return () => {
			canvas.removeEventListener('mousedown', handlePointerDown)
			canvas.removeEventListener('mouseup', handlePointerUp)
			canvas.removeEventListener('mousemove', handlePointerMove)
			canvas.removeEventListener('touchstart', handlePointerDown)
			canvas.removeEventListener('touchend', handlePointerUp)
			canvas.removeEventListener('touchmove', handlePointerMove)
		}
	}, [gl.domElement, handlePointerDown, handlePointerUp, handlePointerMove])

	return (
		<>
			{/* Lights */}
			<ambientLight intensity={0.45} />
			<directionalLight position={[6, 8, 6]} intensity={1.15} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
			<hemisphereLight intensity={0.5} color="#cfe9ff" groundColor="#7fb069" />

			{/* Sky */}
			<Sky sunPosition={[5, 12, 8]} turbidity={8} rayleigh={1.2} mieCoefficient={0.005} mieDirectionalG={0.9} />

			{/* Environment */}
			<Forest />
			{/* Large shadow receiver under scene */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
				<planeGeometry args={[120, 120]} />
				<shadowMaterial opacity={0.3} />
			</mesh>

			{/* Targets */}
			{targets.map((target, index) => (
				<TargetObject 
					key={index}
					position={target.position}
					word={target.word}
					isSelected={selectedTarget === target}
				/>
			))}

			{/* Aim reticle at aim point */}
			<mesh position={aimPointRef.current.toArray()}>
				<sphereGeometry args={[0.04, 12, 12]} />
				<meshBasicMaterial color="#ffffff" />
			</mesh>

			{/* Flying arrow */}
			{flyingArrow && flyingArrow.alive && (
				<Arrow position={flyingArrow.position} quaternion={flyingArrow.quaternion} />
			)}

			{/* Lodged arrows */}
			{lodgedArrows.map((a, i) => (
				<Arrow key={`lodged-${i}`} position={a.position} quaternion={a.quaternion} />
			))}

			{/* Player first-person bow and nocked arrow */}
			<group position={[0, 0, 0]}>
				<group ref={bowGroupRef} position={bowBasePosition.current.toArray()}>
					<Bow isDrawn={isBowDrawn} drawAmount={drawAmount} />
					{showArrow && (
						<Arrow position={new THREE.Vector3(0, 0, 0.05)} />
					)}
				</group>
			</group>
		</>
	)
}
import * as THREE from 'three'

interface BowProps {
	isDrawn: boolean
	rotation?: THREE.Euler
	quaternion?: THREE.Quaternion
	drawAmount?: number // 0..1
}

export function Bow ({ isDrawn, rotation, quaternion, drawAmount = 0.6 }: BowProps) {
	return (
		<group position={[0, 0, 0]} rotation={rotation} quaternion={quaternion} castShadow>
			{/* Main bow curve - slim limbs */}
			<mesh rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
				<torusGeometry args={[0.8, 0.04, 16, 32, Math.PI]} />
				<meshStandardMaterial color="#7c4a33" metalness={0.05} roughness={0.85} />
			</mesh>

			{/* Bow handle with slight notch */}
			<mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
				<cylinderGeometry args={[0.055, 0.055, 0.28, 16]} />
				<meshStandardMaterial color="#5a3b2e" />
			</mesh>
			<mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
				<capsuleGeometry args={[0.02, 0.04, 4, 8]} />
				<meshStandardMaterial color="#5a3b2e" />
			</mesh>

			{/* Bowstring */}
			<group position={[0, 0, 0.05]} rotation={[0, Math.PI / 2, 1.5]}>
				<line>
					<bufferGeometry
						attach="geometry"
						onUpdate={(self: THREE.BufferGeometry) => {
							const points: THREE.Vector3[] = []
							const segments = 24
							const height = 1.6
							const maxCurve = 0.35 * drawAmount

							if (isDrawn) {
								for (let i = 0; i <= segments; i++) {
									const y = (i / segments) * height - height / 2
									const t = i / segments
									const x = 4 * maxCurve * t * (1 - t)
									points.push(new THREE.Vector3(x, y, 0))
								}
							} else {
								points.push(
									new THREE.Vector3(0, -height / 2, 0),
									new THREE.Vector3(0, height / 2, 0)
								)
							}

							self.setFromPoints(points)
						}}
					/>
					<lineBasicMaterial attach="material" color="#e5e7eb" linewidth={3} />
				</line>
			</group>
		</group>
	)
}
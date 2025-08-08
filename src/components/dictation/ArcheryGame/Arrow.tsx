import * as THREE from 'three'
import { memo } from 'react'

interface ArrowProps {
	position: THREE.Vector3
	quaternion?: THREE.Quaternion
	rotation?: THREE.Euler
	length?: number
	color?: string
}

export const Arrow = memo(function Arrow ({
	position,
	quaternion,
	rotation,
	length = 0.9,
	color = '#d2b48c',
}: ArrowProps) {
	const vaneLen = 0.18
	const vaneWidth = 0.08
	const backY = -length / 2 + 0.06
	return (
		<group
			position={position}
			quaternion={quaternion}
			rotation={rotation}
			castShadow
		>
			{/* Shaft (aligned along Y axis) */}
			<mesh castShadow>
				<cylinderGeometry args={[0.015, 0.015, length, 16]} />
				<meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
			</mesh>

			{/* Tip at front (positive Y) */}
			<mesh position={[0, length / 2, 0]} castShadow>
				<coneGeometry args={[0.045, 0.16, 16]} />
				<meshStandardMaterial color="#6b7280" metalness={0.4} roughness={0.4} />
			</mesh>

			{/* Three fletchings at back around the shaft */}
			{[0, 120, 240].map((deg) => (
				<mesh key={deg} position={[0, backY, 0]} rotation={[0, THREE.MathUtils.degToRad(deg), 0]} castShadow>
					<boxGeometry args={[vaneWidth, 0.02, vaneLen]} />
					<meshStandardMaterial color="#ef4444" />
				</mesh>
			))}
		</group>
	)
})
  
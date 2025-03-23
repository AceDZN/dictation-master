import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
export const Arrow = ({ position, rotation, isFlying, targetPos }: { 
    position: THREE.Vector3, 
    rotation: THREE.Euler, 
    isFlying: boolean,
    targetPos?: THREE.Vector3
  }) => {
    const arrowRef = useRef<THREE.Group>(null)
    //const initialRotation = useRef<THREE.Euler>(rotation.clone())
    
    // Animate arrow flight if it's flying
    useFrame((state, delta) => {
      if (isFlying && arrowRef.current && targetPos) {
        // Get current position
        const current = arrowRef.current.position
        
        
        // Move toward target
        const speed = 15 * delta // Reduced speed for better visibility
        const direction = new THREE.Vector3(
          targetPos.x - current.x,
          targetPos.y - current.y,
          targetPos.z - current.z
        ).normalize()
        
        // Update position
        current.x += direction.x * speed
        current.y += direction.y * speed
        current.z += direction.z * speed
        
        // Update flight orientation to point in direction of travel
        if (arrowRef.current) {
          // Create a look-at matrix pointing in the direction of travel
          const lookAt = new THREE.Matrix4()
          lookAt.lookAt(
            new THREE.Vector3(0, 0, 0),
            direction,
            new THREE.Vector3(0, 2, 3)
          )
          
          // Set quaternion directly from the look-at matrix
          arrowRef.current.quaternion.setFromRotationMatrix(lookAt)
        }
      }
    })
    
    return (
      <group ref={arrowRef} position={position} rotation={rotation}>
        {/* Arrow shaft - aligned along forward axis */}
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
        
        {/* Arrow tip - at the front */}
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.04, 0.15, 8]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
        
        {/* Arrow fletchings - at the back */}
        <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.02, 0.15]} />
          <meshStandardMaterial color="#ff3333" />
        </mesh>
        <mesh position={[0, -0.35, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.02, 0.15]} />
          <meshStandardMaterial color="#ff3333" />
        </mesh>
      </group>
    )
  }
  
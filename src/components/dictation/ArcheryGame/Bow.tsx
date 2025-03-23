import * as THREE from 'three'

export const Bow = ({ isDrawn, rotation }: { isDrawn: boolean, rotation: THREE.Euler }) => {
    // Improved bow visualization
    return (
      <group position={[0, 0, 0]} rotation={rotation}>
        {/* Main bow curve - half circle */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.8, 0.05, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Bow handle */}
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        
        {/* Bowstring - curved when drawn */}
        <group position={[0, 0, 0.05]} rotation={[0, Math.PI / 2, 1.5]}>
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self: THREE.BufferGeometry) => {
                const points = []
                const segments = 20
                const height = 1.6
                
                // Create curved or straight string based on drawn state
                if (isDrawn) {
                  const maxCurve = 0.3
                  // Create curved line when drawn
                  for (let i = 0; i <= segments; i++) {
                    const y = (i / segments) * height - height/2
                    const t = i / segments
                    // Quadratic curve formula
                    const x = 4 * maxCurve * t * (1 - t)
                    points.push(new THREE.Vector3(x, y, 0))
                  }
                } else {
                  // Straight line when not drawn
                  points.push(
                    new THREE.Vector3(0, -height/2, 0),
                    new THREE.Vector3(0, height/2, 0)
                  )
                }
                
                self.setFromPoints(points)
              }}
            />
            <lineBasicMaterial attach="material" color="#ffffff" linewidth={3} />
          </line>
        </group>
      </group>
    )
  }
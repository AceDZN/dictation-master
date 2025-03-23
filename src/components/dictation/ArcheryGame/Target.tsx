import { useCanvasText } from "./utils"
import * as THREE from 'three'
export interface Target {
    position: THREE.Vector3
    word: string
    isCorrect: boolean
  }
  
  
export  const TargetObject = ({ position, word, isSelected }: { position: THREE.Vector3, word: string, isSelected: boolean }) => {
    // Generate texture for the word
    const wordTexture = useCanvasText(word, 76, 'white', 'Alef')
    
    return (
      <group position={position}>
        {/* Target circles */}
        <mesh>
          <circleGeometry args={[1, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.6, 32]} />
          <meshStandardMaterial color="#0000ff" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.4, 32]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color={isSelected ? "#00ff00" : "#000000"} />
        </mesh>
        
        {/* Target stand */}
        <mesh position={[0, -1.5, 0]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Word banner */}
        <group position={[0, 2.5, 0]}>
          {/*<mesh position={[0, 0, 0]}>
            <planeGeometry args={[3, 1.7]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>*/}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[3.5, 2.3]} />
            {wordTexture ? (
              <meshBasicMaterial map={wordTexture} transparent opacity={1} />
            ) : (
              <meshBasicMaterial color="#000000" transparent opacity={0.7} />
            )}
          </mesh>
        </group>
      </group>
    )
  }
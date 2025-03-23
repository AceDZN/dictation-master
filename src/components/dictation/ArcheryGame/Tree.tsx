import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'

// Tree model component with GLTF loading
export const TreeModel = ({ position, scale = 1, variant = 1, rotation = 0 }: { position: [number, number, number], scale?: number, variant?: number, rotation?: number }) => {
    // Load the model based on variant
    const modelPath = `/3d-models/tree-${variant}-c.glb`
    const { scene } = useGLTF(modelPath)
    
    // Clone the model scene to avoid reference issues
    const modelScene = useMemo(() => scene.clone(), [scene])
    
    return (
      <primitive 
        object={modelScene} 
        position={position} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
      />
    )
  }
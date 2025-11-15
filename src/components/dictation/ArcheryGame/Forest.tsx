import { useMemo } from "react"
import { TreeModel } from "./Tree"
import { useGLTF } from "@react-three/drei"

// Forest with GLB tree models
export const Forest = () => {
  // Use useMemo to create stable tree positions that don't change on re-renders

  // Pre-load all tree models to avoid loading delays during gameplay
  useGLTF.preload('/3d-models/tree-1-c.glb')
  useGLTF.preload('/3d-models/tree-2-c.glb')
  useGLTF.preload('/3d-models/tree-3-c.glb')

  const treesCount = 6
  const MIN_TREE_DISTANCE = 15 // Minimum distance between trees

  const trees = useMemo(() => {
    const treeParams = [8, 4]

    // Helper function to calculate distance between two points
    const calculateDistance = (x1: number, z1: number, x2: number, z2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2))
    }

    // Helper function to check if a position is too close to existing trees
    const isTooClose = (x: number, z: number, existingTrees: Array<{ x: number, z: number }>) => {
      return existingTrees.some(tree =>
        calculateDistance(x, z, tree.x, tree.z) < MIN_TREE_DISTANCE
      )
    }

    const treePositions = []
    const treePosition = treeParams.map((param) => param * 10)
    let attempts = 0
    const maxAttempts = 100 // Prevent infinite loops
    const variant = Math.floor(Math.random() * 3) + 1
    while (treePositions.length < treesCount && attempts < maxAttempts) {
      attempts++

      // Generate positions only in front of the player (negative z values)
      // Player is at origin (0,0,0) looking down negative z-axis
      const x = Math.random() * treePosition[0] - treePosition[1]
      const minZ = -40 // Minimum distance (closest to player)
      const maxZ = -60 // Maximum distance (furthest from player)
      const z = -(Math.random() * (maxZ - minZ)) + minZ // Random z between min and max

      // Keep trees away from the center path but still in front
      const distFromCenterX = Math.abs(x) // Only check x-distance for a clear path
      if (distFromCenterX < 8) continue // Create a corridor in front of the player

      // Check if this position is too close to existing trees
      if (isTooClose(x, z, treePositions)) continue

      // Random tree variant (1, 2, or 3)

      const y = variant === 3 ? 9.5 : 13
      // Random scale for variety
      const treeScale = treeParams.map((param) => param * 4)
      const scale = treeScale[0] + Math.random() * treeScale[1]
      const rotation = Math.random() * 2 * Math.PI

      treePositions.push({ id: treePositions.length, x, y: y /*+ Math.random() * 2*/, z, variant, scale, rotation })
    }
    return treePositions
  }, [treesCount]) // Only treesCount as dependency since treeParams and isTooClose are now inside

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4f772d" />
      </mesh>

      {/* Trees with GLB models */}
      {trees.map((tree) => (
        <TreeModel
          key={tree.id}
          position={[tree.x, tree.y, tree.z]}
          variant={tree.variant}
          scale={tree.scale}
          rotation={tree.rotation}
        />
      ))}
    </group>
  )
}

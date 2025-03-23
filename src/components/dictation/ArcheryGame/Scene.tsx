import { useThree } from "@react-three/fiber"
import { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from 'three'
//import { useCanvasText } from "./utils"
import { Target, TargetObject } from "./Target"
//import { WordPair } from "@/lib/types"
import { useControls, button } from 'leva'
import { Forest } from './Forest'
import { Bow } from './Bow'
import { Arrow } from './Arrow'



// Main game scene component
export const ArcheryScene = ({ 
    targets, 
    isBowDrawn, 
    setIsBowDrawn, 
    onTargetHit,
    debugMode
  }: { 
    
    targets: Target[], 
    isBowDrawn: boolean, 
    setIsBowDrawn: (value: boolean) => void,
    onTargetHit: (target: Target) => void,
    debugMode: boolean
  }) => {
    const { camera, gl } = useThree()
    const [isAiming, setIsAiming] = useState(false)
    const [showArrow, setShowArrow] = useState(false)
    const [selectedTarget, setSelectedTarget] = useState<Target | null>(null)
    const [, setAimPoint] = useState(new THREE.Vector3(0, 0, -10))
    const [isArrowFlying, setIsArrowFlying] = useState(false)
    const [flyingArrowInfo, setFlyingArrowInfo] = useState<{position: THREE.Vector3, rotation: THREE.Euler, targetPos: THREE.Vector3} | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [bowRotation, setBowRotation] = useState(new THREE.Euler(-3, 0, 0))
    const [isRotationLocked, setIsRotationLocked] = useState(false)
    const [bowPosition, setBowPosition] = useState(new THREE.Vector3(0, 1.5, 4.25))
    
    // Debug controls using Leva - simple approach
    const {
      'enabled': enabled,
      'bow.position.x': bowPositionX,
      'bow.position.y': bowPositionY,
      'bow.position.z': bowPositionZ,
      'bow.rotation.rotationLock': rotationLock,
      'bow.rotation.x': bowRotationX,
      'bow.rotation.y': bowRotationY,
      'bow.rotation.z': bowRotationZ,
    } = useControls('Archery Debug', {
      enabled: { value: debugMode, label: 'Debug Mode' },
      'bow.position.x': { value: bowPosition.x, min: -2, max: 5, step: 0.01, label: 'X' },
      'bow.position.y': { value: bowPosition.y, min: -2, max: 5, step: 0.01, label: 'Y' },
      'bow.position.z': { value: bowPosition.z, min: -2, max: 5, step: 0.01, label: 'Z' },
      'bow.rotation.rotationLock': { value: false, label: 'Lock Rotation' },
      'bow.rotation.x': { value: bowRotation.x, min: -Math.PI, max: Math.PI, step: 0.01, label: 'X (rad)' },
      'bow.rotation.y': { value: bowRotation.y, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Y (rad)' },
      'bow.rotation.z': { value: bowRotation.z, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Z (rad)' },
      resetBow: button(() => {
        console.log('resetBow',enabled)
        setBowPosition(new THREE.Vector3(bowPositionX, bowPositionY, bowPositionZ))
        setBowRotation(new THREE.Euler(bowRotation.x, bowRotation.y, bowRotation.z))
      }),
    })
    
    // Update internal state when debug controls change
    useEffect(() => {
      setBowPosition(new THREE.Vector3(
        bowPositionX,
        bowPositionY,
        bowPositionZ
      ))
      
      setIsRotationLocked(rotationLock)
      
      if (isRotationLocked) {
        setBowRotation(new THREE.Euler(
          bowRotationX,
          bowRotationY,
          bowRotationZ
        ))
      }
    }, [
      bowPositionX,
      bowPositionY,
      bowPositionZ,
      rotationLock,
      bowRotationX,
      bowRotationY,
      bowRotationZ,
      isRotationLocked
    ])
    
    
    
    // Set up camera and store canvas reference
    useEffect(() => {
      camera.position.set(0, 1.7, 5) // Simulating player height and position
      camera.lookAt(0, 1.7, 0)
      
      // Store canvas reference for accurate mouse position
      if (gl.domElement) {
        canvasRef.current = gl.domElement
      }
    }, [camera, gl])
    
    // Handle mouse/touch down
    const handlePointerDown = useCallback((event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      
      // Calculate closest target on click if canvas is available
      if (canvasRef.current) {
        // Get canvas bounds
        const rect = canvasRef.current.getBoundingClientRect()
        
        // Get client coordinates based on event type
        const clientX = 'touches' in event 
          ? event.touches[0].clientX - rect.left
          : event.clientX - rect.left
        
        const clientY = 'touches' in event 
          ? event.touches[0].clientY - rect.top
          : event.clientY - rect.top
        
        // Convert to normalized device coordinates (-1 to 1)
        const x = (clientX / rect.width) * 2 - 1
        const y = -(clientY / rect.height) * 2 + 1
        
        // Only update Z rotation based on mouse X position within limited range
        // Flip the sign so the bow rotates in the correct direction
        const rotZ = -x * 0.45 // Scale factor to fit within our range with inverted direction
        // Clamp the rotation between -0.6 and 0.3 (flipped from before)
        const clampedRotZ = Math.max(-0.6, Math.min(0.3, rotZ))
        
        // Keep the X and Y rotation fixed, only update Z
        setBowRotation(new THREE.Euler(-1.5, 0, clampedRotZ))
        
        // Create aim point in 3D space for target selection
        const aimDir = new THREE.Vector3(x, y, -1).unproject(camera)
        const cameraPos = camera.position.clone()
        const dir = aimDir.sub(cameraPos).normalize()
        
        // Create a ray from camera position in aim direction
        const raycaster = new THREE.Raycaster(cameraPos, dir)
        
        // Find closest target the ray intersects
        let closestTarget = null
        let closestDistance = Infinity
        
        targets.forEach(target => {
          const targetPos = new THREE.Vector3(target.position.x, target.position.y, target.position.z)
          const distance = raycaster.ray.distanceToPoint(targetPos)
          
          if (distance < closestDistance && distance < 15) {
            closestDistance = distance
            closestTarget = target
          }
        })
        
        setSelectedTarget(closestTarget)
        
        // Calculate aim point for arrow/bow to point toward
        const targetPoint = closestTarget !== null
          ? new THREE.Vector3((closestTarget as Target).position.x, (closestTarget as Target).position.y, (closestTarget as Target).position.z)
          : cameraPos.clone().add(dir.multiplyScalar(20))
        
        setAimPoint(targetPoint)
      }
      
      setIsAiming(true)
      setIsBowDrawn(true)
      setShowArrow(true)
    }, [setIsBowDrawn, canvasRef, targets, camera, setBowRotation])
    
    // Handle mouse/touch up - release arrow
    const handlePointerUp = useCallback((event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      if (!isAiming) return
      
      // Set arrow flying if we have a target
      if (selectedTarget) {
        // Start arrow flight animation
        const arrowPosition = new THREE.Vector3(
          bowPosition.x,
          bowPosition.y, 
          bowPosition.z + 0.05
        )
        
        const targetPosition = new THREE.Vector3(
          (selectedTarget as Target).position.x,
          (selectedTarget as Target).position.y,
          (selectedTarget as Target).position.z
        )
        
        setFlyingArrowInfo({
          position: arrowPosition,
          rotation: new THREE.Euler(0, 0, 2), // Use current bow rotation for initial arrow direction
          targetPos: targetPosition
        })
        
        setIsArrowFlying(true)
        
        // Hide bow arrow after a short delay
        setTimeout(() => {
          setIsAiming(false)
          setIsBowDrawn(false)
          setShowArrow(false)
        }, 100)
        
        // Register hit after flight time - increased for slower arrow
        setTimeout(() => {
          onTargetHit(selectedTarget)
          setIsArrowFlying(false)
          setFlyingArrowInfo(null)
        }, 600)
      } else {
        // No target, just reset
        setIsAiming(false)
        setIsBowDrawn(false)
        setShowArrow(false)
      }
    }, [isAiming, selectedTarget, setIsBowDrawn, onTargetHit, bowRotation, bowPosition])
    
    // Handle mouse/touch move for aiming
    const handlePointerMove = useCallback((event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      if (!canvasRef.current) return
      
      // If rotation is locked in debug mode, don't update rotation based on mouse
      if (isRotationLocked) return
      
      // Get canvas bounds
      const rect = canvasRef.current.getBoundingClientRect()
      
      // Get client coordinates based on event type
      const clientX = 'touches' in event 
        ? event.touches[0].clientX - rect.left
        : event.clientX - rect.left
      
      const clientY = 'touches' in event 
        ? event.touches[0].clientY - rect.top
        : event.clientY - rect.top
      
      // Convert to normalized device coordinates (-1 to 1)
      const x = (clientX / rect.width) * 2 - 1
      
      // Only update Z rotation based on mouse X position within limited range
      // Flip the sign so the bow rotates in the correct direction
      const rotZ = -x * 0.45 // Scale factor to fit within our range with inverted direction
      // Clamp the rotation between -0.6 and 0.3 (flipped from before)
      const clampedRotZ = Math.max(-0.6, Math.min(0.3, rotZ))
      
      // Keep the X and Y rotation fixed, only update Z
      setBowRotation(new THREE.Euler(-1.5, 0, clampedRotZ))
      
      // Create aim point in 3D space for target selection
      const y = -(clientY / rect.height) * 2 + 1
      const aimDir = new THREE.Vector3(x, y, -1).unproject(camera)
      const cameraPos = camera.position.clone()
      const dir = aimDir.sub(cameraPos).normalize()
      
      // Only continue with target selection if we're aiming
      if (!isAiming) return
      
      // Create a ray from camera position in aim direction
      const raycaster = new THREE.Raycaster(cameraPos, dir)
      
      // Find closest target the ray intersects
      let closestTarget = null
      let closestDistance = Infinity
      
      targets.forEach(target => {
        const targetPos = new THREE.Vector3(target.position.x, target.position.y, target.position.z)
        const distance = raycaster.ray.distanceToPoint(targetPos)
        
        if (distance < closestDistance && distance < 15) {
          closestDistance = distance
          closestTarget = target
        }
      })
      
      setSelectedTarget(closestTarget)
      
      // Calculate aim point for arrow/bow to point toward
      const targetPoint = closestTarget !== null
        ? new THREE.Vector3((closestTarget as Target).position.x, (closestTarget as Target).position.y, (closestTarget as Target).position.z)
        : cameraPos.clone().add(dir.multiplyScalar(20))
      
      setAimPoint(targetPoint)
      
    }, [isAiming, targets, camera, canvasRef, isRotationLocked])
    
    // Set up event listeners
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
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <hemisphereLight intensity={0.4} color="#164413" groundColor="#164413" />
        
        {/* Environment */}
        <Forest />
        
        {/* Targets */}
        {targets.map((target, index) => (
          <TargetObject 
            key={index}
            position={target.position}
            word={target.word}
            isSelected={selectedTarget === target}
          />
        ))}
        
        {/* Flying arrow when released */}
        {isArrowFlying && flyingArrowInfo && (
          <Arrow 
            position={flyingArrowInfo.position}
            rotation={flyingArrowInfo.rotation}
            isFlying={true}
            targetPos={flyingArrowInfo.targetPos}
          />
        )}
        
        {/* Player's first-person view */}
        <group position={[0, 0, 0]}>
          {/* Bow centered at bottom of screen - use debug position */}
          <group position={[bowPosition.x, bowPosition.y, bowPosition.z]}>
            <Bow isDrawn={isBowDrawn} rotation={bowRotation} />
          
            {/* Arrow - positioned in the bow when aiming - correctly at the middle */}
            {showArrow && (
              <Arrow 
                position={new THREE.Vector3(0, 0, 0.05)}
                rotation={bowRotation}
                isFlying={false}
              />
            )}
          </group>
        </group>
        
        
      </>
    )
  }
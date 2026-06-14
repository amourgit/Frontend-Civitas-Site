"use client"

import { useRef, useEffect } from "react"
import { Canvas, useThree, useLoader } from "@react-three/fiber"
import { EffectComposer, GlitchPass, RenderPass } from "three-stdlib"
import * as THREE from "three"

interface GlitchSceneProps {
  isHovered: boolean
}

function GlitchScene({ isHovered }: GlitchSceneProps) {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const glitchPassRef = useRef<GlitchPass | null>(null)
  
  // Load textures with fallback to existing images
  const defaultTexture = useLoader(THREE.TextureLoader, "/images/background1.webp")
  const hoverTexture = useLoader(THREE.TextureLoader, "/images/ECV10_1_ZC5.webp")
  
  // Select texture based on hover state
  const texture = isHovered ? hoverTexture : defaultTexture

  useEffect(() => {
    // Calculate aspect ratios
    const imageAspect = texture.image.width / texture.image.height
    const screenAspect = size.width / size.height
    
    // Use orthographic camera
    const frustumSize = 1
    camera.left = -frustumSize * screenAspect
    camera.right = frustumSize * screenAspect
    camera.top = frustumSize
    camera.bottom = -frustumSize
    camera.near = 0.1
    camera.far = 1000
    ;(camera as THREE.OrthographicCamera).updateProjectionMatrix()
    
    // Calculate scale to cover screen while maintaining aspect ratio
    // This mimics CSS background-size: cover
    const scale = Math.max(
      (2 * frustumSize * screenAspect) / (imageAspect * 2 * frustumSize),
      1
    )
    
    const planeWidth = imageAspect * 2 * frustumSize * scale
    const planeHeight = 2 * frustumSize * scale
    
    // Create a plane geometry that covers the viewport
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(geometry, material)
    meshRef.current = mesh
    
    // Position camera to see the plane
    camera.position.z = 1
    
    // Add mesh to scene
    scene.add(mesh)

    // Setup post-processing
    const composer = new EffectComposer(gl)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Add glitch pass
    const glitchPass = new GlitchPass()
    glitchPass.goWild = false // Set to true for more intense glitch
    composer.addPass(glitchPass)
    glitchPassRef.current = glitchPass

    composerRef.current = composer

    return () => {
      if (meshRef.current) {
        scene.remove(meshRef.current)
        meshRef.current.geometry.dispose()
        ;(meshRef.current.material as THREE.Material).dispose()
      }
      // Le composer (et ses render targets/framebuffers GPU) etait recree
      // a chaque changement de `texture` (survol du bouton) sans jamais
      // etre dispose : fuite memoire GPU qui grossissait a chaque hover.
      // On le dispose ici, avant qu'un nouveau composer ne soit cree au
      // prochain run de cet effet (ou au demontage du composant).
      composer.dispose?.()
      if (composerRef.current === composer) {
        composerRef.current = null
      }
    }
  }, [gl, scene, camera, texture, size])

  // Update texture when hover state changes
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.map = texture
      material.needsUpdate = true
    }
  }, [texture])

  // Disable glitch effect when hovering
  useEffect(() => {
    if (glitchPassRef.current) {
      if (isHovered) {
        // Disable glitch immediately when hovering
        glitchPassRef.current.enabled = false
      } else {
        // Re-enable glitch with a random delay when unhovered
        const randomDelay = Math.random() * 2000 + 500 // Random delay between 500ms and 2500ms
        const timeoutId = setTimeout(() => {
          if (glitchPassRef.current) {
            glitchPassRef.current.enabled = true
          }
        }, randomDelay)
        
        return () => clearTimeout(timeoutId)
      }
    }
  }, [isHovered])

  // Update composer on resize
  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height)
    }
  }, [size])

  // Render using composer
  useEffect(() => {
    let rafId: number
    const animate = () => {
      if (composerRef.current) {
        composerRef.current.render()
      }
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    // Sans ce cleanup, cette boucle de rendu (composer.render() a 60fps,
    // post-processing inclus) continuait indefiniment meme apres le
    // demontage du composant.
    return () => cancelAnimationFrame(rafId)
  }, [])

  return null
}

interface GlitchBackgroundProps {
  isHovered: boolean
}

export function GlitchBackground({ isHovered }: GlitchBackgroundProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        gl={{ alpha: false, antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <GlitchScene isHovered={isHovered} />
      </Canvas>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />
    </div>
  )
}

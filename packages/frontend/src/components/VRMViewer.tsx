import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { VRMAnimationLoaderPlugin, VRMAnimation } from '@pixiv/three-vrm-animation'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EmotionMarker } from '@vrm-food-reviewer/shared'
import './VRMViewer.css'

interface VRMViewerProps {
  emotionMarkers?: EmotionMarker[]
  isPlaying?: boolean
  loading?: boolean
}

export const VRMViewer = ({ emotionMarkers, isPlaying, loading }: VRMViewerProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const vrmRef = useRef<VRM | null>(null)
  const animationIdRef = useRef<number>()
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)
  const [loadingState, setLoadingState] = useState<'loading' | 'error' | 'ready'>('loading')

  useEffect(() => {
    if (!mountRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    
    // Load izakaya background image
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      '/images/居酒屋のテーブル席.jpg',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.background = texture
        console.log('Izakaya background loaded successfully')
      },
      undefined,
      (error) => {
        console.warn('Background texture not found, using warm gradient:', error)
        // Fallback to warm restaurant-like gradient
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 1024
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
          gradient.addColorStop(0, '#D4A574') // Warm beige center
          gradient.addColorStop(0.5, '#8B4513') // Medium brown
          gradient.addColorStop(1, '#2F1B14') // Dark brown edges
          
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 1024, 1024)
        }
        
        const fallbackTexture = new THREE.CanvasTexture(canvas)
        scene.background = fallbackTexture
      }
    )
    
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      20
    )
    camera.position.set(0, 1.0, 1.8)
    camera.lookAt(0, 0.8, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Lighting setup
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(2, 4, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Add front fill light
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8)
    frontLight.position.set(0, 2, 4)
    scene.add(frontLight)

    // Load default VRM character (only once)
    loadVRMCharacter()

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      const deltaTime = clockRef.current.getDelta()
      
      // Update animation mixer
      if (mixerRef.current) {
        mixerRef.current.update(deltaTime)
      }
      
      // Update VRM
      if (vrmRef.current) {
        vrmRef.current.update(deltaTime)
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      window.removeEventListener('resize', handleResize)
      
      // Cleanup animation mixer
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = null
      }
      
      // Clear VRM reference
      vrmRef.current = null
      
      // Clear the entire scene
      if (sceneRef.current) {
        sceneRef.current.clear()
        sceneRef.current = null
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      renderer.dispose()
    }
  }, [])

  const loadVRMCharacter = async () => {
    try {
      setLoadingState('loading')
      
      // Create GLTF loader with VRM plugin
      const loader = new GLTFLoader()
      loader.register((parser) => new VRMLoaderPlugin(parser))
      
      // Load the actual VRM file
      const vrmUrl = '/models/misuzu.vrm'
      
      loader.load(
        vrmUrl,
        (gltf) => {
          const vrm = gltf.userData.vrm as VRM
          
          if (vrm && sceneRef.current) {
            // Clear ALL existing models from the scene (except lights)
            const objectsToRemove = []
            sceneRef.current.traverse((child) => {
              if (child.type !== 'DirectionalLight' && child.type !== 'AmbientLight' && child !== sceneRef.current) {
                objectsToRemove.push(child)
              }
            })
            objectsToRemove.forEach(obj => {
              if (obj.parent) {
                obj.parent.remove(obj)
              }
            })
            
            // Also clear any existing VRM
            if (vrmRef.current && vrmRef.current.scene) {
              sceneRef.current.remove(vrmRef.current.scene)
            }
            
            // VRM helper utilities
            VRMUtils.removeUnnecessaryVertices(gltf.scene)
            VRMUtils.removeUnnecessaryJoints(gltf.scene)
            
            // Scale and position the VRM model
            vrm.scene.scale.setScalar(1.2) // Make character larger
            vrm.scene.position.set(0, -0.5, 0)
            vrm.scene.rotation.y = Math.PI // Turn around to face forward (VRM models usually face backwards by default)
            
            // Add to scene
            sceneRef.current.add(vrm.scene)
            vrmRef.current = vrm
            
            // Set up expressions if available
            if (vrm.expressionManager) {
              // Initialize neutral expression
              vrm.expressionManager.setValue('neutral', 1.0)
            }
            
            setLoadingState('ready')
            console.log('VRM character loaded successfully')
            
            // Load and start VRMA idle animation (this will handle pose naturally)
            loadVRMAAnimation(vrm)
          } else {
            throw new Error('Failed to parse VRM from GLTF')
          }
        },
        (progress) => {
          const percentage = (progress.loaded / progress.total) * 100
          // Only log every 10% to reduce console spam
          if (percentage % 10 < 1) {
            console.log(`VRM loading progress: ${percentage.toFixed(0)}%`)
          }
        },
        (error) => {
          console.error('Failed to load VRM file:', error)
          setLoadingState('error')
        }
      )
    } catch (error) {
      console.error('Failed to initialize VRM loader:', error)
      setLoadingState('error')
    }
  }

  const applyNaturalPose = (vrm: VRM) => {
    if (!vrm.humanoid) return
    
    // Reset the pose first using the correct method
    vrm.humanoid.resetRawPose()
    
    // Get all necessary bones
    const bones = {
      leftUpperArm: vrm.humanoid.getRawBoneNode('leftUpperArm'),
      rightUpperArm: vrm.humanoid.getRawBoneNode('rightUpperArm'),
      leftLowerArm: vrm.humanoid.getRawBoneNode('leftLowerArm'),
      rightLowerArm: vrm.humanoid.getRawBoneNode('rightLowerArm'),
      leftHand: vrm.humanoid.getRawBoneNode('leftHand'),
      rightHand: vrm.humanoid.getRawBoneNode('rightHand')
    }
    
    // Apply rotations to create natural arm pose
    // Upper arms - rotate down and slightly forward
    if (bones.leftUpperArm) {
      bones.leftUpperArm.rotation.z = Math.PI * 0.45  // 81 degrees
      bones.leftUpperArm.rotation.x = Math.PI * 0.05  // Slight forward
    }
    if (bones.rightUpperArm) {
      bones.rightUpperArm.rotation.z = -Math.PI * 0.45
      bones.rightUpperArm.rotation.x = Math.PI * 0.05
    }
    
    // Lower arms - slight bend at elbow
    if (bones.leftLowerArm) {
      bones.leftLowerArm.rotation.y = Math.PI * 0.1
    }
    if (bones.rightLowerArm) {
      bones.rightLowerArm.rotation.y = -Math.PI * 0.1
    }
    
    // Hands - natural relaxed position
    if (bones.leftHand) {
      bones.leftHand.rotation.z = Math.PI * 0.05
    }
    if (bones.rightHand) {
      bones.rightHand.rotation.z = -Math.PI * 0.05
    }
    
    // Update the VRM after pose changes
    vrm.humanoid.update()
    vrm.update(0)
    
    console.log('Natural pose applied to VRM')
  }

  const loadVRMAAnimation = async (vrm: VRM) => {
    try {
      console.log('Loading VRMA animation...')
      
      // Create GLTF loader with VRM Animation plugin
      const loader = new GLTFLoader()
      loader.register((parser) => new VRMAnimationLoaderPlugin(parser))
      
      // Load the VRMA animation file
      const vrmAnimationUrl = '/models/idle_loop.vrma'
      
      loader.load(
        vrmAnimationUrl,
        (gltf) => {
          const vrmAnimation = gltf.userData.vrmAnimation as VRMAnimation
          
          if (vrmAnimation && vrm) {
            // Create animation mixer if not exists
            if (!mixerRef.current) {
              mixerRef.current = new THREE.AnimationMixer(vrm.scene)
            }
            
            // Create animation clip from VRMA
            const clip = vrmAnimation.createAnimationClip(vrm)
            
            if (clip) {
              // Stop any existing animation
              if (currentActionRef.current) {
                currentActionRef.current.stop()
              }
              
              // Create and start new animation action
              const action = mixerRef.current.clipAction(clip)
              action.play()
              action.setLoop(THREE.LoopRepeat, Infinity)
              currentActionRef.current = action
              
              console.log('VRMA animation loaded and started successfully')
            } else {
              console.warn('Failed to create animation clip from VRMA')
              startFallbackAnimation(vrm)
            }
          } else {
            console.warn('No VRM Animation found in VRMA file')
            startFallbackAnimation(vrm)
          }
        },
        (progress) => {
          const percentage = (progress.loaded / progress.total) * 100
          if (percentage % 25 < 1) {
            console.log(`VRMA loading progress: ${percentage.toFixed(0)}%`)
          }
        },
        (error) => {
          console.error('Failed to load VRMA animation:', error)
          startFallbackAnimation(vrm)
        }
      )
    } catch (error) {
      console.error('Failed to initialize VRMA loader:', error)
      startFallbackAnimation(vrm)
    }
  }
  
  const startFallbackAnimation = (vrm: VRM) => {
    console.log('Starting fallback animation with natural pose')
    
    // Apply natural pose since VRMA animation failed
    applyNaturalPose(vrm)
    
    // Simple blinking animation as fallback
    const animate = () => {
      if (!vrm || !vrm.expressionManager) return
      
      const time = Date.now() * 0.001
      const blinkTime = time * 2.5
      const blinkValue = Math.sin(blinkTime)
      
      // Blink when sine wave peaks
      if (blinkValue > 0.98) {
        vrm.expressionManager.setValue('blink', 1.0)
      } else if (blinkValue > 0.95) {
        vrm.expressionManager.setValue('blink', 0.5)
      } else {
        vrm.expressionManager.setValue('blink', 0.0)
      }
      
      // Keep neutral expression as base
      vrm.expressionManager.setValue('neutral', 1.0)
    }
    
    // Add to animation loop (will be called in the main animate function)
    const originalUpdate = vrm.update.bind(vrm)
    vrm.update = (delta: number) => {
      originalUpdate(delta)
      animate()
    }
  }

  const loadPlaceholderCharacter = () => {
    try {
      // Fallback placeholder character
      const geometry = new THREE.CapsuleGeometry(0.3, 1.4, 4, 8)
      const material = new THREE.MeshStandardMaterial({ 
        color: 0xffaaaa,
        roughness: 0.7,
        metalness: 0.1
      })
      
      const characterMesh = new THREE.Mesh(geometry, material)
      characterMesh.position.y = 0.7
      characterMesh.castShadow = true
      characterMesh.receiveShadow = true
      characterMesh.userData.isPlaceholder = true
      
      // Add simple face features
      const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
      leftEye.position.set(-0.1, 0.1, 0.25)
      characterMesh.add(leftEye)
      
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
      rightEye.position.set(0.1, 0.1, 0.25)
      characterMesh.add(rightEye)
      
      // Add mouth
      const mouthGeometry = new THREE.SphereGeometry(0.03, 8, 8)
      const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x880000 })
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial)
      mouth.position.set(0, -0.05, 0.25)
      mouth.scale.set(1.5, 0.5, 0.5)
      characterMesh.add(mouth)
      
      if (sceneRef.current) {
        sceneRef.current.add(characterMesh)
        
        // Store reference for animations (mock VRM object)
        vrmRef.current = {
          scene: characterMesh,
          update: (_deltaTime: number) => {
            // Simple idle animation
            characterMesh.rotation.y = Math.sin(Date.now() * 0.001) * 0.1
            characterMesh.position.y = 0.7 + Math.sin(Date.now() * 0.003) * 0.05
          }
        } as any
      }
      
      setLoadingState('ready')
      console.warn('Using placeholder character - VRM file not found')
    } catch (error) {
      console.error('Failed to load placeholder character:', error)
      setLoadingState('error')
    }
  }

  // Handle emotion animations
  useEffect(() => {
    if (!emotionMarkers || !isPlaying || !vrmRef.current) return

    const playEmotionSequence = async () => {
      for (const marker of emotionMarkers) {
        setTimeout(() => {
          playEmotion(marker.emotion, marker.intensity)
        }, marker.timestamp)
      }
    }

    playEmotionSequence()
  }, [emotionMarkers, isPlaying])

  const playEmotion = (emotion: string, intensity: number) => {
    if (!vrmRef.current) return

    const vrm = vrmRef.current as VRM
    
    // If we have a real VRM with expression manager, use VRM expressions
    if (vrm.expressionManager) {
      // Reset all expressions
      vrm.expressionManager.setValue('neutral', 0.0)
      vrm.expressionManager.setValue('happy', 0.0)
      vrm.expressionManager.setValue('sad', 0.0)
      vrm.expressionManager.setValue('surprised', 0.0)
      vrm.expressionManager.setValue('angry', 0.0)
      
      // Apply the target emotion
      switch (emotion) {
        case 'joy':
          vrm.expressionManager.setValue('happy', intensity)
          break
        case 'surprised':
          vrm.expressionManager.setValue('surprised', intensity)
          break
        case 'satisfied':
          vrm.expressionManager.setValue('happy', intensity * 0.7)
          break
        default: // neutral
          vrm.expressionManager.setValue('neutral', 1.0)
      }
      
      // Reset to neutral after duration
      setTimeout(() => {
        if (vrm.expressionManager) {
          vrm.expressionManager.setValue('happy', 0.0)
          vrm.expressionManager.setValue('surprised', 0.0)
          vrm.expressionManager.setValue('neutral', 1.0)
        }
      }, 2000)
    } else {
      // Fallback animation for placeholder character
      const character = vrm.scene as unknown as THREE.Mesh
      if (!character) return
      
      const originalScale = { x: 1, y: 1, z: 1 }

      switch (emotion) {
        case 'joy':
          // Bounce animation for joy
          character.scale.set(1 + intensity * 0.1, 1 + intensity * 0.1, 1)
          setTimeout(() => {
            character.scale.set(originalScale.x, originalScale.y, originalScale.z)
          }, 500)
          break
          
        case 'surprised':
          // Quick scale up for surprise
          character.scale.set(1 + intensity * 0.15, 1 + intensity * 0.15, 1)
          setTimeout(() => {
            character.scale.set(originalScale.x, originalScale.y, originalScale.z)
          }, 300)
          break
          
        case 'satisfied':
          // Gentle sway for satisfaction
          const originalY = character.position.y
          character.position.y = originalY + intensity * 0.1
          setTimeout(() => {
            character.position.y = originalY
          }, 1000)
          break
          
        default: // neutral
          character.scale.set(originalScale.x, originalScale.y, originalScale.z)
      }
    }
  }

  return (
    <div className="vrm-viewer-fullscreen">
      <div 
        ref={mountRef} 
        className={`vrm-canvas-fullscreen ${loadingState}`}
      />
      
      {(loading || loadingState === 'loading') && (
        <div className="vrm-loading-fullscreen">
          <div className="loading-spinner"></div>
          <p>Loading VRM character...</p>
        </div>
      )}
      
      {loadingState === 'error' && (
        <div className="vrm-error-fullscreen">
          <p>⚠️ Failed to load VRM character</p>
          <button onClick={loadVRMCharacter} className="retry-button">
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  )
}
"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/**
 * Componente de fundo 3D com ondas de energia pulsantes verdes
 * Utiliza Three.js e shaders GLSL para criar efeito orgânico e tech-inspired
 * As ondas expandem-se de forma hipnótica sem distrair do conteúdo
 */
export default function FundoEnergia3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Configuração da cena Three.js
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    // Shader personalizado para ondas de energia pulsantes
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // Cria ondulações na geometria
        vec3 pos = position;
        float wave = sin(pos.x * 2.0 + uTime) * cos(pos.y * 2.0 + uTime) * 0.3;
        pos.z += wave;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `

    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      
      void main() {
        // Cria padrão de ondas circulares pulsantes
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        
        // Múltiplas ondas com diferentes velocidades
        float wave1 = sin(dist * 10.0 - uTime * 0.5) * 0.5 + 0.5;
        float wave2 = sin(dist * 15.0 - uTime * 0.7) * 0.5 + 0.5;
        float wave3 = sin(dist * 20.0 - uTime * 0.3) * 0.5 + 0.5;
        
        // Combina as ondas
        float waves = (wave1 + wave2 + wave3) / 3.0;
        
        // Cor verde neon sutil (#00FF88)
        vec3 color = vec3(0.0, waves * 0.3, waves * 0.2);
        
        // Adiciona brilho no centro
        float glow = 1.0 - dist;
        color += vec3(0.0, glow * 0.1, glow * 0.08);
        
        // Transparência baseada na distância
        float alpha = waves * 0.4 * (1.0 - dist * 0.5);
        
        gl_FragColor = vec4(color, alpha);
      }
    `

    // Cria múltiplas camadas de planos com ondas
    const layers: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.PlaneGeometry(20, 20, 64, 64)
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.z = -i * 2
      mesh.rotation.x = Math.PI * 0.1
      scene.add(mesh)
      layers.push(mesh)
    }

    // Adiciona partículas flutuantes
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 100
    const positions = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Animação
    let animationId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Atualiza uniforms dos shaders
      layers.forEach((layer, index) => {
        const material = layer.material as THREE.ShaderMaterial
        material.uniforms.uTime.value = elapsedTime + index * 0.5
        layer.rotation.z = elapsedTime * 0.05 * (index + 1)
      })

      // Anima partículas
      particles.rotation.y = elapsedTime * 0.05
      particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1

      renderer.render(scene, camera)
    }

    animate()

    // Responsividade
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      layers.forEach((layer) => {
        layer.geometry.dispose()
        ;(layer.material as THREE.Material).dispose()
      })
      particles.geometry.dispose()
      ;(particles.material as THREE.Material).dispose()
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{
        background: "linear-gradient(180deg, #0A0A0A 0%, #000000 100%)",
      }}
      aria-hidden="true"
    />
  )
}

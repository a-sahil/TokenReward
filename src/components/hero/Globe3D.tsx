
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Globe3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    
    // Globe geometry
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Globe material
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a2540,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    
    // Create the globe mesh
    const globe = new THREE.Mesh(sphereGeometry, globeMaterial);
    scene.add(globe);
    
    // Outer glow sphere
    const glowGeometry = new THREE.SphereGeometry(2.1, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x8f00ff,
      transparent: true,
      opacity: 0.15,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    
    // Points/stars on the globe
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 300;
    const positions = new Float32Array(pointsCount * 3);
    
    for (let i = 0; i < pointsCount; i++) {
      // Calculate random positions on a sphere surface
      const phi = Math.acos(-1 + (2 * i) / pointsCount);
      const theta = Math.sqrt(pointsCount * Math.PI) * phi;
      
      const x = 2 * Math.cos(theta) * Math.sin(phi);
      const y = 2 * Math.sin(theta) * Math.sin(phi);
      const z = 2 * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x00ffe5,
      size: 0.05,
      sizeAttenuation: true,
    });
    
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);
    
    // Position the camera
    camera.position.z = 5;
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      globe.rotation.y += 0.002;
      glow.rotation.y += 0.001;
      points.rotation.y += 0.002;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div ref={containerRef} className="w-full h-full" />;
};

export default Globe3D;

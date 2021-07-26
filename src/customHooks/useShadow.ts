import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { SCENE_CONSTANTS } from '../constants'
import * as THREE from 'three'

export function useShadow() {
  const { gl } = useThree()
  useEffect(() => {
    const originalShadowMapType = gl.shadowMap.type
    gl.shadowMap.type = THREE.PCFShadowMap
    gl.shadowMap.enabled = true
    return () => {
      gl.shadowMap.type = originalShadowMapType
      gl.shadowMap.enabled = SCENE_CONSTANTS.shadows
    }
  }, [gl])
}

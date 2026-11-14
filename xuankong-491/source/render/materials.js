// Custom PBR Voxel Shader Material Injection (`onBeforeCompile`)
// Turns greedy-meshed quads into museum-grade tactile miniature blocks:
// 1. Subtle 1-voxel grid seam & micro-bevel normal perturbation using `uv` (which stores local voxel coords [0..w, 0..h]!)
// 2. Per-vertex roughness, metalness, emissive, and baked AO (`aMatProps`)
// 3. Dynamic time-of-day lantern/window glow multiplier (`uGlowIntensity`)
// 4. X-Ray Mechanics stress-flow pulse along cantilevered hemlock beams (`uMechanicsPulse`)!

import * as THREE from 'three';

export function createVoxelGroupMaterial({
  isGhostableCliff = false,
  isArchitectureGroup = false,
  isMechanicsGroup = false,
  isLanternGroup = false,
  sharedUniforms,
}) {
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.05,
    transparent: isGhostableCliff,
    opacity: 1.0,
    side: THREE.FrontSide,
  });

  mat.customProgramCacheKey = () =>
    `xuankong_voxel_${isGhostableCliff ? 'cliff' : isArchitectureGroup ? 'arch' : isMechanicsGroup ? 'mech' : isLanternGroup ? 'lant' : 'std'}`;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = sharedUniforms.uTime;
    shader.uniforms.uGlowIntensity = sharedUniforms.uGlowIntensity;
    shader.uniforms.uXRayMix = sharedUniforms.uXRayMix;
    shader.uniforms.uBellPulse = sharedUniforms.uBellPulse;
    shader.uniforms.uSnowAmount = sharedUniforms.uSnowAmount;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec4 aMatProps;
        varying vec4 vMatProps;
        varying vec2 vVoxelUv;
        varying vec3 vWorldPos;
        varying vec3 vWorldNorm;`
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vMatProps = aMatProps;
        vVoxelUv = uv;
        vec4 wp = modelMatrix * vec4(transformed, 1.0);
        vWorldPos = wp.xyz;
        vWorldNorm = normalize(mat3(modelMatrix) * objectNormal);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uGlowIntensity;
        uniform float uXRayMix;
        uniform float uBellPulse;
        uniform float uSnowAmount;
        varying vec4 vMatProps;
        varying vec2 vVoxelUv;
        varying vec3 vWorldPos;
        varying vec3 vWorldNorm;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        // Crisp yet subtle 1-voxel tactile seam darkening so greedy-meshed walls still read as crafted miniature voxels!
        vec2 gridF = abs(fract(vVoxelUv - 0.5) - 0.5);
        vec2 dGrid = fwidth(vVoxelUv);
        vec2 seam2 = smoothstep(vec2(0.0), max(dGrid * 1.35, vec2(0.035)), gridF);
        float voxelSeam = mix(0.89, 1.0, min(seam2.x, seam2.y));
        diffuseColor.rgb *= voxelSeam;

        // Subtle winter frost/snow dusting on upward-facing outdoor surfaces during Winter Night mode!
        if (uSnowAmount > 0.01 && vWorldNorm.y > 0.65 && vMatProps.z < 0.05) {
          // Sheltered under the overhanging cliff canopy (y < 43m and x < 3.6m) gets less snow — realistic Hengshan physics!
          float exposed = smoothstep(2.6, 4.6, vWorldPos.x) + smoothstep(42.0, 49.0, vWorldPos.y);
          float snowMask = clamp(exposed, 0.0, 1.0) * uSnowAmount * 0.78;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.90, 0.96) * vMatProps.w, snowMask);
        }

        ${isGhostableCliff ? `
        // In X-Ray Mechanics mode, slice open a razor-sharp architectural cutaway section window
        // bordered by a glowing amber section-cut contour line, exposing 100% unobstructed embedded hemlock beams & oak wedges inside their stone sockets!
        if (uXRayMix > 0.01) {
          float dy = (vWorldPos.y - 28.5) / (15.0 * uXRayMix);
          float dz = (vWorldPos.z - 4.5) / (18.5 * uXRayMix);
          float r2 = dy * dy + dz * dz;
          if (r2 < 1.0 && vWorldPos.x > -6.5) {
            if (r2 > 0.92) {
              diffuseColor.rgb = vec3(0.38, 0.78, 1.0);
              diffuseColor.a = 0.95;
            } else {
              discard;
            }
          }
        }
        ` : ''}
        ${isArchitectureGroup ? `
        // Also carve a surgical architectural section slice on the Sky-Walkway & lower North Pavilion walls during X-Ray mode
        // so the full 2/3 embedded + 1/3 cantilevered hemlock beam balance is seen end-to-end without wall occlusion!
        if (uXRayMix > 0.35) {
          float dy = (vWorldPos.y - 28.5) / (8.2 * uXRayMix);
          float dz = (vWorldPos.z - 5.5) / (7.2 * uXRayMix);
          if (dy * dy + dz * dz < 1.0 && vWorldPos.x < 2.6) {
            discard;
          }
        }
        ` : ''}
        ${isMechanicsGroup ? `
        // During X-Ray mode, also peel back the flat floor planks (vMatProps.x > 0.78) inside the central surgical inspection window
        // so the full length of each embedded Hemlock beam & its golden Oak expansion wedge is 100% uncovered from above!
        if (uXRayMix > 0.35 && vMatProps.x > 0.78) {
          float dy = (vWorldPos.y - 28.5) / (7.5 * uXRayMix);
          float dz = (vWorldPos.z - 5.5) / (6.8 * uXRayMix);
          if (dy * dy + dz * dz < 1.0 && vWorldPos.x < 2.3) {
            discard;
          }
        }
        ` : ''}
        `
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `float roughnessFactor = clamp(vMatProps.x, 0.08, 1.0);`
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `float metalnessFactor = clamp(vMatProps.y, 0.0, 1.0);`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        // Warm oil lamps, paper windows, and incense glow dynamically with dusk/night!
        float emitStrength = vMatProps.z;
        if (emitStrength > 0.01) {
          float dynGlow = ${isLanternGroup ? 'uGlowIntensity' : 'mix(0.35, 1.25, uGlowIntensity)'};
          // Subtle living candle flicker on lanterns
          float flicker = 0.94 + 0.06 * sin(uTime * 5.2 + vWorldPos.z * 3.7 + vWorldPos.y * 2.1);
          totalEmissiveRadiance += diffuseColor.rgb * emitStrength * dynGlow * flicker * 2.2;
        }
        ${isMechanicsGroup ? `
        // In X-Ray Mechanics mode, highlight ONLY the deeply embedded hemlock beams & oak wedges cleanly without blowing out wooden floor planks!
        if (uXRayMix > 0.01) {
          // vMatProps.x is roughness: OAK_WEDGE_GOLD=0.58, HEMLOCK_BEAM_MAIN=0.68, SUPPORT_POST=0.72, PLANK_DECK_WOOD=0.80
          float isWedge = 1.0 - smoothstep(0.57, 0.62, vMatProps.x);
          float isBeam = (1.0 - smoothstep(0.73, 0.78, vMatProps.x)) * (1.0 - isWedge);
          float wave = 0.5 + 0.5 * sin(vWorldPos.x * 4.2 + uTime * 3.8);
          vec3 beamGlow = mix(vec3(0.45, 0.22, 0.05), vec3(0.85, 0.48, 0.12), wave) * isBeam * 0.48;
          vec3 wedgeGlow = vec3(1.0, 0.72, 0.18) * isWedge * (0.65 + 0.35 * wave);
          totalEmissiveRadiance += (beamGlow + wedgeGlow) * uXRayMix;
        }
        ` : ''}
        // Acoustic golden shimmer ripple expanding from Bell Tower when user strikes the ancient bronze bell!
        if (uBellPulse > 0.005) {
          vec3 bellCenter = vec3(3.25, 25.0, -12.5);
          float distBell = length(vWorldPos - bellCenter);
          float ringRadius = (1.0 - uBellPulse) * 42.0;
          float ringBand = exp(-pow((distBell - ringRadius) * 0.65, 2.0));
          totalEmissiveRadiance += vec3(1.0, 0.76, 0.28) * ringBand * uBellPulse * 1.35;
        }
        `
      );
  };

  return mat;
}

/**
 * Builds a Three.js BufferGeometry from a greedy-meshed group descriptor.
 */
export function buildGroupGeometry(desc) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(desc.positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(desc.normals, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(desc.colors, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(desc.uvs, 2));
  geo.setAttribute('aMatProps', new THREE.BufferAttribute(desc.matProps, 4));
  geo.setIndex(new THREE.BufferAttribute(desc.indices, 1));
  geo.computeBoundingSphere();
  return geo;
}

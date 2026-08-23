import type * as THREE_NS from 'three';

/**
 * Désintégration progressive d'un modèle.
 *
 * On ne peut pas déformer une voiture en bateau : maillages différents,
 * topologies différentes, aucune correspondance de sommets. La transition
 * passe donc par une dissolution — la voiture se désagrège pendant que le
 * bateau se matérialise, avec un front lumineux à la frontière.
 *
 * Le bruit est calculé dans le fragment shader à partir de la position
 * locale : aucun coût CPU, et le motif reste stable quand l'objet tourne.
 */
export type Dissolvable = { seuil: { value: number }; sens: { value: number } };

const BRUIT_GLSL = /* glsl */ `
  float aleatoire(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  float bruit(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = aleatoire(i + vec3(0.0, 0.0, 0.0));
    float n100 = aleatoire(i + vec3(1.0, 0.0, 0.0));
    float n010 = aleatoire(i + vec3(0.0, 1.0, 0.0));
    float n110 = aleatoire(i + vec3(1.0, 1.0, 0.0));
    float n001 = aleatoire(i + vec3(0.0, 0.0, 1.0));
    float n101 = aleatoire(i + vec3(1.0, 0.0, 1.0));
    float n011 = aleatoire(i + vec3(0.0, 1.0, 1.0));
    float n111 = aleatoire(i + vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
      mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
      f.z
    );
  }
`;

/**
 * Branche la dissolution sur tous les matériaux d'un objet.
 * seuil 0 → intact · seuil 1 → entièrement dissous.
 * sens +1 → l'objet disparaît · sens −1 → l'objet apparaît.
 */
export function rendreDissolvable(
  THREE: typeof THREE_NS,
  racine: THREE_NS.Object3D,
  sensInitial: number
): Dissolvable {
  const seuil = { value: 0 };
  const sens = { value: sensInitial };

  /**
   * ⚠️ Piège payé : Box3.setFromObject donne des coordonnées MONDE
   * (transformations appliquées), alors que l'attribut `position` d'un
   * mesh est en coordonnées LOCALES du modèle brut. Mélanger les deux
   * donne un balayage incohérent — et selon l'échelle d'origine du
   * modèle, un objet qui ne se matérialise jamais. Le shader travaille
   * donc lui aussi en espace monde.
   */
  const boite = new THREE.Box3().setFromObject(racine);
  // Le balayage suit le grand axe HORIZONTAL du modèle : la Volvo est
  // orientée sur Z, balayer X aurait traversé sa largeur.
  const surZ = boite.max.z - boite.min.z > boite.max.x - boite.min.x;
  const axe = { value: surZ ? 1 : 0 };
  const minAxe = { value: surZ ? boite.min.z : boite.min.x };
  const etendue = { value: Math.max(0.001, surZ ? boite.max.z - boite.min.z : boite.max.x - boite.min.x) };

  racine.traverse((noeud) => {
    const mesh = noeud as THREE_NS.Mesh;
    if (!mesh.isMesh) return;
    const materiaux = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of materiaux) {
      const mat = m as THREE_NS.MeshStandardMaterial;
      mat.transparent = false;
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uSeuil = seuil;
        shader.uniforms.uSens = sens;
        shader.uniforms.uAxe = axe;
        shader.uniforms.uMinAxe = minAxe;
        shader.uniforms.uEtendue = etendue;

        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vPosMonde;')
          /**
           * ⚠️ Injection APRÈS le skinning. Le yacht est skinné : posée
           * après <begin_vertex>, la position monde ignorait les os, le
           * seuil se calculait sur des coordonnées fausses et la coque
           * était presque entièrement rejetée. <skinning_vertex> est
           * toujours présent dans la source, skinné ou non.
           */
          .replace(
            '#include <skinning_vertex>',
            '#include <skinning_vertex>\nvPosMonde = (modelMatrix * vec4(transformed, 1.0)).xyz;'
          );

        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec3 vPosMonde;
             uniform float uSeuil;
             uniform float uSens;
             uniform float uAxe;
             uniform float uMinAxe;
             uniform float uEtendue;
             ${BRUIT_GLSL}`
          )
          .replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             // Balayage longitudinal + grain : la dissolution part de
             // l'avant et progresse, elle ne clignote pas partout.
             float coord = uAxe > 0.5 ? vPosMonde.z : vPosMonde.x;
             float avance = clamp((coord - uMinAxe) / uEtendue, 0.0, 1.0);
             float grain = bruit(vPosMonde * 4.0);
             float carte = mix(avance, grain, 0.55);
             float s = uSens > 0.0 ? uSeuil : 1.0 - uSeuil;
             if (carte < s) discard;
             // Front incandescent, comme un métal qu'on découpe.
             float bord = smoothstep(s + 0.075, s, carte);
             gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.32, 0.12) * 2.6, bord * 0.9);`
          );
      };
      mat.needsUpdate = true;
    }
  });

  return { seuil, sens };
}

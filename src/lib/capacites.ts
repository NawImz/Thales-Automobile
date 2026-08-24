/**
 * Décide si une scène 3D vaut le coup, en un seul endroit.
 *
 * Cette condition vivait recopiée dans trois fichiers ; elle a dérivé et
 * le seuil `min-width: 64rem` coupait la 3D sur toute fenêtre de bureau
 * un peu étroite — un navigateur en demi-écran, un panneau d'aperçu.
 * Vécu : « ya aucun modèle 3D sur le site ».
 *
 * Le vrai critère n'est pas la largeur de la fenêtre mais la nature de
 * l'appareil. `pointer: fine` écarte téléphones et tablettes — c'est là
 * que le budget de 600 Ko compte — sans punir un bureau redimensionné.
 */
export function sceneAutorisee(): boolean {
  if (typeof matchMedia !== 'function') return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  // Pointeur grossier : téléphone ou tablette, on garde le repli au trait.
  if (!matchMedia('(pointer: fine)').matches) return false;

  // Sous 40rem la scène n'a plus de place utile, même sur un bureau.
  if (!matchMedia('(min-width: 40rem)').matches) return false;

  // Machine faible annoncée : on ne lui impose pas three.js.
  const memoire = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memoire === 'number' && memoire < 4) return false;

  return webglDisponible();
}

export function webglDisponible(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

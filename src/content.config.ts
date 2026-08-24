// ⚠️ Emplacement vérifié dans astro/dist/content/utils.js : la config des
// collections va bien dans `src/content.config.ts`. `src/content/config.ts`
// est l'emplacement HÉRITÉ — celui qu'utilisait la version précédente.
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const services = defineCollection({
  loader: file('src/content/services/services.json'),
  schema: z.object({
    // ⚠️ `getCollection` trie par IDENTIFIANT, pas par ordre du fichier : sans
    // ce champ la vidange — la porte d'entrée — se retrouvait en dernier.
    // Obligatoire, pour qu'un oubli casse le build et non l'affichage.
    ordre: z.number(),
    titre: z.string(),
    phrase: z.string(),
    prixDepart: z.number(),
    duree: z.string(),
    trait: z.string(),
  }),
});

const avis = defineCollection({
  loader: file('src/content/avis/avis.json', {
    parser: (texte) => JSON.parse(texte).avis,
  }),
  schema: z.object({
    auteur: z.string(),
    profil: z.string(),
    note: z.number().nullable(),
    date: z.string(),
    ancienneteDite: z.string().nullable().optional(),
    extrait: z.string(),
    theme: z.string().optional(),
  }),
});

export const collections = { services, avis };

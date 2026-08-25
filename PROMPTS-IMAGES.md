# Prompts pour générer les images manquantes

Deux emplacements sont encore vides sur le site. Voici de quoi les remplir.

**À lire avant** : ces images seront vues par de vrais clients qui décideront
d'appeler ou non. Une photo réelle de l'atelier vaudra toujours mieux qu'une
image générée — elle montre *votre* hangar, *vos* machines, *votre* désordre.
Les prompts ci-dessous sont un dépannage, pas un aboutissement.

---

## Réglages communs, à mettre dans chaque prompt

Le site est très blanc, au trait, avec un seul accent turquoise. Une image
saturée ou sur-éclairée cassera l'ensemble. Ajoutez donc systématiquement :

```
Photographie documentaire, lumière naturelle d'atelier, pas de flash.
Couleurs désaturées, tons neutres et froids. Grain léger, aspect
reportage plutôt que publicité. Aucun texte, aucun logo, aucune marque
visible. Pas de watermark.
```

Et en négatif, si votre outil le permet :

```
Négatif : rendu 3D, aspect CGI, HDR, sur-saturation, éclairage de studio,
sourires forcés, stock photo, texte, logos de marques, mains déformées,
outils irréalistes.
```

---

## 1. Le hors-bord démonté — `4 / 3`

Utilisé deux fois : bloc « Ce qui roule, ce qui flotte » sur l'accueil, et en
haut de la page bateaux. **C'est l'image la plus importante des deux** : c'est
elle qui prouve le pôle nautique, qui est votre vrai différenciateur.

```
Un moteur hors-bord de bateau partiellement démonté, posé sur un support
d'atelier, dans un garage de mécanique automobile. Le capot du moteur est
retiré et posé à côté, on voit le bloc, les durites et les câbles. Autour,
un établi avec des outils, un enrouleur d'air comprimé, un sol en béton
taché d'huile. Au second plan, flou, une voiture sur un pont élévateur.
Lumière du jour venant d'une porte de hangar ouverte, sur la gauche.
Cadrage large horizontal, à hauteur d'homme, format 4:3.
```

**Pourquoi ce cadrage** : le moteur *et* la voiture dans la même image, c'est
exactement l'argument « auto et nautique dans le même atelier ». Si l'outil ne
gère pas bien le second plan, faites deux essais et gardez celui où l'on
devine la voiture.

**Variante jet-ski**, si vous préférez :

```
Un jet-ski sur sa remorque dans un atelier de mécanique, capot moteur
ouvert, un tapis de protection posé sur la coque. Établi et outils en
arrière-plan, sol béton, lumière naturelle latérale. Format 4:3.
```

---

## 2. Le mécanicien au travail — *emplacement retiré*

⚠️ **Cet emplacement n'existe plus sur le site** : le cadre a été supprimé à
votre demande. Le prompt reste ici si vous voulez le réintroduire un jour — il
faudra alors me le dire, je remets le bloc.

### Si vous le réintroduisez — `3 / 2`

⚠️ **Un avertissement, et il compte.**

Cet emplacement s'appelle aujourd'hui « Nabil au travail ». Générer un visage
et le présenter comme celui du gérant, c'est présenter un inconnu synthétique
comme une personne réelle à des clients qui viendront le rencontrer. Ça se
retourne mal : quelqu'un pousse la porte, ce n'est pas la même personne.

**Deux options honnêtes** :

**a) Ne montrer aucun visage** — c'est ce que je recommande, et le prompt est
écrit pour ça :

```
Gros plan sur les mains d'un mécanicien serrant un raccord sur un bloc
moteur, clé plate en main. Mains marquées de cambouis, manches de
combinaison de travail bleue remontées. Le visage n'est pas dans le cadre.
Arrière-plan d'atelier flou. Lumière naturelle latérale, tons neutres.
Cadrage horizontal, format 3:2.
```

**b) Une vraie photo de Nabil.** Un téléphone récent suffit largement : de
trois-quarts, en train de travailler, lumière de la porte du hangar dans le
dos du photographe. C'est cinq minutes, et ça vaudra toujours mieux.

Si vous choisissez (a), je renomme l'emplacement — il ne s'appellera plus
« Nabil au travail » mais « Les mains à l'ouvrage », pour que le site ne
prétende rien.

---

## 3. Si vous voulez aller plus loin

Deux images supplémentaires amélioreraient nettement le site, sans être
indispensables :

**Le mur de pièces** — donnerait du corps à la page services :

```
Un mur de rangement d'atelier automobile : étagères métalliques, bacs de
pièces détachées, filtres et courroies alignés, plaquettes de frein dans
leurs boîtes. Vue frontale, lumière d'atelier neutre, aucune marque
lisible. Format 3:2.
```

**Une texture d'atelier** — pour les images de partage sur les réseaux :

```
Texture rapprochée d'un établi d'atelier : métal usé, traces d'huile,
copeaux, une clé posée. Vue du dessus, lumière rasante, très désaturé.
Format 1200x630.
```

---

## Ce que je fais des fichiers

Déposez-les dans `public/brand/` par la même voie que le logo (dépôt GitHub,
glisser-déposer dans le dossier). Je m'occupe du reste : recadrage aux
proportions exactes, conversion AVIF + WebP, dimensions explicites pour que la
page ne saute pas au chargement, et texte alternatif.

**Nommez-les simplement** : `hors-bord.jpg`, `mains-moteur.jpg`, etc. Je
vérifie chaque image avant de l'intégrer — jamais d'après son nom de fichier.

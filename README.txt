DS DIGITAL STUDIO — VERSION 3 (SITE 3D, GITHUB PAGES)
====================================================

Site 100 % statique, publié par GitHub Pages depuis la branche main.
Aucune étape de compilation n'est nécessaire pour mettre le site en ligne :
le fichier 3D compilé (assets/js/scene.min.js) est déjà dans le dépôt.


1. CE QUI A CHANGÉ PAR RAPPORT À LA VERSION 2
-------------------------------------------------
- Hero en 3D temps réel (Three.js) : le monogramme « DS. » du logo,
  extrudé en relief, avec la sphère dorée et un anneau or. Il suit la
  souris et réagit au défilement. Sur mobile il se place au-dessus du titre.
- Direction artistique sombre et or, alignée sur le logo.
- Nouvelle section « Services » (6 métiers) : chaque bouton « Devis »
  pré-sélectionne le bon service dans le formulaire.
- Section « Réalisations » ajoutée (elle manquait alors que le menu y
  renvoyait) : tytoo.ch, fit2010.ch, delta-view.ch, dymatec.ch, avec
  cartes qui s'inclinent en 3D au survol.
- Packs : listes raccourcies + « Tout ce qui est inclus » dépliable.
  Sur mobile, défilement horizontal qui s'ouvre sur le Pack Pro.
- Bouton « Demander un devis » flottant sur mobile.
- SEO : image de partage 1200x630 (assets/og-image.jpg), données
  structurées regroupées (entreprise + site + page + FAQ), langue fr-CH,
  région géographique, sitemap daté.
- Performance : la 3D se charge après le contenu, ne tourne que lorsque
  le hero est visible, et s'arrête si l'onglet est caché.
- Accessibilité : contenu lisible sans la 3D, prefers-reduced-motion
  respecté (image fixe), focus visible, lien d'évitement.
- Plus aucune photo Pexels : le site ne charge que tes propres images.


2. MODIFIER LA SCÈNE 3D (optionnel)
-------------------------------------------------
Les sources sont dans src/ (scene.js, entry.js, ds-glyphs.json).
Après une modification :
     npm install
     npm run build
Cela régénère assets/js/scene.min.js. Pense à l'envoyer sur GitHub.
src/extract-glyphs.cjs a servi à extraire le tracé des lettres
« DS » depuis la police Montserrat (déjà fait, rien à relancer).


3. LE FORMULAIRE
-------------------------------------------------
Relié à Formspree : https://formspree.io/f/xzebjypp
Pour changer : formspreeEndpoint dans site-config.js ET l'attribut
action du formulaire dans index.html.


4. AJOUTER UNE RÉALISATION
-------------------------------------------------
Dans index.html, section « 02 RÉALISATIONS », copie un bloc
<article class="project"> ... </article> et remplace :
  - l'adresse encodée dans src (%3A%2F%2F remplace "://")
  - data-domain, le href, et le <small> de la barre du navigateur
  - le titre <h3>, la phrase, l'étiquette <span class="pill">, le alt.
Ajoute aussi le client dans le bandeau « Ils nous ont fait confiance ».

Les aperçus viennent du service mShots de WordPress.com. La toute
première demande peut prendre quelques secondes ; recharge une fois.


5. PRIX DES PACKS
-------------------------------------------------
Section « 03 PACKS ». Si tu changes un prix, change-le aussi dans les
données structurées en haut de index.html (minPrice) et dans <title>.


6. COORDONNÉES
-------------------------------------------------
site-config.js : contactEmail, phone, instagram, facebook, linkedin.
Un téléphone ou un réseau renseigné apparaît automatiquement.


7. À VÉRIFIER APRÈS PUBLICATION
-------------------------------------------------
[ ] Le formulaire arrive bien dans info@ds-digital.ch
[ ] La 3D s'affiche sur ton téléphone et ton ordinateur
[ ] Les aperçus des réalisations s'affichent (recharger si première visite)
[ ] Soumettre le sitemap dans Google Search Console
[ ] Tester les données structurées : https://search.google.com/test/rich-results
[ ] Tester l'image de partage : https://www.opengraph.xyz/

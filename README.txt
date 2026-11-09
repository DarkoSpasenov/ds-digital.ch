DS DIGITAL STUDIO — VERSION 3 (SITE 3D, GITHUB PAGES)
====================================================

Site 100 % statique, publié par GitHub Pages depuis la branche main.
Aucune étape de compilation n'est nécessaire pour mettre le site en ligne :
le fichier 3D compilé (assets/js/scene.min.js) est déjà dans le dépôt.


1. CE QUI A CHANGÉ PAR RAPPORT À LA VERSION 2
-------------------------------------------------
- Hero en 3D temps réel (Three.js), dans l'espace : tes réalisations
  sortent de la Terre et tournent en orbite au-dessus d'elle, parmi les
  étoiles. Survol = nom du site, clic = ouverture du site, glisser à la
  souris = faire tourner l'orbite. Le défilement éloigne la caméra.
  Sur mobile, l'orbite se place au-dessus du titre.
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
Les sources sont dans src/ (scene.js, entry.js).
Après une modification :
     npm install
     npm run build
Cela régénère assets/js/scene.min.js. Pense à l'envoyer sur GitHub.
Les sites affichés en orbite sont lus dans la section « Réalisations »
de index.html : chaque <article class="project"> porte data-domain et
data-img (capture 1280x800 dans assets/work/). Ajouter un projet dans
cette section l'ajoute aussi automatiquement à l'orbite 3D.


3. LE FORMULAIRE
-------------------------------------------------
Relié à Formspree : https://formspree.io/f/xzebjypp
Pour changer : formspreeEndpoint dans site-config.js ET l'attribut
action du formulaire dans index.html.


4. AJOUTER UNE RÉALISATION
-------------------------------------------------
Dans index.html, section « 02 RÉALISATIONS », copie un bloc
<article class="project"> ... </article> et remplace :
  - data-domain et data-img (capture 1280x800 en .webp dans assets/work/,
    plus une version 640x400 nommée -640.webp)
  - le src / srcset de l'image, le href, et le <small> de la barre
  - le titre <h3>, la phrase, l'étiquette <span class="pill">, le alt.
Ajoute aussi le client dans le bandeau « Ils nous ont fait confiance ».

Les captures de fit2010, delta-view et dymatec sont hébergées dans
assets/work/. Pour tytoo.ch (pas de dépôt trouvé), la carte 3D reprend
son titre et l'aperçu de la section vient du service mShots de
WordPress.com : remplace-les par une vraie capture quand tu l'as.


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

DS DIGITAL STUDIO — VERSION 3 (GITHUB PAGES)
============================================

Site 100 % statique, publié par GitHub Pages depuis la branche main.
Aucune étape de compilation : HTML, CSS et JavaScript simples.


1. CE QUI A CHANGÉ PAR RAPPORT À LA VERSION 2
-------------------------------------------------
- Nouveau logo simple : « DS. » blanc sur carré encre, point bleu.
    assets/logo-ds.svg       logo principal (vectoriel)
    assets/logo-ds-mark.svg  « DS. » seul, sans carré
    assets/logo-ds.png/.webp, assets/favicon.png : versions image
- Trois couleurs seulement : encre #0E1116, blanc #FFFFFF, bleu #2B59FF.
  Les gris sont des nuances de l'encre. Une seule police : Inter.
- Hero : tes réalisations empilées en 3D (CSS, sans librairie lourde),
  qui suivent légèrement la souris et s'avancent au survol.
- Nouvelle section « Services » : chaque bouton « Devis » pré-sélectionne
  le bon service dans le formulaire.
- Section « Réalisations » ajoutée (elle manquait alors que le menu y
  renvoyait) : tytoo.ch, fit2010.ch, delta-view.ch, dymatec.ch.
- Packs : listes raccourcies + « Tout ce qui est inclus » dépliable.
  Sur mobile, défilement horizontal qui s'ouvre sur le Pack Pro.
- Bouton « Demander un devis » flottant sur mobile.
- SEO : image de partage 1200x630 (assets/og-image.jpg), données
  structurées regroupées (entreprise + site + page + FAQ), fr-CH,
  région géographique, sitemap daté.
- Plus aucune photo Pexels ni dépendance JavaScript externe.


2. COULEURS
-------------------------------------------------
Tout est en haut de style.css (--ink, --white, --accent).
Changer --accent suffit pour changer la couleur d'accent partout
(pense aussi au point du logo dans les deux fichiers .svg).


3. LE FORMULAIRE
-------------------------------------------------
Relié à Formspree : https://formspree.io/f/xzebjypp
Pour changer : formspreeEndpoint dans site-config.js ET l'attribut
action du formulaire dans index.html.


4. AJOUTER UNE RÉALISATION
-------------------------------------------------
Dans index.html, section « 02 RÉALISATIONS », copie un bloc
<article class="project"> ... </article> et remplace :
  - la capture : 1280x800 en .webp dans assets/work/, plus une version
    640x400 nommée -640.webp (src / srcset de l'image)
  - data-domain, le href, et le <small> de la barre du navigateur
  - le titre <h3>, la phrase, l'étiquette <span class="pill">, le alt.
Ajoute aussi le client dans le bandeau « Ils nous ont fait confiance ».

Les captures de fit2010, delta-view et dymatec sont dans assets/work/.
L'aperçu de tytoo.ch vient du service mShots de WordPress.com :
remplace-le par une vraie capture quand tu l'as. Les 3 cartes du hero
sont dans la section HERO (bloc <div class="stack">).


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
[ ] Les aperçus des réalisations s'affichent (recharger si première visite)
[ ] Soumettre le sitemap dans Google Search Console
[ ] Tester les données structurées : https://search.google.com/test/rich-results
[ ] Tester l'image de partage : https://www.opengraph.xyz/

RELIEF — STUDIO WEB (site statique, GitHub Pages)
==================================================

Nouveau site 3D, refait de zéro. Aucun PHP, aucune base de données.

FICHIERS
--------
index.html              Page d'accueil (hero 3D, showroom, studio, méthode, contact)
mentions-legales.html   Mentions légales
confidentialite.html    Confidentialité
404.html                Page introuvable
site-config.js          E-mail, réseaux, formulaire Formspree (le seul fichier à toucher pour les coordonnées)
assets/relief.css       Tout le style (couleurs dans :root en haut du fichier)
assets/relief-ui.js     Menu, carrousel 3D des réalisations, cartes inclinables, formulaire
assets/relief-3d.min.js Scène 3D du hero (three.js), version compilée
src/relief-3d.js        Source lisible de la scène 3D
assets/work/            Captures des sites réalisés (1280×800, .webp)
assets/fonts/           Polices Bricolage Grotesque + Inter, hébergées sur le site

AJOUTER UNE RÉALISATION
-----------------------
1. Mettre la capture dans assets/work/nom.webp (1280×800).
2. Dans index.html, section SHOWROOM, copier un bloc <article class="slide"> et changer
   data-name, data-tag, data-desc, data-url, le lien et l'image.
   (tytoo.ch attend encore sa capture : remplacer le bloc .shot-placeholder par une <img>.)
3. Pour l'afficher aussi dans la scène 3D du hero : ajouter une ligne dans SITES
   au début de src/relief-3d.js, puis recompiler (voir ci-dessous).

RECOMPILER LA SCÈNE 3D (seulement si src/relief-3d.js change)
------------------------------------------------------------
  npm i three@0.169.0 esbuild
  npx esbuild src/relief-3d.js --bundle --minify --format=esm --target=es2020 \
      --legal-comments=eof --outfile=assets/relief-3d.min.js

PHOTO DE BROIS
----------------------
Mettre assets/brois-portrait.webp (600×750) et remplacer le bloc .member-mono
dans la section STUDIO par une <img>, comme pour Darko.

MISE EN LIGNE
-------------
GitHub Pages publie la branche main (fichier CNAME = ds-digital.ch).

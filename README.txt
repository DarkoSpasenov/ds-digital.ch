DS DIGITAL STUDIO — VERSION 2 (GITHUB PAGES)
=============================================

100 % statique. Aucun PHP, aucune base de données.


-------------------------------------------------
1. CE QUI A CHANGÉ PAR RAPPORT À LA VERSION 1
-------------------------------------------------
- E-mail info@ds-digital.ch relié partout (formulaire, contact, footer, 404).
- Aperçus RÉELS des sites réalisés (captures générées automatiquement).
- Photos professionnelles (banque libre de droits Pexels).
- Polices réellement chargées (Inter + Instrument Serif). Avant, "Inter"
  était déclarée dans le CSS mais jamais téléchargée : le site s'affichait
  avec la police système.
- Section "Packs sites web" : carrousel de 3 cartes tarifaires
  (Essentiel / Pro / Premium). Le Pack Pro s'affiche au centre au
  chargement, les deux autres dépassent sur les côtés en plus clair.
  Flèches, points, clavier et balayage du doigt. Tous les boutons
  pointent vers la section Contact.
- Nouvelle section FAQ et bandeau d'appel à l'action.
- Menu mobile plein écran, barre de progression de lecture, bouton retour en haut.
- SEO : Open Graph, Twitter Card, données structurées entreprise + FAQ,
  balises alt descriptives, sitemap daté.
- Accessibilité : lien d'évitement, focus visible, aria, prefers-reduced-motion.
- Anti-spam : champ piège invisible dans le formulaire.


-------------------------------------------------
2. MISE EN LIGNE
-------------------------------------------------
1. Ouvre ton dépôt GitHub.
2. Envoie LE CONTENU de ce dossier à la racine du dépôt
   (index.html doit être visible directement à la racine).
3. Settings > Pages > Source : Deploy from a branch.
4. Branch : main   /   Folder : / (root)   >   Save.
5. Custom domain : ds-digital.ch
6. Active "Enforce HTTPS" dès que GitHub le propose.


-------------------------------------------------
3. LE FORMULAIRE
-------------------------------------------------
Par défaut, il ouvre le logiciel e-mail du visiteur avec un message
pré-rempli vers info@ds-digital.ch.

POUR RECEVOIR LES DEMANDES DIRECTEMENT (recommandé, gratuit) :
1. Va sur https://web3forms.com
2. Entre info@ds-digital.ch, tu reçois une clé par e-mail.
3. Ouvre site-config.js et colle la clé :
       web3formsKey: 'ta-cle-ici'
4. Enregistre et republie. C'est tout.

Sans cette clé, un visiteur sur mobile sans application e-mail configurée
peut ne pas réussir à envoyer sa demande. C'est la première chose à faire.


-------------------------------------------------
4. AJOUTER UNE RÉALISATION
-------------------------------------------------
Ouvre index.html, section "RÉALISATIONS".
Un bloc modèle est encadré par les commentaires :
       ▼▼ MODÈLE DE PROJET ▼▼   ...   ▲▲ FIN DU MODÈLE ▲▲

Copie une carte <article class="project"> ... </article> et remplace :

  a) L'ADRESSE DANS L'APERÇU (deux fois : dans l'URL et sous le navigateur)
     src="https://s.wordpress.com/mshots/v1/https%3A%2F%2FMONSITE.CH?w=1200&amp;h=900"
     <small>monsite.ch</small>
     Les caractères %3A%2F%2F remplacent "://". Pour un domaine avec www :
     https%3A%2F%2Fwww.monsite.ch

  b) Le titre <h3>, le texte, l'étiquette <span class="pill">, l'année.
  c) Le lien "Voir le site" href="https://monsite.ch"
  d) Le texte alt de l'image.

Garde UNE SEULE carte avec la classe "project-featured" (la grande).

Ajoute aussi le nom du client dans le bandeau de confiance
(section "BANDEAU CONFIANCE") si tu veux le voir apparaître en haut.

NOTE SUR LES APERÇUS : la toute première fois qu'un site est demandé, le
service met quelques secondes à générer la capture (une animation grise
s'affiche pendant ce temps). Recharge la page une fois : l'image est
ensuite mise en cache et s'affiche instantanément.


-------------------------------------------------
4 bis. LE CARROUSEL D'APERÇUS (en haut de page)
-------------------------------------------------
Dans index.html, cherche le commentaire "CARROUSEL D'APERÇUS".
Pour ajouter un site au défilement, copie une ligne <img> et
renseigne trois valeurs :
    data-url   = le domaine affiché dans la barre du navigateur
    data-link  = l'adresse complète du site
    src        = la même adresse encodée (%3A%2F%2F remplace "://")
Ajoute ensuite un <button class="sc-dot"> de plus juste en dessous.

Le carrousel défile tout seul toutes les 6 secondes, se met en pause
au survol, se pilote aux flèches, aux points, au clavier (← →)
et au balayage du doigt sur mobile.


-------------------------------------------------
4 ter. MODIFIER LES PACKS ET LES PRIX
-------------------------------------------------
Dans index.html, section "PACKS SITES WEB".
Chaque pack est un bloc <article class="pack">.

  - Le prix se trouve dans <p class="pack-price"> :
        <small>Dès</small><strong>750</strong><em>CHF</em>
  - Chaque ligne de la liste est un simple <li>.
    La coche dorée est ajoutée automatiquement par le CSS.
  - Pour griser une mention comme "si nécessaire",
    entoure-la de <i>...</i>.
  - La carte mise en avant porte la classe "pack-featured"
    et contient <span class="pack-badge">Le plus choisi</span>.
    Ne mets cette classe que sur UNE seule carte : c'est elle que
    le carrousel affiche au centre à l'ouverture de la page.

  - Si tu ajoutes ou retires un pack, ajoute ou retire aussi un
    <button class="packs-dot"> dans le bloc "packs-dots" juste
    en dessous, sinon il manquera un point de navigation.

  - Largeur des cartes : variable --pack-w dans style.css
    (.packs-slider). Augmente la valeur maximale pour des cartes
    plus larges et des voisines moins visibles sur les côtés.

Si tu changes un prix, pense à le changer aussi dans les données
structurées en haut du fichier (bloc "hasOfferCatalog", champ minPrice)
et dans la balise <title>, sinon Google affichera l'ancien montant.


-------------------------------------------------
5. CHANGER LES COORDONNÉES
-------------------------------------------------
Tout est dans site-config.js :
  contactEmail, phone, instagram, facebook, linkedin.
Un téléphone ou un réseau renseigné apparaît automatiquement sur le site.
Laisse la valeur vide pour ne rien afficher.


-------------------------------------------------
5 bis. LE PORTRAIT DE LA SECTION "À PROPOS"
-------------------------------------------------
Fichiers : assets/darko-portrait.webp (1000x1250)
           assets/darko-portrait-600.webp (version légère mobile)

La photo a été détourée puis reposée sur un fond sombre dégradé
assorti à la section, avec un fondu vers le bas.

Pour la remplacer plus tard : garde le même format portrait 4/5
et le même fond sombre, sinon le fondu du bas ne collera plus.
Les deux tailles doivent être régénérées ensemble (elles sont
liées par l'attribut srcset dans index.html).


-------------------------------------------------
6. IMAGES
-------------------------------------------------
Les photos d'illustration viennent de Pexels (usage commercial libre,
sans attribution obligatoire) et sont chargées depuis leur serveur.

Quand tu auras tes propres photos (ton matériel, ton bureau, tes clients),
remplace simplement les adresses https://images.pexels.com/... par
assets/ma-photo.webp. Ce sera plus rapide et plus crédible.
Garde les attributs width, height, loading et alt.


-------------------------------------------------
7. À VÉRIFIER APRÈS PUBLICATION
-------------------------------------------------
[ ] Le formulaire arrive bien dans info@ds-digital.ch
[ ] Les aperçus des sites s'affichent (recharger si première visite)
[ ] Affichage sur ton téléphone (menu, formulaire, aperçus)
[ ] Soumettre le sitemap dans Google Search Console
[ ] Vérifier les données structurées : https://search.google.com/test/rich-results

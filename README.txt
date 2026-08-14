DS DIGITAL STUDIO — VERSION GITHUB PAGES
=========================================

Cette version est 100 % statique et compatible avec GitHub Pages.

FICHIERS IMPORTANTS
- index.html = page d'accueil (doit être à la racine du dépôt)
- style.css = design
- script.js = menu, animations et formulaire statique
- site-config.js = configuration de l'adresse e-mail du formulaire
- assets/ = logo + favicon
- CNAME = domaine personnalisé ds-digital.ch
- .nojekyll = désactive le traitement Jekyll
- 404.html = redirection vers l'accueil

MISE EN LIGNE SUR GITHUB
1. Ouvre ton dépôt GitHub.
2. Supprime les anciens fichiers PHP si nécessaire.
3. Envoie LE CONTENU de ce dossier directement à la racine du dépôt.
   Important : index.html doit être visible directement à la racine, pas dans un sous-dossier.
4. GitHub > Settings > Pages.
5. Source : Deploy from a branch.
6. Branch : main ; Folder : / (root).
7. Save.
8. Dans Custom domain, indique : ds-digital.ch
9. Quand GitHub le permet, active Enforce HTTPS.

FORMULAIRE
GitHub Pages ne peut pas exécuter PHP.
Le formulaire de cette version ouvre donc le logiciel e-mail du visiteur.
Pour l'activer, ouvre site-config.js et ajoute ton adresse e-mail :

window.DS_CONFIG = {
  contactEmail: 'TON-EMAIL@DOMAINE.CH'
};

Si tu veux un formulaire qui envoie les demandes directement sans ouvrir l'application e-mail,
il faudra le connecter à un service de formulaire externe (par ex. Formspree/Web3Forms) ou à une fonction serveur.

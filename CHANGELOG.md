# Changelog

## [0.1.2] — 2026-05-05

### Nouvelles fonctionnalités

**Filtrage par périmètre opérateur (`index.html`, `authParams.js`)**
Chaque opérateur connecté ne voit désormais que les mots-clefs appartenant aux ECs
de ses laboratoires (via `valo:responsableDe` sur son item Omeka S).
Au login, l'app charge les ECs des labos autorisés et construit un Set des keyword IDs
autorisés — seuls ces concepts apparaissent dans les scans et les clusters.
Les global admins conservent un accès complet sans restriction.
Un indicateur de périmètre est affiché dans le header : *"Périmètre : X mots-clefs (Y labos)"*.
Un nouveau champ "ID de l'évaluateur" est ajouté dans le panel Paramètres.

**Statistiques dans le bandeau de cache (`index.html`)**
Le bandeau de cache affiche désormais le nombre de concepts analysés et le nombre
de groupes détectés lors du dernier scan, en plus de la date.
Ces stats sont stockées dans le cache et restituées fidèlement au rechargement.

### Correctifs

- L'index Wikidata (`wikidataIndex`) n'était pas reconstruit lors de la restauration
  du cache au rechargement — les badges "⚡ Doublon Wikidata" dans le Browse étaient
  donc vides après un reload. Corrigé.
- `saveCache` capturait `allConcepts.length` depuis la variable globale plutôt que
  depuis les données fraîches du scan — le compteur de concepts pouvait être à 0.
  `totalConcepts` est maintenant passé explicitement en paramètre.


---

## [0.1.1] — 2026-05-05

### Nouvelles fonctionnalités — Intégration Wikidata

**Détection de doublons par ID Wikidata (`similarity.js`)**
Les concepts partageant le même ID Wikidata (`dcterms:isReferencedBy`) sont désormais
détectés comme doublons potentiels, en complément de l'analyse textuelle. Ce signal
Wikidata est combiné avec un seuil de similarité textuelle minimum (0.50) pour éviter
les faux positifs — deux concepts intentionnellement distincts partageant le même ID
Wikidata (traductions, synonymes volontaires) ne sont pas automatiquement signalés.
Le score final est une combinaison pondérée des deux signaux (55% Wikidata, 45% textuel).

**Badge Wikidata sur les clusters (`index.html`, `main.css`)**
Les clusters issus d'une correspondance Wikidata sont signalés par une bordure verte
et un lien "Wikidata QXX ↗" cliquable dans l'en-tête de la carte.
Chaque concept dans un cluster affiche son propre ID Wikidata individuel sous forme
de lien discret, permettant de comparer les IDs même lorsqu'ils diffèrent.

**Index des doublons Wikidata certains (`index.html`)**
Après chaque scan, un index `wikidataId → [concepts]` est construit en mémoire pour
identifier les concepts partageant le même ID dans toute la base, indépendamment
du scan alphabétique.

**Badge doublon Wikidata dans le Browse (`index.html`, `main.css`)**
Les concepts présents dans l'index des doublons Wikidata affichent un badge rouge
"⚡ Doublon Wikidata" dans l'onglet Browse. Un clic affiche un toast listant les
autres concepts concernés avec leur label et leur ID Omeka S.

**Chips de filtre par type de détection (`index.html`, `main.css`)**
Six chips permettent de filtrer les clusters affichés par type :
Tous, Wikidata, Textuel, Variante orthographique, Singulier/pluriel, Termes inclus.
Les chips sont cumulables avec la recherche texte existante.

### Correctifs

- Les IDs Wikidata (`dcterms:isReferencedBy`) sont désormais inclus dans le cache
  local — ils étaient perdus au rechargement de la page.

---

## [0.1.0] — 2026-04-30

Version initiale de cleanKeywords.

### Fonctionnalités

**Détection automatique des doublons (`similarity.js`)**
Analyse textuelle des labels (`o:title`, `skos:prefLabel`, `dcterms:title`) selon
quatre règles en cascade : identiques après normalisation, singulier/pluriel,
variante orthographique (Levenshtein ≤ 2), inclusion de tokens significatifs.
Les mots courants français et anglais sont exclus de la comparaison par tokens.
Seuil minimum de score : 0.70.

**Clustering union-find (`similarity.js`)**
Les paires similaires sont regroupées en clusters par composantes connexes.
Garde-fous : score minimum 0.75 pour relier deux concepts, taille maximale de
6 concepts par cluster pour éviter les chaînes de faux positifs.

**Scan par lettre et scan global (`index.html`)**
La barre alphabétique permet de scanner les concepts lettre par lettre.
Le bouton "⚡ Tout scanner" parcourt les 26 lettres en séquence avec une barre
de progression, puis présente l'ensemble des clusters détectés.

**Cache local du scan (`index.html`)**
Les résultats de chaque scan sont sauvegardés en `localStorage`. Au rechargement
de la page, les clusters sont restaurés instantanément. Un bandeau indique la date
du dernier scan. Le bouton "🔄 Actualiser" efface le cache et repart de zéro.

**Fusion en 2 ou 3 clics (`index.html`)**
Bouton "Fusionner →" sur chaque carte pour une fusion directe (2 clics).
Bouton "Détails ↓" pour ouvrir un accordéon avec aperçu de l'impact
(nb ECs et Expertises affectés) avant de confirmer (3 clics).
La modale de confirmation a été supprimée pour les clusters — elle subsiste
uniquement pour la fusion manuelle depuis le Browse.

**Sécurité des fusions (`index.html`)**
Vérification de l'existence du concept source avant chaque fusion.
En cas d'erreur lors des transferts (ECs ou Expertises), la fusion est interrompue
et le concept source n'est pas supprimé — la base reste dans un état cohérent.
Transfert automatique : ECs (`personPropExp`), Expertises (`valo:expertise`),
traçabilité via `dcterms:replaces` sur le concept cible.

**Détection d'obsolescence post-fusion (`index.html`)**
Après chaque fusion, les concepts supprimés sont barrés dans les clusters encore
affichés. Les clusters réduits à un seul concept actif sont marqués "⚠ À réviser"
et leurs boutons désactivés. L'état est persisté en `localStorage`.

**Exclusion manuelle d'un concept d'un cluster (`index.html`)**
Un bouton ✕ (visible au hover) permet de retirer un concept d'un cluster sans
toucher à la base de données.

**Rejet de clusters (`index.html`)**
Les clusters rejetés sont mémorisés en `localStorage` et ne réapparaissent plus
lors des scans suivants.

**Filtrage et tri des clusters (`index.html`)**
Barre de recherche texte en temps réel, menu de tri (score, taille, ordre
alphabétique), compteur de progression (groupes traités / total).
Mémorisation et restauration de la position de scroll au rechargement.

**Browse paginé (`index.html`)**
Onglet listant tous les concepts avec recherche et tri. Badge ambre sur les
concepts présents dans un cluster, cliquable pour naviguer directement vers
la carte concernée dans l'onglet Doublons. Boutons "→ Source" / "→ Cible"
pour alimenter le formulaire de fusion manuelle sticky.

**Fusion manuelle depuis le Browse (`index.html`)**
Formulaire sticky en bas de page permettant de fusionner deux concepts
quelconques sélectionnés depuis le Browse, avec modale de confirmation.

**Journal des opérations (`index.html`)**
Journal collapsible affichant en temps réel le détail de chaque fusion
(ECs mis à jour, Expertises transférées, suppressions).

**Messages d'erreur lisibles (`index.html`)**
Les toasts d'erreur traduisent les messages techniques en langage lisible
(CORS, 404, 401/403, 500). Un bouton "détails ▾" expose le message brut.
Les toasts d'erreur restent affichés 9 secondes.
# Changelog

## [0.2.1] — 2026-10-22

### Modifié

**Menu des outils harmonisé entre les trois applications (`index.html`, `main.css`)**
Le survol passe du gris au rose pâle de la charte, l'entrée courante gardant un
gris neutre. Les deux fonds étaient jusqu'ici presque identiques — `#f3f4f6`
contre `#EFE8EB` — et ne se distinguaient que parce que rien ne prend la mise au
point à l'ouverture ; ce n'est pas le cas dans ValoVizu, où la confusion s'était
effectivement produite. Les derniers gris écrits en dur du menu — en-tête,
pastille, ligne de version, filet — passent aux jetons.

### Ajouté

**Entrée « Omeka S » dans le menu (`index.html`, `main.css`)**
L'instance figure désormais au bas du menu, détachée par un filet : elle n'est
pas un outil de la suite, elle est ce que la suite interroge. Son adresse est
déduite de celle de l'API plutôt qu'écrite dans le balisage, car elle change
d'un déploiement à l'autre. Elle part dans un nouvel onglet, là où les outils
voisins remplacent la page — on va y vérifier une fiche, pas quitter l'outil.
Même comportement et même présentation que dans ValoVizu.
Aucun masquage conditionnel : cette application n'a pas de session par lien et
reste réservée aux opérateurs.

### Corrigé

**Titre recouvert par le bouton des outils sous 760 px (`main.css`)**
La règle responsive réécrivait le rembourrage en raccourci, ce qui annulait le
`padding-left` réservant la place du bouton. Le titre repassait dessous. Le
bouton étant hors du flux, il ne pousse rien : aucun test de débordement ne
pouvait voir ce recouvrement, il a fallu le regarder.


## [0.2.0] — 2026-10-20

### Modifié

**Bandeau aligné sur celui de ValoVizu (`index.html`, `main.css`)**
Le bandeau passe du Maroon au blanc, avec un filet clair en bas. C'est le
bandeau réel de ValoVizu : chez lui, `--barre-fond` habille la barre de
légende, en dessous, et non l'en-tête. La barre sombre était ce qui empêchait
les deux outils de se lire comme une même suite.

La signature de l'établissement — « Université Paris 8 · Université des
Créations », en chasse fixe et capitales espacées — surmonte désormais le titre,
dont la taille passe de 1,1 à 1,45 rem. Le contenu du bandeau est centré sur
960 px pour s'aligner sur le `.container` en dessous, par le rembourrage plutôt
que par un élément d'habillage supplémentaire.

**Le bouton des outils est détaché du titre et ancré au bord gauche**, dans un
carré bordé dont le cadre et les barres passent au Raspberry au survol. Sur
fond clair, trois traits nus ne se lisent pas comme un bouton.

Il est posé à 24 px du bord et 18 px du haut, les mêmes valeurs que dans
ValoVizu : d'un outil à l'autre, il tombe désormais au même pixel, quelle que
soit la largeur de la fenêtre. Chaque application centrant son en-tête sur la
largeur de son propre contenu — 960 px ici, 1440 chez ValoVizu — un bouton
solidaire du bloc centré se déplaçait de près de deux cents pixels au passage
de l'une à l'autre.

**Conséquence à connaître : le titre n'ouvre plus le menu.** Seul le bouton le
fait, comme chez ValoVizu. Le script est inchangé : l'identifiant `appSwitcher`
a suivi le bouton.

**L'entrée courante du menu reprend les valeurs de validExpertises (`main.css`)**
Elle était teintée de vert, reste de l'identité propre à cette application. Le
menu est l'élément que les trois outils ont en commun ; il ne doit pas se
présenter différemment de l'un à l'autre.

### Corrigé

**Deux boutons rendus invisibles par des couleurs en ligne (`index.html`)**
« Paramètres » et le bouton de recalcul du périmètre portaient
`color:#fff;border-color:rgba(255,255,255,.3)` directement dans le balisage,
pour tenir sur la barre sombre. Sur fond clair ils auraient disparu. Les
couleurs sont retirées ; `.btn-ghost` convient tel quel, puisqu'il est déjà
défini en sombre sur clair. Le `display:none` du second est conservé : il porte
son état initial, que le script bascule ensuite.

**Débordement du bandeau sur écran étroit (`main.css`)**
Il débordait déjà en dessous de 480 px avant ce travail ; le titre agrandi et la
signature ajoutée abaissaient ce seuil à 560 px. Le bandeau autorise désormais
le retour à la ligne, le titre retrouve sa taille d'origine sous 760 px et la
signature s'efface sous 520 px. Plus aucun débordement de 1920 à 390 px — y
compris celui qui préexistait.

**Note technique** — le filigrane « & » du bandeau de ValoVizu n'est pas repris.
Il demande `overflow: hidden` sur l'en-tête, ce qui écrêterait le panneau du
menu déroulant, positionné en absolu à l'intérieur. C'est la panne que ValoVizu
avait elle-même rencontrée avant de sortir son panneau du bandeau.

## [0.1.9] — 2026-10-20

### Modifié

**Palette alignée sur la charte graphique de l'Université Paris 8 (`main.css`)**
Jeu de jetons rigoureusement identique à celui de validExpertises `0.3.4` : les
deux feuilles partagent ce bloc et doivent rester synchronisées. Les noms sont
conservés, seules les valeurs changent, aucune règle de mise en page n'est
touchée.

Le vert `#1B6B45` et l'ambre `#92400E` étaient déjà écrits en dur dans cette
feuille ; les voici promus en jetons et partagés avec l'autre application.

Comme pour validExpertises, quatre des cinq couleurs portant du texte blanc
étaient sous le seuil AA et ne le sont plus.

### Ajouté

**Paramètre de version sur la feuille de style (`index.html`)**
`assets/main.css` était appelée sans version, et le `.htaccess` ne désactive le
cache que pour `index.html`. Les opérateurs auraient donc reçu le nouveau HTML
avec l'ancienne feuille — défaut identique à celui corrigé dans validExpertises
le 30 septembre, resté sans effet ici tant que la feuille n'avait pas changé.
Elle change aujourd'hui. À incrémenter désormais à chaque release qui la touche.

### Corrigé

**Halo bleu sur un bouton devenu rouge (`main.css`)**
Le bouton de lettre actif portait une ombre portée reprenant l'ancien bleu
`#3498db`, écrite en `rgba`. Elle suit maintenant le jeton d'interaction.

**Deux variables qui n'ont jamais existé (`main.css`)**
`--color-background-secondary` et `--color-border-tertiary`, employées dans la
liste des ECs de la fenêtre de suppression, ne sont déclarées nulle part : ces
règles tombaient toujours sur leur valeur de repli, deux gris restés hors du
système. Rattachées aux jetons réels.

## [0.1.8] — 2026-10-20

### Ajouté

**ValoVizu dans le menu des outils (`index.html`)**
Le tableau de bord ValoVizu rejoint le menu de navigation, qui présente
désormais les trois outils de la suite. Le lien est relatif (`../valoVizu/`) et
suppose les trois applications voisines sur le serveur, comme le lien existant
vers `validExpertises`.

Aucun masquage conditionnel ici : cleanKeywords n'a pas de session par lien, et
l'application est déjà inutilisable sans clés d'API — elle ouvre la fenêtre de
configuration et s'arrête là.

## [0.1.7] — 2026-06-12

### Améliorations

**Migration des requêtes réseau vers fetch async (`omk.js`, `index.html`)**
Même migration que `validExpertises` v0.2.8 — `searchItems`, `getAllItems`, `searchItemsPaginated` et `getItem` passent en `fetch` asynchrone. L'UI reste réactive pendant les requêtes. Fonctions concernées : `loadBrowse`, `showDeleteConfirm`, `setupBrowseMergeAc`, `loadConceptInfo`, `setupStickyAc`, ainsi que tous les call sites dans `refreshScope`, `scanLetter`, `previewCluster`, `executeFusion`, `renameConceptInPlace`.

**Protection anti-race-condition sur `setupStickyAc` (`index.html`)**
Token `reqId` incrémenté à chaque frappe. Les réponses périmées sont ignorées. Spinner discret dans le dropdown pendant le chargement.

**Sauvegarde des settings protégée (`index.html`)**
`localStorage.setItem(STORAGE_KEY)` est maintenant dans un `try/catch`. En cas d'indisponibilité du `localStorage` (navigation privée, quota dépassé), un toast avertit l'utilisateur au lieu d'un échec silencieux.

**Protection CORS explicite (`omk.js`)**
`asyncRequest` détecte les erreurs réseau/CORS (`TypeError: Failed to fetch`) et lance une erreur avec un message explicite plutôt qu'un échec silencieux.

### Correctifs

**Déduplication des concepts lors d'une fusion (`index.html`)**
Quand deux concepts fusionnés référencent le même EC, cet EC se retrouvait avec le concept en double dans ses propriétés. Désormais si le concept cible est déjà présent sur un EC, la source est simplement retirée sans ajout de doublon.

## [0.1.6] — 2026-06-10

### Nouvelles fonctionnalités

**Cache des métadonnées Omeka S (`omk.js`)**
Même implémentation que `validExpertises` v0.2.7 — `omk.init()` charge les propriétés, classes et templates depuis le `localStorage` si le cache est valide (< 24h, même API). Fallback automatique sur les requêtes API en cas de cache absent, expiré ou corrompu.

**Bouton "Vider le cache" dans les Paramètres (`index.html`)**
Ajouté dans le footer de la modale Paramètres, aligné à gauche. Vide le cache des métadonnées et ferme la modale.

## [0.1.5] — 2026-05-28

### Nouvelles fonctionnalités

**Renommage de concept (`index.html`, `main.css`)**
Bouton ✎ discret (visible au survol) sur chaque concept dans les clusters et dans le Browse. Au premier clic de la session, une popup d'avertissement informe que l'action modifie directement Omeka S (`o:title`, `skos:prefLabel`, `dcterms:title`). Une case "Ne plus afficher" persiste en `localStorage`. L'édition se fait via un champ `<input>` inline avec hint "Entrée pour valider · Échap pour annuler" — le blur ne valide pas (protection contre les validations accidentelles). Après renommage réussi, un toast vert "Renommé en « X »" reste 9 secondes avec un bouton "Annuler" permettant de restaurer l'ancien label via un PUT inverse.

**Suppression individuelle de concept (`index.html`, `main.css`)**
Bouton 🗑 discret (visible au survol) sur chaque ligne du Browse. Au clic, une modale liste les ECs liés (via `personPropExp`) avec leurs noms et une confirmation explicite. La suppression nettoie d'abord les références dans les items EC avant de supprimer le concept. Arrêt complet si le nettoyage échoue — la source n'est pas supprimée. La ligne disparaît avec animation après succès.

**Fusion individuelle depuis le Browse (`index.html`, `main.css`)**
Bouton ⇢ discret (visible au survol) sur chaque ligne du Browse. Au clic, un panneau inline s'ouvre sous la ligne avec un champ autocomplete pour chercher la cible. La source est exclue des suggestions. Une fois la cible sélectionnée, un bouton "Fusionner dans « X »" apparaît. La fusion utilise `executeFusion` existant. Fermeture par "Annuler" ou ouverture d'un autre panneau.

**Panneau info enrichi dans le Browse (`index.html`, `main.css`)**
Le clic sur le nom d'un concept dans le Browse ouvre désormais un panneau à 3 sections : métadonnées (date de création, lien QID Wikidata), concepts proches (filtrés depuis `currentClusters` — zéro requête API, triés par score), et ECs liés (chargés via XHR). Remplace l'ancien panneau ECs-uniquement.

### Améliorations

**Transfert de métadonnées lors d'une fusion (`index.html`)**
`executeFusion` merge désormais les propriétés de la source vers la cible avant suppression : `dcterms:isReferencedBy` (QID Wikidata), `skos:altLabel`, `skos:broader`, `skos:narrower`, `skos:related`. Déduplication par valeur (`@id`, `@value`, `value_resource_id`). Non bloquant — la fusion continue même si le merge échoue.

**Boutons Source/Cible supprimés du Browse (`index.html`)**
Ces boutons pré-remplissaient la barre de fusion sticky depuis le Browse, un workflow peu intuitif. Remplacés par le bouton ⇢ de fusion directe. La barre sticky reste fonctionnelle depuis l'onglet Doublons.

### Correctifs & nettoyage

**Suppression de `#initOverlay` mort (`index.html`, `main.css`)**
L'overlay plein écran "Connexion en cours…" était devenu inutile après le basculement du feedback dans la modale Paramètres. Le div HTML, le CSS `.init-overlay` et la référence JS orpheline ont été supprimés.

**Listeners `src`/`tgt` orphelins retirés (`index.html`)**
Les listeners sur `[data-action="src"]` et `[data-action="tgt"]` dans `renderBrowseList` ne trouvaient plus d'éléments depuis la suppression des boutons correspondants. Retirés pour garder le code propre.

## [0.1.4] — 2026-05-13

### Améliorations

**Algorithme de similarité — dépluralisation token par token (`similarity.js`)**
`depluralize()` s'applique désormais sur chaque token individuellement plutôt que sur la chaîne complète. "Valeurs sociales" / "Valeur sociale" est maintenant correctement classé comme "Singulier / pluriel" au lieu de "Variante orthographique".

**Algorithme de similarité — exclusion des chiffres romains divergents (`similarity.js`)**
Un check en début de `compare()` détecte les chiffres romains en majuscules dans les labels originaux (avant normalisation). Si les deux labels en contiennent un différent (ex. "XIXe siècle" / "XXe siècle"), la comparaison retourne `null` immédiatement, évitant les faux positifs historiques.

**Algorithme de similarité — clustering par liens directs uniquement (`similarity.js`)**
Le clustering Union-Find ne relie plus les concepts par transitivité aveugle. Un index des paires directement qualifiées est construit et utilisé pour filtrer les membres de chaque groupe : seuls les concepts ayant au moins un lien direct avec un autre membre sont conservés. Évite les faux clusters cross-thématiques.

**Indicateurs de chargement (`index.html`, `main.css`)**
Spinner `⠋ Connexion en cours…` sur le bouton "Enregistrer" de la modale Paramètres pendant `saveSettings()`. Spinner animé sur le bouton "⚡ Tout scanner" pendant les scans. Spinner inline sur les boutons "Fusionner →" pendant `executeClusterFusion`, restaurés en cas d'échec partiel. `loadBrowse()` wrappé dans un `setTimeout` pour laisser le navigateur peindre le spinner avant le freeze XHR.

**Fermeture des balises HTML manquantes (`index.html`)**
Les balises `</body>` et `</html>` absentes en fin de fichier ont été ajoutées.

## [0.1.3] — 2026-05-12

### Nouvelles fonctionnalités

**ECs rattachés à un concept (`index.html`, `main.css`)**
Dans l'onglet Browse, le nom de chaque concept est désormais cliquable. Un clic ouvre un accordéon affichant la liste des ECs qui référencent ce concept via les propriétés `personPropExp`. Les résultats sont chargés à la demande (premier clic uniquement) et dédupliqués cross-propriétés. Un message explicite s'affiche si aucun EC n'est rattaché.

**Badge "💡 Suggestion EC" dans le Browse (`index.html`, `main.css`)**
Les concepts créés par un EC (marqués `dcterms:description = "suggestion"`) affichent désormais un badge violet dans le Browse, en cohérence avec le badge déjà présent dans les clusters.

**Bouton 🔄 Recalcul du périmètre (`index.html`)**
Un bouton discret dans le header permet de recalculer le périmètre de l'opérateur sans se déconnecter. Il n'est visible que lorsqu'un périmètre restreint est actif. `refreshScope()` est désormais une fonction dédiée, appelée par `saveSettings()` et par ce bouton.

**Navigation inter-outils (`index.html`, `main.css`)**
Le titre de l'application dans le header est désormais cliquable et ouvre un menu déroulant listant les outils disponibles (`cleanKeywords`, `validExpertises`). L'outil courant est mis en évidence et non-cliquable. Le menu affiche également le numéro de version en bas.

### Améliorations

**Pagination client en mode périmètre restreint (`index.html`)**
En mode opérateur restreint, le Browse bascule en pagination côté client : tous les concepts du périmètre sont chargés en une seule passe, filtrés sur `allowedConceptIds`, puis découpés par tranches de 30. Cela garantit des pages toujours pleines et un compteur exact. Le cache de pagination est invalidé lors d'un changement de recherche, de tri ou de recalcul de périmètre. En mode admin, la pagination serveur est conservée.

**Compteur enrichi dans la pagination (`index.html`)**
En mode restreint, la pagination affiche désormais `"X concepts — page Y / Z"` pour donner une vision immédiate du volume total. En mode admin, l'affichage reste `"Page N"`.

**Rechargement automatique du Browse après scan (`index.html`)**
Après `scanAll` ou `scanLetter`, si l'onglet Browse est actif, il est automatiquement rechargé pour refléter les nouveaux badges de clusters.

**Avertissement de cache obsolète (`index.html`, `main.css`)**
Si le cache a plus de 24h, le bandeau de cache passe en orange avec le message *"⚠ Cache de plus de 24h — données potentiellement obsolètes"*. Aucun effacement automatique — l'utilisateur garde le contrôle.

### Correctifs

**`pairKey()` — clé bidirectionnelle non normalisée (`index.html`)**
La clé d'une paire (`idA_idB`) pouvait être générée dans un ordre différent selon le contexte (scan frais vs restauration depuis le cache), empêchant la détection des paires déjà rejetées. La clé est désormais toujours triée numériquement (`min_max`).

**Browse non filtré par périmètre (`index.html`)**
L'onglet Browse listait tous les concepts de la base sans tenir compte du périmètre de l'opérateur. Il applique maintenant le même filtrage que les scans.

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
# ValidKeywords

Application web front-end pour détecter et fusionner les mots-clefs doublons dans une instance Omeka S.

L'interface analyse automatiquement les concepts (`skos:Concept`) de la base de données, regroupe les variantes similaires en clusters, et permet à un administrateur de fusionner les doublons en transférant proprement toutes les relations vers le concept conservé.

## Fonctionnalités

- Détection automatique des doublons par analyse textuelle (normalisation, singulier/pluriel, distance orthographique, inclusion de termes).
- Regroupement en clusters de concepts similaires via un algorithme union-find.
- Scan lettre par lettre ou scan global de l'ensemble des concepts en une opération.
- Cache local du dernier scan pour éviter de tout recharger à chaque session.
- Marquage automatique des concepts devenus obsolètes après une fusion.
- Fusion en 2 clics (bouton rapide) ou 3 clics (accordéon avec aperçu de l'impact).
- Transfert automatique des relations ECs et Expertises vers le concept conservé.
- Traçabilité des fusions via `dcterms:replaces` sur le concept cible.
- Browse paginé de tous les concepts avec recherche et accès direct aux clusters concernés.
- Fusion manuelle de deux concepts quelconques depuis le Browse.
- Journal des opérations en temps réel.
- Messages d'erreur lisibles avec détail technique accessible à la demande.

## Architecture

```text
cleanKeywords/
    index.html
    assets/
        main.css
        js/
            appUrl.js
            auth.js
            authParams.js
            d3.min.js
            omk.js
            similarity.js
```

`similarity.js` contient l'ensemble des algorithmes de comparaison et de clustering, indépendamment du reste de l'application.

## Prérequis

- Un serveur web local (Apache, Nginx, `python -m http.server`, etc.).
- Une instance Omeka S accessible en HTTP(S).
- Une clé API Omeka S (`key_identity`, `key_credential`) avec droits de lecture et d'écriture sur les items et leurs propriétés.
- Les vocabulaires suivants présents dans l'instance : `skos` (pour `skos:Concept`), `dcterms` (pour `dcterms:replaces`, `dcterms:title`), et les vocabulaires utilisés pour les relations ECs/Expertises (`valo:expertise`, etc.).
- D3 chargé localement via `assets/js/d3.min.js`.

## Installation rapide

1. Cloner le dépôt.
2. Servir le dossier `cleanKeywords` via un serveur web.
3. Ouvrir l'application dans le navigateur.

Exemple minimal :

```bash
cd cleanKeywords
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Configuration

La configuration est initialisée depuis `assets/js/authParams.js`, puis surchargeable via la fenêtre Paramètres dans l'UI. Les paramètres sont sauvegardés en `localStorage` (clé `cleanKeywords_cfg`).

Paramètres disponibles :

- `apiOmk` : URL de base de l'API Omeka S (ex. `https://moninstance.fr/api/`).
- `mail` : email du compte Omeka S utilisé pour identifier l'utilisateur de la clé API.
- `ident` : `key_identity` Omeka S.
- `key` : `key_credential` Omeka S.
- `personPropExp` : liste de propriétés séparées par des virgules listant les mots-clefs des personnes (ex. `skos:hasTopConcept,dcterms:subject`). Utilisée lors des fusions pour mettre à jour les items ECs.

## Utilisation

### Onglet Doublons

Cet onglet est la vue principale. Il présente les concepts similaires sous forme de clusters.

**Scanner une lettre** — cliquer sur une lettre dans la barre alphabétique charge tous les concepts commençant par cette lettre et calcule les groupes de doublons potentiels. La lettre passe en vert une fois traitée.

**Tout scanner** — le bouton "⚡ Tout scanner" parcourt les 26 lettres en séquence avec une barre de progression. Le résultat complet est affiché une fois le scan terminé. Cette opération peut prendre entre 30 secondes et quelques minutes selon la taille de la base et la latence réseau.

**Cache** — après chaque scan, les résultats sont sauvegardés localement. Au rechargement de la page, les clusters sont restaurés instantanément sans nouvelle requête. Le bandeau de cache indique la date du dernier scan. Le bouton "🔄 Actualiser" efface le cache et repart de zéro.

**Filtrer et trier** — une barre de recherche filtre les clusters par texte en temps réel. Le menu déroulant permet de trier par score de similarité, par nombre de concepts, ou par ordre alphabétique. Un compteur indique la progression (groupes traités / total).

### Traiter un cluster

Chaque carte représente un groupe de concepts jugés similaires. Elle affiche le score de similarité et la raison détectée (variante orthographique, singulier/pluriel, termes inclus).

**Sélectionner le concept à conserver** — les radio buttons permettent de choisir lequel des concepts sera conservé après la fusion. Les autres seront supprimés. Par défaut, le premier de la liste est sélectionné.

**Exclure un concept du groupe** — survoler une ligne fait apparaître un bouton ✕ permettant de retirer un concept du cluster sans toucher à la base de données. Si le cluster tombe à un seul concept, la carte disparaît.

**Fusionner en 2 clics** — le bouton "Fusionner →" (rouge) exécute directement la fusion avec le concept sélectionné par défaut, sans étape intermédiaire.

**Fusionner avec aperçu (3 clics)** — le bouton "Détails ↓" ouvre un accordéon qui affiche automatiquement le nombre d'ECs et d'Expertises qui seront mis à jour, puis propose un bouton "Fusionner →" pour confirmer.

**Rejeter** — marque le groupe comme faux positif. Il ne sera plus affiché lors des prochains scans (stocké en `localStorage`).

### Ce que fait une fusion

1. Tous les items ECs dont une propriété listée dans `personPropExp` pointe vers le concept source sont mis à jour pour pointer vers le concept cible.
2. Tous les items Expertise dont `valo:expertise` pointe vers le concept source sont transférés vers le concept cible.
3. La propriété `dcterms:replaces` est ajoutée sur le concept cible pour tracer la fusion.
4. Le concept source est supprimé.

Si une erreur survient lors des étapes 1 ou 2, la fusion est interrompue et le concept source n'est **pas** supprimé — la base reste dans un état cohérent.

### Concepts obsolètes

Après une fusion, les concepts supprimés sont automatiquement détectés dans les autres clusters encore affichés : leur ligne est barrée et grisée. Si un cluster n'a plus qu'un seul concept actif, il est marqué "⚠ À réviser" et ses boutons de fusion sont désactivés.

### Onglet Tous les concepts

Cet onglet affiche la liste paginée de tous les concepts de la base, avec une barre de recherche et un tri par titre ou par date.

Les concepts présents dans un cluster de doublons affichent un badge ambre "⚠ X groupe(s)". Un clic sur ce badge bascule vers l'onglet Doublons et scrolle directement vers le cluster concerné.

Les boutons "→ Source" et "→ Cible" permettent de sélectionner deux concepts pour une **fusion manuelle** via le formulaire sticky en bas de page. Cette fusion passe par une modale de confirmation car elle ne bénéficie pas d'un calcul d'aperçu automatique.

## Données locales

L'application utilise plusieurs clés `localStorage` :

| Clé | Contenu |
|---|---|
| `cleanKeywords_cfg` | Configuration (API, clés, propriétés) |
| `cleanKeywords_scan_cache` | Résultats du dernier scan (clusters) |
| `cleanKeywords_done` | Lettres déjà scannées |
| `cleanKeywords_rejected` | Paires rejetées manuellement |
| `cleanKeywords_deleted` | IDs des concepts supprimés durant la session |
| `cleanKeywords_scroll` | Position de scroll (restaurée au rechargement) |

Toutes ces données sont effacées par le bouton "🔄 Actualiser".

## Algorithmes de détection

La similarité entre deux labels est détectée par `similarity.js` selon quatre règles appliquées dans l'ordre :

1. **Identiques après normalisation** — même label une fois passé en minuscules, sans accents et sans ponctuation (score 1.0).
2. **Singulier / pluriel** — même label après suppression du s ou x final (score 0.95).
3. **Variante orthographique** — distance de Levenshtein ≤ 2 avec des longueurs de labels proches (score ≥ 0.70).
4. **Termes inclus** — tous les tokens significatifs (≥ 4 caractères, hors mots courants) du label court sont présents dans le label long, avec une couverture d'au moins 60% (score ≥ 0.70).

Les paires avec un score inférieur à 0.70 sont ignorées. Les clusters sont construits par union-find avec un score minimum de 0.75 et une taille maximale de 6 concepts pour éviter les chaînes de faux positifs.

## Sécurité

- Éviter de versionner des secrets dans `assets/js/authParams.js`.
- L'application est destinée à des administrateurs globaux uniquement — elle n'implémente pas de restriction d'accès côté client.
- Utiliser des clés API limitées aux droits nécessaires (lecture + écriture sur les items).

## Dépannage

- **Erreur réseau (CORS)** : le serveur Omeka S doit autoriser les requêtes depuis l'origine de l'app. Configurer les headers `Access-Control-Allow-*` côté serveur et s'assurer que les requêtes `OPTIONS` retournent un code 200.
- **Aucun concept trouvé** : vérifier que la classe `skos:Concept` est bien présente dans les vocabulaires de l'instance et que `key_identity` / `key_credential` ont les droits de lecture.
- **Fusion échouée** : vérifier dans le journal des opérations le détail de l'erreur. En cas d'erreur CORS sur les requêtes d'écriture, voir le point ci-dessus.
- **Cache obsolète** : si la base a été modifiée en dehors de l'app, utiliser "🔄 Actualiser" pour repartir d'un scan propre.

## Licence

Ajouter ici la licence du projet si nécessaire.
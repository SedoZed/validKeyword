// ──────────────────────────────────────────────
// SIMILARITY.JS — Algorithmes de comparaison de labels
//
// Pipeline de détection :
//   1. Normalisation (casse, accents, ponctuation)
//   2. Dépluralisation token par token (s/x final)
//   3. Levenshtein adaptatif (≤1 si <12 chars, ≤2 sinon)
//   4. Inclusion de tokens significatifs
//
// Seuils configurables en bas de fichier.
// ──────────────────────────────────────────────

// Mots courants exclus de la comparaison par tokens (faux positifs)
const STOP_WORDS = new Set([
    // Français
    'de','du','la','le','les','des','en','et','ou','un','une',
    'au','aux','par','sur','sous','pour','dans','avec','sans','vers',
    // Anglais
    'the','of','and','in','for','on','at','to','an','a'
]);


// ──────────────────────────────────────────────
// FONCTIONS UTILITAIRES (non exportées)
// ──────────────────────────────────────────────

// Minuscules + suppression accents + ponctuation → chaîne normalisée
export function normalize(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[''`]/g, ' ')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Dépluralise chaque token individuellement (ex. "valeurs sociales" → "valeur sociale")
// Requiert au moins 3 caractères avant le pluriel pour éviter les faux positifs
function depluralize(str) {
    return str.split(' ')
        .map(token => token.replace(/([a-z]{3,})(?:s|x)$/, '$1'))
        .join(' ');
}

// Distance de Levenshtein (programmation dynamique)
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// Score de similarité Levenshtein normalisé entre 0 et 1
function levenshteinScore(a, b) {
    const dist   = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

// Découpe un label normalisé en tokens significatifs
// (longueur ≥ 4 caractères, hors stop words)
function tokenize(str) {
    return str.split(' ').filter(t => t.length >= 4 && !STOP_WORDS.has(t));
}

// Vérifie si tous les tokens de A sont présents dans B
function tokensIncluded(tokensA, tokensB) {
    return tokensA.every(t => tokensB.includes(t));
}


// ──────────────────────────────────────────────
// COMPARAISON DE DEUX LABELS
// Retourne null si pas de similarité détectée,
// ou { score: number, reason: string } sinon.
// ──────────────────────────────────────────────

export function compare(labelA, labelB) {
    if (!labelA || !labelB) return null;

    const normA = normalize(labelA);
    const normB = normalize(labelB);

    // Labels trop courts ou identiques → ignorés
    if (!normA || !normB || normA === normB) return null;
    if (normA.length < 3 || normB.length < 3) return null;

    // 1. Match exact après normalisation (ex. casse ou accents différents)
    if (normA === normB)
        return { score: 1.0, reason: 'Identiques après normalisation' };

    // 2. Match après dépluralisation (ex. "école" / "écoles")
    if (depluralize(normA) === depluralize(normB))
        return { score: 0.95, reason: 'Singulier / pluriel' };

    // 3. Levenshtein adaptatif
    // — dist ≤ 1 pour les chaînes courtes (< 12 chars) pour éviter les faux positifs
    // — dist ≤ 2 pour les chaînes plus longues
    // — Détection cross-langue : sur les labels multi-mots, si le token divergent
    //   a une distance > 1 sur sa propre longueur, c'est probablement une traduction
    const maxDist  = Math.min(normA.length, normB.length) < 12 ? 1 : 2;
    const dist     = levenshtein(normA, normB);
    const lenRatio = Math.min(normA.length, normB.length) / Math.max(normA.length, normB.length);
    if (dist <= maxDist && lenRatio >= 0.8) {
        // Détection cross-langue sur labels multi-mots
        const wordsA = normA.split(' ');
        const wordsB = normB.split(' ');
        if (wordsA.length > 1 && wordsA.length === wordsB.length) {
            const divergent = wordsA.filter((w, i) => w !== wordsB[i]);
            const isCrossLang = divergent.some((w, i) => {
                const wb = wordsB[wordsA.indexOf(w)];
                if (!wb) return false;
                // Si le token divergent est plus long que 5 chars et la distance relative > 30%
                // → probable traduction, pas une variante orthographique
                const tokenDist = levenshtein(w, wb);
                const maxTok    = Math.max(w.length, wb.length);
                return maxTok > 5 && tokenDist / maxTok > 0.25;
            });
            if (isCrossLang) return null;
        }
        const score = levenshteinScore(normA, normB);
        if (score >= 0.7)
            return { score, reason: 'Variante orthographique' };
    }

    // 4. Inclusion de tokens significatifs
    // Le label court doit couvrir au moins 60% des tokens du label long
    const tokA = tokenize(normA);
    const tokB = tokenize(normB);
    if (tokA.length >= 2 && tokB.length >= 2 && tokA.length !== tokB.length) {
        const [shorter, longer] = tokA.length < tokB.length ? [tokA, tokB] : [tokB, tokA];
        const coverage = shorter.length / longer.length;
        if (coverage >= 0.6 && tokensIncluded(shorter, longer)) {
            const score = 0.55 + 0.35 * coverage;
            if (score >= 0.7)
                return { score, reason: 'Termes inclus' };
        }
    }

    return null;
}


// ──────────────────────────────────────────────
// RECHERCHE DE PAIRES (batch)
// Compare tous les concepts entre eux (O(n²)).
// Retourne les paires triées par score décroissant.
// ──────────────────────────────────────────────

const MIN_PAIR_SCORE        = 0.70; // Score minimum pour une paire textuelle
const MIN_WIKIDATA_TEXT     = 0.50; // Similarité textuelle minimum pour valider un match Wikidata
const WIKIDATA_WEIGHT       = 0.55; // Poids du signal Wikidata dans le score combiné
const TEXT_WEIGHT           = 0.45; // Poids du signal textuel dans le score combiné

// Extrait l'ID Wikidata (ex. "Q11660") depuis dcterms:isReferencedBy
// Gère deux formats : URI (https://www.wikidata.org/wiki/Q11660) et identifiant (wikidata_Q11660)
export function extractWikidataId(item) {
    const refs = item['dcterms:isReferencedBy'] || [];
    for (const ref of refs) {
        // Format URI : { '@id': 'https://www.wikidata.org/wiki/Q11660' }
        if (ref['@id']) {
            const m = ref['@id'].match(/Q\d+/);
            if (m) return m[0];
        }
        // Format identifiant : { '@value': 'wikidata_Q11660' }
        if (ref['@value']) {
            const m = ref['@value'].match(/Q\d+/);
            if (m) return m[0];
        }
    }
    return null;
}

export function findPairs(concepts) {
    const pairs = [];

    // Extrait tous les labels d'un item Omeka S (o:title, skos:prefLabel, dcterms:title)
    const getLabels = item => {
        const labels = new Set();
        if (item['o:title']) labels.add(item['o:title']);
        (item['skos:prefLabel'] || []).forEach(v => { if (v['@value']) labels.add(v['@value']); });
        (item['dcterms:title']  || []).forEach(v => { if (v['@value']) labels.add(v['@value']); });
        return [...labels];
    };

    for (let i = 0; i < concepts.length; i++) {
        for (let j = i + 1; j < concepts.length; j++) {
            const cA = concepts[i];
            const cB = concepts[j];

            // Priorité 1 : même ID Wikidata
            // Nécessaire mais pas suffisant : on vérifie aussi la similarité textuelle
            // pour éviter les faux positifs (traductions, synonymes intentionnellement séparés)
            const wdA = extractWikidataId(cA);
            const wdB = extractWikidataId(cB);
            if (wdA && wdB && wdA === wdB) {
                const labelsA = getLabels(cA);
                const labelsB = getLabels(cB);
                // Cherche la meilleure similarité textuelle entre les labels
                let bestTextScore = 0;
                let bestLabels    = { labelA: labelsA[0] || `#${cA['o:id']}`, labelB: labelsB[0] || `#${cB['o:id']}` };
                for (const la of labelsA) {
                    for (const lb of labelsB) {
                        const normA = normalize(la), normB = normalize(lb);
                        if (normA && normB) {
                            const s = levenshteinScore(normA, normB);
                            if (s > bestTextScore) { bestTextScore = s; bestLabels = { labelA: la, labelB: lb }; }
                        }
                    }
                }
                // Valide la paire uniquement si les labels sont suffisamment proches
                if (bestTextScore >= MIN_WIKIDATA_TEXT) {
                    const combinedScore = WIKIDATA_WEIGHT * 1.0 + TEXT_WEIGHT * bestTextScore;
                    pairs.push({
                        a:        cA,
                        b:        cB,
                        score:    combinedScore,
                        reason:   'Même concept Wikidata',
                        labelA:   bestLabels.labelA,
                        labelB:   bestLabels.labelB,
                        wikidata: wdA,
                    });
                }
                continue; // dans tous les cas on ne lance pas le pipeline textuel
            }

            // Priorité 2 : comparaison textuelle habituelle
            const labelsA = getLabels(cA);
            const labelsB = getLabels(cB);
            let best = null;
            for (const la of labelsA) {
                for (const lb of labelsB) {
                    const result = compare(la, lb);
                    if (result && result.score >= MIN_PAIR_SCORE && (!best || result.score > best.score))
                        best = { ...result, labelA: la, labelB: lb };
                }
            }
            if (best) {
                pairs.push({
                    a:      cA,
                    b:      cB,
                    score:  best.score,
                    reason: best.reason,
                    labelA: best.labelA,
                    labelB: best.labelB,
                });
            }
        }
    }

    return pairs.sort((x, y) => y.score - x.score);
}


// ──────────────────────────────────────────────
// CLUSTERING — Union-Find
// Regroupe les paires en composantes connexes.
// Garde-fous : score minimum et taille maximale.
// ──────────────────────────────────────────────

const MIN_CLUSTER_SCORE = 0.75; // Score minimum pour relier deux concepts dans un cluster
const MAX_CLUSTER_SIZE  = 6;    // Limite de taille pour éviter les chaînes abusives

export function buildClusters(pairs, allConcepts) {
    const parent = {}; // parent[id] = id racine du groupe
    const clSize = {}; // clSize[id] = taille courante du groupe (indexé sur la racine)

    // Trouve la racine d'un nœud (avec path compression)
    function find(id) {
        if (parent[id] === undefined) { parent[id] = id; clSize[id] = 1; }
        if (parent[id] !== id) parent[id] = find(parent[id]);
        return parent[id];
    }

    // Fusionne deux groupes (sauf si ça dépasserait MAX_CLUSTER_SIZE)
    function union(a, b) {
        const ra = find(a), rb = find(b);
        if (ra === rb) return;
        const newSize = (clSize[ra] || 1) + (clSize[rb] || 1);
        if (newSize > MAX_CLUSTER_SIZE) return;
        parent[rb] = ra;
        clSize[ra] = newSize;
    }

    // Construit les groupes à partir des paires suffisamment similaires
    // Garde-fou : on ne relie deux concepts que si leur paire est directement qualifiée,
    // pas par transitivité aveugle — évite les faux clusters cross-thématiques
    const qualifiedPairs = pairs.filter(p => p.score >= MIN_CLUSTER_SCORE);

    // Index des paires qualifiées par concept pour vérifier les liens directs
    const directLinks = new Map();
    qualifiedPairs.forEach(p => {
        const idA = p.a['o:id'], idB = p.b['o:id'];
        if (!directLinks.has(idA)) directLinks.set(idA, new Set());
        if (!directLinks.has(idB)) directLinks.set(idB, new Set());
        directLinks.get(idA).add(idB);
        directLinks.get(idB).add(idA);
    });

    qualifiedPairs.forEach(p => union(p.a['o:id'], p.b['o:id']));

    // Regroupe les concepts et paires par racine
    // Un concept n'est inclus dans un groupe que s'il a au moins un lien direct
    // avec un autre membre du groupe (évite les "passagers clandestins" transitifs)
    const groups = {};
    qualifiedPairs.forEach(p => {
        [p.a, p.b].forEach(concept => {
            const root = find(concept['o:id']);
            if (!groups[root]) groups[root] = { concepts: [], pairs: [], bestScore: 0 };
            if (!groups[root].concepts.find(c => c['o:id'] === concept['o:id']))
                groups[root].concepts.push(concept);
        });
        const root = find(p.a['o:id']);
        groups[root].pairs.push(p);
        if (p.score > groups[root].bestScore) groups[root].bestScore = p.score;
    });

    // Retire les concepts sans lien direct avec les autres membres du groupe
    Object.values(groups).forEach(g => {
        const memberIds = new Set(g.concepts.map(c => c['o:id']));
        g.concepts = g.concepts.filter(c => {
            const links = directLinks.get(c['o:id']) || new Set();
            return [...links].some(id => memberIds.has(id));
        });
    });

    return Object.entries(groups)
        .map(([root, g]) => ({ id: root, ...g }))
        .filter(g => g.concepts.length >= 2)
        .sort((a, b) => b.bestScore - a.bestScore);
}
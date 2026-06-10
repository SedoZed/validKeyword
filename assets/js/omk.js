export class omk {
    constructor(params) {
        var me = this;
        this.key    = params.key    ? params.key    : false;
        this.ident  = params.ident  ? params.ident  : false;
        this.mail   = params.mail   ? params.mail   : false;
        this.api    = params.api    ? params.api    : false;
        this.vocabs = params.vocabs ? params.vocabs : ['dcterms', 'foaf', 'skos', 'curation', 'valo'];
        this.proxy  = params.proxy  ? params.proxy  : true;
        this.user   = false;
        this.owners = [];
        this.props  = [];
        this.class  = [];
        this.items  = [];
        this.rts;

        let perPage = 1000,
            types   = { 'items': 'o:item', 'media': 'o:media' };


        // ──────────────────────────────────────────────
        // INIT
        // ──────────────────────────────────────────────

        const CACHE_KEY = 'omk_metadata_cache';
        const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h en ms

        this.init = function () {
            // Tente de charger les métadonnées depuis le cache localStorage
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { ts, api, props, classes, rts } = JSON.parse(cached);
                    // Cache valide si < 24h et pour la même API
                    if (Date.now() - ts < CACHE_TTL && api === me.api) {
                        me.props = props;
                        me.class = classes;
                        me.rts   = rts;
                        return; // pas de requêtes réseau
                    }
                }
            } catch (e) { /* cache corrompu — on recharge depuis l'API */ }

            // Cache absent ou expiré : requêtes normales
            me.vocabs.forEach(v => {
                me.getProps(v);
                me.getClass(v);
            });
            me.getRT();

            // Sauvegarde en cache
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    ts:      Date.now(),
                    api:     me.api,
                    props:   me.props,
                    classes: me.class,
                    rts:     me.rts,
                }));
            } catch (e) { /* localStorage plein ou indisponible — pas grave */ }
        }

        // Vide le cache des métadonnées (à appeler depuis les Paramètres)
        this.clearMetadataCache = function () {
            localStorage.removeItem(CACHE_KEY);
        }

        this.getRT = function (cb = false) {
            me.rts = syncRequest(me.api + 'resource_templates?per_page=1000');
            if (cb) cb(me.rts);
        }

        this.getRtId = function (label) {
            return me.rts.filter(rt => rt['o:label'] == label)[0]['o:id'];
        }


        // ──────────────────────────────────────────────
        // PROPRIÉTÉS & CLASSES
        // ──────────────────────────────────────────────

        this.getProps = function (prefix, cb = false) {
            let url  = me.api + 'properties?per_page=1000&vocabulary_prefix=' + prefix,
                data = syncRequest(url);
            data.forEach(p => me.props.push(p));
            if (cb) cb(me.props);
        }

        this.getPropId = function (t) {
            return me.props.filter(prp => prp['o:term'] == t)[0]['o:id'];
        }

        this.getPropByTerm = function (t) {
            return me.props.filter(prp => prp['o:term'] == t)[0];
        }

        this.getClass = function (prefix, cb = false) {
            let url  = me.api + 'resource_classes?per_page=1000&vocabulary_prefix=' + prefix,
                data = syncRequest(url);
            data.forEach(c => me.class.push(c));
            if (cb) cb(data);
        }

        this.getClassByName = function (cl) {
            let c = me.class.filter(c => c['o:label'].toLowerCase() == cl.toLowerCase());
            return c[0];
        }

        this.getClassByTerm = function (cl) {
            let c = me.class.filter(c => c['o:term'].toLowerCase() == cl.toLowerCase());
            return c[0];
        }


        // ──────────────────────────────────────────────
        // LECTURE D'ITEMS
        // ──────────────────────────────────────────────

        this.getResource = function (id, type, cb = false) {
            let url = me.api + type + '/' + id,
                rs  = syncRequest(url);
            if (cb) cb(rs);
            return rs;
        }

        this.getItem = function (id, cb = false) {
            let url = me.api + 'items/' + id,
                rs  = syncRequest(url);
            if (cb) cb(rs);
            return rs;
        }

        this.getMedia = function (id, cb = false) {
            let url = me.api + 'media/' + id,
                rs  = syncRequest(url);
            if (cb) cb(rs);
            return rs;
        }

        this.getRandomItemByClass = function (cl, cb = false) {
            let url;
            try {
                url = me.api + 'items?resource_class_id=' + me.getClassByName(cl)['o:id'];
            } catch (error) {
                console.error(error);
            }
            let rs = syncRequest(url),
                r  = rs[Math.floor(Math.random() * rs.length)];
            if (cb) cb(r);
            return r;
        }

        this.getItemAdminLink = function (item) {
            return me.api.replace('/api/', '/admin/item/') + item['o:id'];
        }

        this.getAdminLink = function (r, id = false, type = false) {
            if (!type) type = r['@type'][0];
            return type == 'o:Item'
                ? me.api.replace('/api/', '/admin/item/')  + (id ? id : r['o:id'])
                : me.api.replace('/api/', '/admin/media/') + (id ? id : r['o:id']);
        }

        this.getMediaLink = function (file) {
            return me.api.replace('/api', '') + file;
        }


        // ──────────────────────────────────────────────
        // MÉDIAS
        // ──────────────────────────────────────────────

        this.getMedias = async function (p, linkMedia = '') {
            p.medias = [];
            p['o:media'].forEach(m => {
                p.medias.push(syncRequest(m['@id']));
            });
            if (linkMedia && p[linkMedia]) me.getLinkMedias(p, linkMedia);
        }

        this.getLinkMedias = function (p, linkMedia) {
            p.medias = p.medias ? p.medias : [];
            p[linkMedia].forEach(i => {
                let item = syncRequest(i['@id']);
                me.getMedias(item);
                item.medias.forEach(m => { p.medias.push(m); });
            });
        }

        this.getMediasPage = function (query, page, nb, cb = false) {
            let url = me.api + 'media?per_page=' + nb + '&' + query + '&page=' + page,
                rs  = syncRequest(url);
            if (cb) cb(rs);
            return rs;
        }


        // ──────────────────────────────────────────────
        // RECHERCHE
        // ──────────────────────────────────────────────

        this.searchItems = function (query, cb = false) {
            let url = me.api + 'items?' + query,
                rs  = syncRequest(url);
            if (cb) cb(rs);
            return rs;
        }

        this.searchItemsPaginated = function (query, page = 1, perPage = 20) {
            const url     = me.api + 'items?' + query + '&page=' + page + '&per_page=' + perPage;
            const request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send(null);
            if (request.status === 200) {
                const items   = JSON.parse(request.response);
                // X-Total-Results inaccessible en cross-origin :
                // on déduit s'il y a une page suivante depuis le nombre d'items reçus
                const hasMore = items.length === perPage;
                return { items, hasMore };
            }
            return { items: [], hasMore: false };
        }

        this.getAllItems = function (query, cb = false) {
            let url = me.api + 'items?per_page=' + perPage + '&' + query + '&page=',
                fin = false, rs = [], data, page = 1;
            while (!fin) {
                data = syncRequest(url + page);
                fin  = data.length ? false : true;
                rs   = rs.concat(data);
                page++;
            }
            if (cb) cb(rs);
            return rs;
        }

        this.getAllMedias = function (query, cb = false) {
            let url = me.api + 'media?per_page=' + perPage + '&' + query + '&page=',
                fin = false, rs = [], data, page = 1;
            while (!fin) {
                data = syncRequest(url + page);
                fin  = data.length ? false : true;
                rs   = rs.concat(data);
                page++;
            }
            if (cb) cb(rs);
            return rs;
        }


        // ──────────────────────────────────────────────
        // UTILISATEURS & DIVERS
        // ──────────────────────────────────────────────

        this.getOwner = async function (id) {
            if (me.owners[id]) return me.owners[id];
            let url = me.api + 'users/' + id + '?key_identity=' + me.ident + '&key_credential=' + me.key;
            me.owners[id] = await d3.json(url);
            return me.owners[id];
        }

        this.getUser = async function (cb = false) {
            let url  = me.api + 'users?email=' + me.mail + '&key_identity=' + me.ident + '&key_credential=' + me.key;
            let data = await d3.json(url);
            me.user  = data.length ? data[0] : false;
            return me.user;
        }

        this.showAdmin = function (id, type = 'item') {
            let url = me.api.replace('/api/', '/admin/') + type + '/' + id;
            window.open(url, '_blank');
        }

        this.getApiInfo = function (info, cb = false) {
            // nécessite l'installation du module api info https://gitlab.com/Daniel-KM/Omeka-S-module-ApiInfo
            let url = me.api + 'infos/' + info,
                rs  = syncRequest(url);
            if (cb) cb(rs);
            return rs;
        }

        this.saveJson = function (data) {
            // merci à https://stackoverflow.com/questions/33780271/export-a-json-object-to-a-text-file/52297652#52297652
            const filename = 'data.json';
            const jsonStr  = JSON.stringify(data);
            let element    = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }


        // ──────────────────────────────────────────────
        // CRUD
        // ──────────────────────────────────────────────

        this.createRessource = function (data, cb = false, type = 'items') {
            let url = me.api + type + '?key_identity=' + me.ident + '&key_credential=' + me.key;
            postData({ 'u': url, 'm': 'POST' }, me.formatData(data), data['file']).then((rs) => {
                if (cb) cb(rs);
            });
        }

        this.createItem = async function (data, cb = false, verifDoublons = false) {
            if (verifDoublons) {
                let items = me.searchItems(verifDoublons);
                if (items.length) {
                    if (cb) cb(items[0]);
                    return items[0];
                }
            }
            let url = me.api + 'items?key_identity=' + me.ident + '&key_credential=' + me.key,
                rs  = await postData({ 'u': url, 'm': 'POST' }, me.formatData(data));
            me.items[rs['o:id']] = rs;
            return rs;
        }

        this.updateRessource = async function (id, data, type = 'items', fd = null, m = 'PUT', dataOri = false) {
            let oriData, newData,
                url = me.api + type + '/' + id + '?key_identity=' + me.ident + '&key_credential=' + me.key;
            if (data) {
                oriData = dataOri ? dataOri : me.getResource(id, type);
                newData = me.formatData(data, types[type]);
                for (const p in newData) {
                    if (p != '@type') {
                        if (oriData[p] && p != 'o:resource_template' && p != 'o:resource_class')
                            oriData[p] = oriData[p].concat(newData[p]);
                        else
                            oriData[p] = newData[p];
                    }
                }
            }
            return await postData({ 'u': url, 'm': m }, fd ? fd : oriData);
        }

        this.deleteItem = async function (data) {
            let url = me.api + 'items/' + data['o:id'] + '?key_identity=' + me.ident + '&key_credential=' + me.key,
                rs  = await postData({ 'u': url, 'm': 'DELETE' });
            return rs;
        }


        // ──────────────────────────────────────────────
        // FORMATAGE DES DONNÉES
        // ──────────────────────────────────────────────

        this.formatData = function (data, type = 'o:Item') {
            let fd = { '@type': type }, p;
            for (let [k, v] of Object.entries(data)) {
                switch (k) {
                    case 'o:item_set':
                        fd[k] = [{ 'o:id': v }];
                        break;
                    case 'o:resource_class':
                        p     = me.class.filter(prp => prp['o:term'] == v)[0];
                        fd[k] = { 'o:id': p['o:id'] };
                        break;
                    case 'o:resource_template':
                        p     = me.rts.filter(rt => rt['o:label'] == v)[0];
                        fd[k] = { 'o:id': p['o:id'] };
                        break;
                    case 'o:media':
                        if (!fd[k]) fd[k] = [];
                        fd[k].push({ 'o:ingester': 'url', 'ingest_url': v });
                        break;
                    case 'file':
                        fd['o:media'] = [{ 'o:ingester': 'upload', 'file_index': '1' }];
                        break;
                    case 'labels':
                        v.forEach(d => {
                            p = me.props.filter(prp => prp['o:label'] == d.p)[0];
                            if (!fd[p.term]) fd[p.term] = [];
                            fd[p.term].push(formatValue(p, d));
                        });
                        break;
                    default:
                        if (!fd[k]) fd[k] = [];
                        p = me.props.filter(prp => prp['o:term'] == k)[0];
                        if (Array.isArray(v))
                            fd[k] = v.map(val => formatValue(p, val));
                        else
                            fd[k].push(formatValue(p, v));
                        break;
                }
            }
            return fd;
        }

        function formatValue(p, v) {
            if (typeof v === 'object' && v.rid)
                return { 'property_id': p['o:id'], 'value_resource_id': v.rid, 'type': 'resource' };
            else if (typeof v === 'object' && v.u)
                return { 'property_id': p['o:id'], '@id': v.u, 'o:label': v.l, 'type': 'uri' };
            else if (typeof v === 'object')
                return { 'property_id': p['o:id'], '@value': JSON.stringify(v), 'type': 'literal' };
            else
                return { 'property_id': p['o:id'], '@value': v, 'type': 'literal' };
        }


        // ──────────────────────────────────────────────
        // HTTP UTILS
        // ──────────────────────────────────────────────

        async function postData(url, data = {}, file) {
            let bodyData,
                options = {
                    method:         url.m,
                    mode:           'cors',
                    cache:          'no-cache',
                    credentials:    'same-origin',
                    referrerPolicy: 'no-referrer',
                };
            if (url.m == 'POST' || url.m == 'PUT' || url.m == 'PATCH') {
                if (file) {
                    bodyData = new FormData();
                    bodyData.append('data', JSON.stringify(data));
                    bodyData.append('file[1]', file);
                } else {
                    bodyData        = JSON.stringify(data);
                    options.headers = { 'Content-Type': 'application/json' };
                }
                options.body = bodyData;
            }
            const response = await fetch(url.u, options);
            return response.json();
        }

        function syncRequest(q) {
            const request = new XMLHttpRequest();
            request.open('GET', q, false);
            request.send(null);
            if (request.status === 200) {
                return JSON.parse(request.response);
            }
        }

        this.init();
    }
}
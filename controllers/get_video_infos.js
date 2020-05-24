'use strict'

const request = require('request');
const nodeCache = require('node-cache');
const getLink = require('../lib/getlink');

const CACHE = new nodeCache();

module.exports = async (req, res) => {

    const fileId = req.query.fileId || null;
    if(!fileId) return res.end('Vui long them query ?fileId={drive-id}');

    const loadCache = CACHE.get(fileId);
    if(loadCache) return res.json(loadCache);

    const datas = await getLink(fileId);
    if(!datas) return res.end('Get link that bai');
    
    const result = [];
    // var domain = req.protocol + '://' + req.get('host');
    const domain = 'http://eu.drive.cacher1.nightproxy.com';
    const cookie = new Buffer.from(JSON.stringify(datas.cookie)).toString('base64');
    
    const sources = datas.sources;
    for (let i = 0; i < sources.length; i++) {

        const label = sources[i].label;
        const urnEnc = new Buffer.from(sources[i].file).toString('base64');
        const file = domain+'/videoplayback?url='+urnEnc+'&cookie='+cookie;
        
        result.push({ file, label, type: 'mp4' });
    }

    CACHE.set(fileId, result, 60 * 60 * 6);// Cache 6h

    return res.json(result);
}

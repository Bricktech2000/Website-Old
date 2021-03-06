import _fs from 'fs';
const fs = _fs.promises;
import mime from 'mime-types';
import path from 'path';

class ServerError extends Error {
  constructor(err, code){
    super(err.message);
    this.name = 'ServerError: ' + err.name + '';
    this.code = code;
  }
}
class ClientError extends Error {
  constructor(err, code){
    super(err.message);
    this.name = 'ClientError: ' + err.name + '';
    this.code = code;
  }
}


var reUpdate = {
  log: () => console.log('reUpdate-server!'),
  utils: {},
  consts: {},
  //https://expressjs.com/en/guide/writing-middleware.html
  express: function(basePath, clientPath){
    this.clientPath = clientPath;
    this.basePath = basePath;
    return async function(req, res, next){
      var path2 = req.path;
      if(path2 == '/') path2 += '/../';
      //console.log('Requesting: ' + path2);

      var params = {
        req: req,
        res: res,
        path: path.dirname(path2),
      }
      try{
        params = { ...params, ...JSON.parse(req.query.params || '{}'), }
      }catch(e){
        console.warn('Warning:    malformed JSON: ', req.query.params);
      }
      var incl;
      try{
        //https://stackoverflow.com/questions/14166898/node-js-with-express-how-to-remove-the-query-string-from-the-url
        incl = await internal.include('/client/', decodeURIComponent(path2), params);
      }catch(e){
        return internal.endError(e, res);
      }
      res.setHeader(
        'Content-Type', incl.fileInfo.mimeType + '; ' + 
        'charset=' + incl.fileInfo.encoding
      );
      try{
        res.end(await internal.yield(incl, params));
      }catch(e){
        return internal.endError(e, res);
      }
    }
  },
}
reUpdate.utils.sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

var internal = {
  regexes: {
    server: /<<<([^]*?)>>>/g,
    client: /<<([^]*?)>>/g,
  },
  mimeTypes: {
    'text/html': code => `<code class="reUpdate" style="display: none;">${code}</code>`,
    'text/css': code => new ClientError(new TypeError('running client-side code inside css file'), '422'),
    'text/markdown': code => new ClientError(new TypeError('running client-side code inside markdown file'), '422'),
  },
  errFileInfo: {
    mimeType: 'text/html',
    encoding: true,
  },
  endError: function(e, res){
    var message = e.name + ': ' + e.message + '\n';
    if(e instanceof ServerError)
      res.status(e.code).end(message);
    else if(e instanceof ClientError)
      res.status(e.code).end(message);
    else
      res.status(503).end(message);
  },
  parse: async function(text = '', params = {}){
    //return text + '//reUpdate added this comment';
    var vars = {};
    async function exec(code){
      try{
        var ret = '';
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction
        var GeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;
        var gen = new GeneratorFunction(
          'include', 'utils', 'vars', 'consts', 'params', code //this.src
        ).bind(
          reUpdate, internal.include.bind(null, params.path),
          reUpdate.utils, vars, reUpdate.consts, params
        )();
        for await(var html of gen)
          ret += await internal.yield(html, params);
        return ret;
      }catch(e){
        throw new ServerError(e, '500');
      }
    }
    
    text = await replacePromise(text, internal.regexes.server, async (a, code) => await exec(code));

    //coming from include, which returns `internal.mimeTypes[...]`, to prevent client-side code in markdown / css files
    if(text.match(internal.regexes.client))
      if(params.func && params.func() instanceof Error) throw params.func();

    text = text.replace(internal.regexes.client, (a, code) => params.func(code));
    return text;
  },
  yield: async function(html, params){
    var html2 = html !== undefined ? html : '';
    var text = html2.text || html;
    var params2 = {
      ...(html2.params || {}),
      req: params.req,
      res: params.res,
      path: html2.path || params.path,
      func: html2.func || params.func,
    };
    try{
      if(html2.fileInfo && internal.mimeTypes[html2.fileInfo.mimeType])
        return await internal.parse(text, params2);
      else return text;
    }catch(e){
      return e.name + ': ' + e.message + '\n';
    }
  },
  include: async function(filePath1, filePath2, params){
    try{
      //https://stackoverflow.com/questions/17192150/node-js-get-folder-path-from-a-file
      var relPath = await internal.addIndexHTML(path.join(filePath1, filePath2));
    }catch(e){
      throw new ClientError(e, '404');
    }
    //https://nodejs.org/api/fs.html
    var exists, fileHandle;
    try{ fileHandle = await fs.open(path.join(reUpdate.basePath, relPath), 'r'); exists = true; }
    catch(e){ exists = false; }
    finally { if(fileHandle !== undefined) await fileHandle.close(); }
    
    if(relPath.endsWith('index.html') && !exists) relPath = 'index.html';
    var fullPath = path.join(reUpdate.basePath, relPath);
    //console.log('Including: ' + relPath);

    try{
      var f = internal.fileInfo(fullPath);
      var text = await fs.readFile(f.fullPath, {encoding: f.encoding});
      var mimeType = internal.mimeTypes[f.mimeType];
      return {text: text, path: path.dirname(relPath), params: params, fileInfo: f, func: mimeType};
    }catch(e){
      //return {text: 'Server' + e, path: '/', params: params, fileInfo: internal.errFileInfo, func: function(){return 'Server' + e}};
      throw new ClientError(e, '404');
    }
  },
  fileInfo(filePath){
    return {
      fullPath: filePath,
      mimeType: mime.lookup(filePath),
      encoding: mime.charset(mime.lookup(filePath)),
    };
  },
  async addIndexHTML(filePath){
    var fullPath = path.join(reUpdate.basePath, filePath);
    if((await fs.lstat(fullPath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    return filePath;
  }
}
reUpdate.internal = internal;
//https://stackoverflow.com/questions/33631041/javascript-async-await-in-replace
//cannot use this because all asyncFn's get executed at once in the beginning
//execution order will be wrong, causing all sorts of problems
async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}
//https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
async function replacePromise(str, regex, func){
  var regex2 = new RegExp(regex); //otherwise, lastIndex gets corrupted... the worst bug EVER
  var ret = '';
  var match;
  var i = 0;
  while((match = regex2.exec(str)) !== null) {
    ret += str.slice(i, match.index);
    var val = await func(...match);
    ret += val;
    i = regex2.lastIndex;
  }
  ret += str.slice(i);
  return ret;
};

export { reUpdate };
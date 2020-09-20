import { MiniML } from './MiniML Compiler.js'

var miniML = {
  compile: function(_src){
    var src = _src.text || _src;
    var ast = parse(src);
    var html = gen(ast);
    return {..._src, text: MiniML.MiniMLCompile(src)}; //_compile(code, 'miniML');
  },
};
var parse = function(src, stx = 'miniML'){
  var syntax = {
    miniML: /^(inlineCode|blockCode|[^])*/,
    inlineCode: /^\[code\]/,
    blockCode: /^\[\[code\]\]/,
    code: /(codeKeyword|codeOperator|miniML|[^])*/,
    codeKeyword: /^\b(if|then|else|end|while|break|continue|for|var|return|function|class|and|or|not)\b/,
    codeOperator: /^([\[\]\+\-\*\/=%\?\^\.:\(\)\/,]|&lt;|&gt;|<<|>>)/,
  }
  //https://stackoverflow.com/questions/39154255/converting-regexp-to-string-then-back-to-regexp
  var keys = ''; //syntax[stx].source;
  for(var key of Object.keys(syntax))
    //regex = regex.replace(new RegExp(stx, 'g'), '[^]{0, }')
    keys += key + '|';
  keys += '_';
  keys = new RegExp(keys, 'g');

  var syntax = syntax[stx].source.replace(keys, (match) => 'SPLIT' + match + 'SPLIT');
  var regexArr = syntax.split('SPLIT');
  //console.log(regexArr);
  /*return code.replace(syntax[stx], function(a){
    return a;
  });*/
  return src;
}
var gen = function(ast){
  return ast; //`<pre>${JSON.stringify(ast).replace(/\\n/g, '\\n\n')}</pre>`;
}
export { miniML }

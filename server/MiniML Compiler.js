//https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
var MiniML = {
  MiniMLCompile: function(markup){
    var str = 'MiniML 1.0'
    if(markup.substr(0, str.length) != 'MiniML 1.0') return '';
    else markup = markup.substr(str.length, markup.length - 1 - str.length);
    markup = markup.replace(/\r\n/g, '\n');
    markup = '\n' + markup.replace(/^\n*/, '');

    var html = parse([markup], false, true);
    //console.log(html);
    return html;

    function parse(markup, isCode, isRoot){
      //isRoot: wether we are on the root branch of the ast or not
      //set isRoot to true to allow <span> generation and to false to prevent it
      //span generation is used in the css to allow the animaiton of items
      var html = '';
      var lastChar = '';
      var br = (isRoot) ? '</span><br><span>' : '<br>';
      var regexes = [];
      if(isCode == true){
        regexes = regexes.concat([
          {find: /^ /, replace: (a) => `&nbsp;`},
          {find: /^'((.*?[^\\])|)'/, replace: (a, b) => `<div class="markup-code-value markup-inline">'${parse([b], false)}'</div>`},
          {find: /^"((.*?[^\\])|)"/, replace: (a, b) => `<div class="markup-code-value markup-inline">"${parse([b], false)}"</div>`},
          {find: /^\b(if|then|else|end|while|break|continue|for|var|return|function|class|and|or|not)\b/, replace: (a) => `<div class="markup-code-keyword markup-inline">${a}</div>`},
          {find: /^\b(int|char|bool|byte|void|unsigned|short|(std::.+?\b))\b/, replace: (a) => `<div class="markup-code-keyword markup-inline">${a}</div>`},
          {find: /^([\[\]\+\-\*\/=%\?\^\.:\(\)\/,]|&lt;|&gt;|<<|>>)/, replace: (a) => `<div class="markup-code-operator markup-inline">${a}</div>`},
          {find: /^\b(0x[0-9a-fA-F\.]+|[0-9\.]+)\b/, replace: (a) => `<div class="markup-code-value markup-inline">${a}</div>`},
          {find: /^(null|nullptr|true|false)/, replace: (a) => `<div class="markup-code-value markup-inline">${a}</div>`},
        ]);
        //console.log(regexes);
      }
      regexes = regexes.concat([
        {find: /^\\(\\|\[\[|\]\]|\[|\]|\{\{|\}\}|\{|\}|\/|\*)/, replace: (a, b) => `${b}`},
        {find: /^\n\/\/[^\n]*/, replace: (a) => ``},
        {find: /^((\n\t[^\n]*)+)/, replace: (a, b, c) => `<div class="markup-block">${parse([b.replace(/\n\t/g, '\n')], isCode)}</div>`},
        {find: /^\n\[\[([^]*?)\]\]/, replace: (a, c) => `<div class="markup-code-block">${parse([c.replace(/^\n([^\t])|\n$/, (a, b) => b == undefined ? '' : b)], true)}</div>`},
        //{find: /^\]\]/, replace: (a) => `</div>`},
        //{find: /^\{\{([^]*?([^\\]|\\\\))\}\}/, replace: (a, b, c) => `<img class="markup-object" src="${b}">`},
        {find: /^\{\{(([^\}]*?)(: |:: ))?([^\}]*?([^\}\\]|\\\\))\}\}/, replace: (a, b, b2, b3, d, e) => {
          var tags = {
            'undefined': ['<img class="markup-object" src="', '">'],
            'img: ': ['<img class="markup-object" src="', '">'],
            'img:: ': ['<img class="markup-object min-image-ignore" src="', '">'],
            'video: ': ['<video class="markup-object" autoplay muted loop><source src="', '"></video>'],
            'video:: ': ['<video class="markup-object" controls><source src="', '"></video>'],
            'obj: ': ['<object class="markup-object" data="', '"></object>'],
          }
          //console.log(b); console.log(tags[b]);
          var tag = tags[b]; var src = d;
          if(!tag) return '';
          else return `${tag[0]}${src}${tag[1]}`;
        }},
        {find: /^\{([^\}]*?):(:?) ([^\}]*?([^\}\\]|\\\\))\}/, replace: (a, b, c, d, e) => `<a class="markup-link markup-inline" target="${c == ':' ? '_blank' : '_self'}" href="${d}">${parse([b], false)}</a>`},
        //{find: /^\{([^]*?): ([^]*?([^\\]|\\\\))\}/, replace: (a, b, c, d) => `<a class="markup-link markup-inline" target="_self" href="${c}">${parse([b])}</a>`},
        {find: /^\n\"\"([^]*?([^\\]|\\\\))\"\"/, replace: (a, b) => `${br}<div class="markup-quote">${parse([b], false)}</div>`},
        {find: /^\n\*([^\n]*)/, replace: (a, b) => `<ul><li class="">${parse([b], isCode)}</li></ul>`},
        {find: /^\n# ?([^\n]*)/, replace: (a, b) => `<a name="${b}" class="markup-anchor markup-inline"></a>`},
        {find: /^([^\n]*)\n=+\n/, replace: (a, b) => `<div class="markup-h1">${parse([b], isCode)}</div>${br}`},
        {find: /^([^\n]*)\n-+\n/, replace: (a, b) => `<div class="markup-h2">${parse([b], isCode)}</div>${br}`},
        {find: /^\/([^\n]*?([^\\\n]|\\\\))\//, replace: (a, c) => `<div class="markup-italic markup-inline">${parse([c], isCode)}</div>`},
        {find: /^\*([^\n]*?([^\\\n]|\\\\))\*/, replace: (a, c) => `<div class="markup-bold   markup-inline">${parse([c], isCode)}</div>`},
        {find: /^\[([^\n]*?([^\\\n]|\\\\))\]/, replace: (a, c) => `<div class="markup-code   markup-inline">${parse([c], true)}</div>`},
        {find: /^\n/, replace: (a) => `${br}`},
        //{find: /^ /, replace: (a) => '&nbsp;'},
        {find: /^[^]/, replace: (a) => a},
      ]);

      var match = true;
      while(match){
        match = false;
        for(var regex of regexes){
          //console.log(markup[0]);
          //console.log(html);
          match = regex.find.test(markup[0]);
          markup[0] = markup[0].replace(regex.find, function(){
            html += regex.replace.apply(null, arguments);
            lastChar = html[html.length - 1];
            return '';
          });
          if(match) break;
        }
      }
      if(isRoot) return '<span>' + html + '</span>';
      return html;
    }

    function escapeHTML(unsafe){
      return unsafe
        /*.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");*/
        //.replace(/ /g, "&nbsp;");
    }
  }
}
export { MiniML };

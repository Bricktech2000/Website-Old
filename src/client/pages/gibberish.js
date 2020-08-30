var gibberish = ''

for(var i = 0; i < 5; i++){
  n = Math.floor(Math.random() * 2)
  chr = ''
  if(n == 0) chr = 65 + Math.floor(Math.random() * 26)
  if(n == 1) chr = 48 + Math.floor(Math.random() * 10)
  gibberish += String.fromCharCode(chr)
}
var folder = './';
var fso = new ActiveXObject('Scripting.FileSystemObject')
fso.CopyFolder('./' + folder + 'TEMPL', './' + folder + gibberish)

WScript.echo(gibberish)
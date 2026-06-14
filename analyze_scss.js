const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const frontendDir = path.join(process.cwd(), 'parkmatch-frontend', 'src');

let filesOver300 = [];
let deepNesting = [];
let allSelectors = [];

walkDir(frontendDir, (filePath) => {
  if (!filePath.endsWith('.scss')) return;
  const relativePath = path.relative(frontendDir, filePath);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  if (lines.length > 300) {
    filesOver300.push({ file: relativePath, lines: lines.length });
  }

  let stack = [];
  
  lines.forEach((line, i) => {
    let clean = line.trim();
    if (clean.startsWith('//') || clean.startsWith('/*')) return;
    
    if (clean.includes('{')) {
       let sel = clean.split('{')[0].trim();
       if (sel && !sel.startsWith('@')) {
          stack.push(sel);
          allSelectors.push(stack.join(' ')); 
          
          if (stack.length > 4) {
             deepNesting.push({ file: relativePath, line: i+1, level: stack.length, selector: stack.join(' > ') });
          }
       } else if (sel.startsWith('@media')) {
          stack.push('@media');
       } else {
          stack.push('BLOCK');
       }
    }
    
    // Naive block closing
    let closeCount = (clean.match(/\}/g) || []).length;
    for(let j=0; j<closeCount; j++) {
        if(stack.length > 0) stack.pop();
    }
  });
});

console.log('--- Archivos > 300 lineas ---');
filesOver300.sort((a,b) => b.lines - a.lines).forEach(f => console.log(f.file + ': ' + f.lines));

console.log('\n--- Anidamientos > 4 niveles ---');
deepNesting.sort((a,b) => b.level - a.level).slice(0, 15).forEach(n => console.log(n.file + ':' + n.line + ' (Nivel ' + n.level + ') ' + n.selector));

console.log('\n--- Top 10 Selectores Mas Largos (Aprox) ---');
let uniqueSelectors = [...new Set(allSelectors)];
uniqueSelectors.sort((a,b) => b.length - a.length).slice(0, 10).forEach(s => console.log(s));

import fs from 'fs';
import path from 'path';

const pagesDir = path.resolve(process.cwd(), 'src/pages');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ищем имя функции компонента (первая capitalized строка после export function)
  const match = content.match(/export\s+function\s+(\w+)/);
  
  if (!match) return;
  
  const componentName = match[1];
  
  // Проверяем, есть ли уже export default
  if (content.includes(`export default ${componentName}`)) return;
  
  // Добавляем export default в конец файла
  content += `\n\nexport default ${componentName};`;
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed default export for: ${componentName} in ${filePath}`);
}

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.jsx') || file.endsWith('.js')) {
    processFile(path.join(pagesDir, file));
  }
});

console.log('\n✨ Done! Restart server.');

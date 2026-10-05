// force-default-export.mjs
import fs from 'fs';
import path from 'path';

const uiDir = path.resolve(process.cwd(), 'src/components/ui');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Ищем объявления функций/констант компонентов
    // Пример: export function Button(...) OR const Button = ...
    const componentRegex = /(?:export\s+)?(?:function|const)\s+(\w+)\s*(?:\(|=)/g;

    let matches = [...content.matchAll(componentRegex)];
    if (matches.length === 0) return;

    let changed = false;

    for (const match of matches) {
        const componentName = match[1];

        // Проверяем, есть ли уже export default для этого имени
        // Ищем строку вида: export default ComponentName;
        const hasDefaultExport = new RegExp(`export\\s+default\\s+${componentName}\\s*;`).test(content);

        if (!hasDefaultExport) {
            // Добавляем export default в конец файла
            content += `\n\nexport default ${componentName};`;
            changed = true;
            console.log(`➕ Added default export for: ${componentName} in ${filePath}`);
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            continue; // Рекурсию внутрь папок не делаем, только уровень ui
        } else if (file.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

console.log('🚀 Forcing DEFAULT exports in all UI components...\n');
walkDir(uiDir);
console.log('\n✨ Done! Restart server now.');
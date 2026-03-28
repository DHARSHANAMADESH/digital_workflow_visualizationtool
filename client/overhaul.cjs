import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('c:/Users/dhars/OneDrive/Desktop/PBL/client/src', function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // 1. Upgrade cards: bg-white... Ensure rounded-xl, border-gray-200, shadow-sm/md
        content = content.replace(/className=(['"`])([^'"`]*bg-white[^'"`]*)\1/g, (match, quote, classes) => {
            let newClasses = classes;
            
            // Check if it's likely a container/card (has padding or height/width or shadow)
            if (newClasses.includes('p-') || newClasses.includes('shadow') || newClasses.includes('rounded-')) {
                // Ensure rounded-xl
                newClasses = newClasses.replace(/\brounded-(lg|2xl|3xl|\[.*?\])\b/g, 'rounded-xl');
                if (!newClasses.includes('rounded-xl') && !newClasses.includes('rounded-full')) {
                    newClasses += ' rounded-xl';
                }
                
                // Ensure border-gray-200
                if (!newClasses.includes('border-none')) {
                    if (!newClasses.includes('border')) {
                        newClasses += ' border border-gray-200';
                    } else if (!newClasses.includes('border-gray-')) {
                        newClasses = newClasses.replace(/\bborder\b/g, 'border border-gray-200');
                    }
                }
                
                // Ensure shadow-sm or shadow-md
                if (!newClasses.includes('shadow-')) {
                    newClasses += ' shadow-sm';
                }
            }
            
            // Clean up multiple spaces safely
            newClasses = newClasses.replace(/\s+/g, ' ').trim();
            return `className=${quote}${newClasses}${quote}`;
        });

        // 2. Headings Text Hierarchy: Boost Dark Text #1F2937 (Gray-800)
        content = content.replace(/className=(['"`])([^'"`]*text-gray-900[^'"`]*)\1/g, (match, quote, classes) => {
            return `className=${quote}${classes.replace(/\btext-gray-900\b/g, 'text-gray-800').trim()}${quote}`;
        });
        
        // 3. Subtext: Lighter Gray #6B7280 (Gray-500)
        // (Most things already use gray-500 or gray-400, I'll check common headings)

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${filePath}`);
        }
    }
});

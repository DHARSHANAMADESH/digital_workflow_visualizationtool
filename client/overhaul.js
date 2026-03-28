const fs = require('fs');
const path = require('path');

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

        // 1. Upgrade cards: bg-white... shadow-sm -> shadow-md hover:shadow-lg border-none
        content = content.replace(/className=(['`"])([^'"`]*bg-white[^'"`]*)\1/g, (match, quote, classes) => {
            let newClasses = classes;
            
            // Enforce shadow elevation and interaction on actual cards (if they had shadow-sm or shadow to begin with)
            if (newClasses.includes('shadow-sm') || newClasses.includes('shadow ')) {
                newClasses = newClasses.replace(/\bshadow-sm\b/g, 'shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1');
                
                // Remove borders for a cleaner look
                newClasses = newClasses.replace(/\bborder\b/g, '');
                newClasses = newClasses.replace(/\bborder-[a-z]+-\d+\b/g, '');
                
                // Set consistent border radius
                newClasses = newClasses.replace(/\brounded-(lg|2xl|3xl|\[.*?\])\b/g, 'rounded-xl');
                if (!newClasses.includes('rounded-xl') && !newClasses.includes('rounded-full')) {
                    newClasses += ' rounded-xl';
                }
                
                // Increase padding
                newClasses = newClasses.replace(/\bp-(3|4|5|6)\b/g, 'p-8');
            }
            
            // Clean up multiple spaces safely
            newClasses = newClasses.replace(/\s+/g, ' ').trim();
            return `className=${quote}${newClasses}${quote}`;
        });

        // 2. Headings Text Hierarchy: Boost dark text
        content = content.replace(/className=(['`"])([^'"`]*text-gray-800[^'"`]*)\1/g, (match, quote, classes) => {
            return `className=${quote}${classes.replace(/\btext-gray-800\b/g, 'text-gray-900').trim()}${quote}`;
        });

        // 3. Buttons: ensure transition and hover on primary buttons
        content = content.replace(/className=(['`"])([^'"`]*bg-indigo-600[^'"`]*)\1/g, (match, quote, classes) => {
            let newClasses = classes;
            if (!newClasses.includes('transition')) newClasses += ' transition-all duration-300';
            if (!newClasses.includes('hover:bg-indigo-700')) newClasses = newClasses.replace(/\bhover:bg-indigo-\d+\b/g, 'hover:bg-indigo-700');
            if (!newClasses.includes('hover:shadow-md') && !newClasses.includes('shadow-md')) newClasses += ' shadow-md hover:shadow-lg hover:-translate-y-0.5';
            
            // Clean up multiple spaces
            newClasses = newClasses.replace(/\s+/g, ' ').trim();
            return `className=${quote}${newClasses}${quote}`;
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${filePath}`);
        }
    }
});

#!/usr/bin/env node

/**
 * Script to migrate console.log statements to debug utility
 * Scans the codebase and suggests replacements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to match console statements
const consolePatterns = [
  { pattern: /console\.log\(/g, replacement: 'debug.info('general', ' },
  { pattern: /console\.error\(/g, replacement: 'debug.error('general', ' },
  { pattern: /console\.warn\(/g, replacement: 'debug.warn('general', ' },
  { pattern: /console\.debug\(/g, replacement: 'debug.debug('general', ' },
];

// Categories based on file paths
const categoryMap = {
  'auth': ['auth', 'login', 'signup', 'middleware'],
  'api': ['api', 'route'],
  'database': ['database', 'migrate', 'health'],
  'ui': ['component', 'layout', 'page'],
  'general': ['lib', 'util', 'helper'],
};

function getCategoryFromPath(filePath) {
  const pathParts = filePath.toLowerCase().split('/');
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => pathParts.some(part => part.includes(keyword)))) {
      return category;
    }
  }
  
  return 'general';
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const suggestions = [];
    
    lines.forEach((line, index) => {
      consolePatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(line)) {
          const category = getCategoryFromPath(filePath);
          const lineNumber = index + 1;
          
          suggestions.push({
            file: filePath,
            line: lineNumber,
            original: line.trim(),
            suggested: line.replace(pattern, replacement),
            category: category,
          });
        }
      });
    });
    
    return suggestions;
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath) {
  const suggestions = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        suggestions.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
        suggestions.push(...scanFile(fullPath));
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return suggestions;
}

function generateReport(suggestions) {
  console.log('🔍 Console Log Migration Report\n');
  console.log(`Found ${suggestions.length} console statements to migrate:\n`);
  
  // Group by file
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.file]) {
      acc[suggestion.file] = [];
    }
    acc[suggestion.file].push(suggestion);
    return acc;
  }, {});
  
  Object.entries(groupedSuggestions).forEach(([file, fileSuggestions]) => {
    console.log(`📁 ${file}:`);
    fileSuggestions.forEach(suggestion => {
      console.log(`  Line ${suggestion.line}:`);
      console.log(`    Original: ${suggestion.original}`);
      console.log(`    Suggested: ${suggestion.suggested}`);
      console.log(`    Category: ${suggestion.category}`);
      console.log('');
    });
  });
  
  // Generate migration script
  console.log('📝 Migration Script:');
  console.log('```bash');
  console.log('# Add debug import to files that need it');
  console.log("grep -l 'console\\.' src/**/*.{ts,tsx} | xargs -I {} sh -c 'echo \"import { debug } from \\\"@/lib/debug\\\";\" >> {}'");
  console.log('```');
}

// Main execution
const projectRoot = path.join(__dirname, '..');
const srcPath = path.join(projectRoot, 'src');

console.log('🔍 Scanning codebase for console statements...\n');

const suggestions = scanDirectory(srcPath);
generateReport(suggestions);

// Save report to file
const reportPath = path.join(projectRoot, 'console-migration-report.json');
fs.writeFileSync(reportPath, JSON.stringify(suggestions, null, 2));
console.log(`\n📄 Report saved to: ${reportPath}`);

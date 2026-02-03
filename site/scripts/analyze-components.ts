import fs from 'fs';
import path from 'path';

const UI_COMPONENTS_DIR = path.join(__dirname, '../components/ui');
const SEARCH_DIRS = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        getAllFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzeComponentUsage() {
  const uiComponents = fs.readdirSync(UI_COMPONENTS_DIR)
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
    .map(file => file.replace(/\.(tsx|ts)$/, ''));

  const usageMap = new Map<string, string[]>();
  uiComponents.forEach(comp => usageMap.set(comp, []));

  SEARCH_DIRS.forEach(searchDir => {
    const files = getAllFiles(searchDir);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      uiComponents.forEach(component => {
        const patterns = [
          `from "@/components/ui/${component}"`,
          `from '@/components/ui/${component}'`,
        ];
        
        if (patterns.some(pattern => content.includes(pattern))) {
          usageMap.get(component)?.push(file);
        }
      });
    });
  });

  console.log('\n=== UI COMPONENT USAGE ANALYSIS ===\n');
  
  const used: string[] = [];
  const unused: string[] = [];
  
  usageMap.forEach((files, component) => {
    if (files.length > 0) {
      used.push(component);
      console.log(`✓ ${component} (used in ${files.length} file${files.length > 1 ? 's' : ''})`);
    } else {
      unused.push(component);
    }
  });
  
  console.log(`\n=== UNUSED COMPONENTS (${unused.length}) ===\n`);
  unused.forEach(comp => console.log(`✗ ${comp}`));
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total UI components: ${uiComponents.length}`);
  console.log(`Used: ${used.length}`);
  console.log(`Unused: ${unused.length}`);
  console.log(`\nUnused components can be safely deleted:\n`);
  unused.forEach(comp => {
    console.log(`  components/ui/${comp}.tsx`);
  });
}

analyzeComponentUsage();

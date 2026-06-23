const fs = require('fs');
const path = require('path');

const traverse = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) traverse(fullPath);
    else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes('../../utils/')) {
        content = content.replace(/\.\.\/\.\.\/utils\//g, '../../shared/');
        changed = true;
      }
      if (content.includes('UserRoleEnum')) {
        content = content.replace(/UserRoleEnum/g, 'UserRole');
        changed = true;
      }
      if (content.includes('async (req, res)')) {
        content = content.replace(/async \(req, res\)/g, 'async (req: any, res: any)');
        changed = true;
      }
      if (content.includes('async (prisma)')) {
        content = content.replace(/async \(prisma\)/g, 'async (prisma: any)');
        changed = true;
      }
      if (changed) fs.writeFileSync(fullPath, content);
    }
  });
};

traverse(path.join(__dirname, 'src/app/modules/table'));
traverse(path.join(__dirname, 'src/app/modules/menuItem'));
traverse(path.join(__dirname, 'src/app/modules/order'));
traverse(path.join(__dirname, 'src/app/modules/alert'));
traverse(path.join(__dirname, 'src/app/modules/dashboard'));

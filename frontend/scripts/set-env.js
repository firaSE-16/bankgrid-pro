const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:3000/api';

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
};
`;

const filePath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(filePath, content, 'utf8');
console.log(`environment.prod.ts written with API_URL=${apiUrl}`);

import * as fs from 'node:fs';

export const loadFile = (filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${filePath} not found`);
      return;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error(err);
  }
};

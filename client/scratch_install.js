import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log("Checking environment...");
  console.log("Node version:", process.version);
  console.log("Cwd:", process.cwd());
  
  console.log("Executing npm install...");
  const output = execSync('npm install --legacy-peer-deps --no-audit --no-fund', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log("SUCCESS!");
  console.log(output);
} catch (err) {
  console.error("FAIL!");
  console.error("Stdout:", err.stdout);
  console.error("Stderr:", err.stderr);
  console.error("Message:", err.message);
}

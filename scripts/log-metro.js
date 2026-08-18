const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', 'logs', 'metro.log');

// Ensure directory exists
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

console.log(`Streaming unbuffered live Metro logs to ${logFilePath}...`);

const proc = spawn('npx.cmd', ['react-native', 'start'], {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe']
});

proc.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);
  try {
    fs.appendFileSync(logFilePath, str);
  } catch (e) {}
});

proc.stderr.on('data', (data) => {
  const str = data.toString();
  process.stderr.write(str);
  try {
    fs.appendFileSync(logFilePath, str);
  } catch (e) {}
});

proc.on('close', (code) => {
  console.log(`Metro process exited with code ${code}`);
});

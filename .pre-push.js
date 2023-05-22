const { execSync } = require('child_process');

try {
  execSync('npm test');
  process.exit(0); // Allow the push if tests pass
} catch (error) {
  console.error('Tests failed. Aborting the push.');
  process.exit(1); // Prevent the push if tests fail
}

const path = require('path')

const config = {
  timeout: process.platform === 'win32' ? 180000 : 90000,
  workers: 1,
  outputDir: path.join('test-artifacts', 'playwright-output'),
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: path.join('test-artifacts', 'playwright-report') }]]
    : 'list',
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
}
module.exports = config

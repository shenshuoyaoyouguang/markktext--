const config = {
  timeout: 90000,
  workers: 1,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000
  }
}
module.exports = config

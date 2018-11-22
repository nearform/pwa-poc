// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false'
  },
  browserContext: 'default',
  server: {
    command: './node_modules/http-server/bin/http-server -c-1'
  }
}

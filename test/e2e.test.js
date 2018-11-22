describe('Snapshot', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:8080')
  })

  it('should be titled Snapshot', async () => {
    await page.waitForSelector('title')
    const title = await page.$eval('title', e => e.innerHTML)
    await expect(title).toEqual('Snapshot')
  })

  it('should have a video and a canvas tag', async () => {
    await page.waitForSelector('body')
    const mediaElements = await page.$x('//main/*[self::canvas or self::video]', e => e.outerHTML)
    await expect(mediaElements.length).toEqual(2)
  })

  it('should display 4 buttons', async () => {
    await page.waitForSelector('body')
    const buttons = await page.$x("//main//button[not(@style='display: none;')]", e => e.outerHTML)
    await expect(buttons.length).toEqual(4)
  })
})

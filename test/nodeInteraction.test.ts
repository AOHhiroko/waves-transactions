import * as utilityF from '../src/nodeInteraction'

const apiBase = 'https://testnodes.wavesnodes.com/'

describe('Node interaction utility functions', () => {
  it('Should get current height', async () => {
    return expect(utilityF.currentHeight(apiBase)).resolves.toBeGreaterThan(0)
  })

  it('Should wait 1 Block', async () => {
    await utilityF.waitNBlocks(1, {apiBase})
  }, 120000)

  it('Should fail to wait 2 blocks by timeout', async () => {
    await expect(utilityF.waitNBlocks(2, {apiBase, timeout:5000})).rejects.not.toBeFalsy()
  }, 120000)

  it('Should get balance', async () => {
    await expect(utilityF.balance('3MtXzccPrCAoKans9TD9sp3qoFHiajPA4Uu', apiBase)).resolves.not.toBeFalsy()
  }, 120000)

  it('Should get balanceDetails', async () => {
    await expect(utilityF.balanceDetails('3MtXzccPrCAoKans9TD9sp3qoFHiajPA4Uu', apiBase)).resolves.not.toBeFalsy()
  }, 120000)

  it('Should get accountData ', async () => {
    await expect(utilityF.accountData('3MtXzccPrCAoKans9TD9sp3qoFHiajPA4Uu', apiBase)).resolves.not.toBeFalsy()
  }, 120000)

  it('Should get accountData by key ', async () => {
    const data = await utilityF.accountDataByKey('3MtXzccPrCAoKans9TD9sp3qoFHiajPA4Uu','test', apiBase)
    expect(data).not.toBeFalsy()
  }, 120000)

  it('Should get accountData by key and return null on no data', async () => {
    const data = await utilityF.accountDataByKey('3MtXzccPrCAoKans9TD9sp3qoFHiajPA4Uu','test23', apiBase)
    expect(data).toBeNull()
  }, 120000)


})
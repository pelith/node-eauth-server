class Eauth {
  constructor(options) {
    this.OAUTH_CLIENT_ID = options.OAUTH_CLIENT_ID
    this.OAUTH_URL = options.OAUTH_URL
    this.OAUTH_REDIRECT_URI = options.OAUTH_REDIRECT_URI
    this.OAUTH_STATE = options.OAUTH_STATE

    this.AUTH_ROUTE = options.AUTH_ROUTE // domain + '/routeName'
    this.CONTRACT_AUTH_ROUTE = options.CONTRACT_AUTH_ROUTE // domain + '/routeName'
    this.REDIRECT_URI = options.REDIRECT_URI
    this.AUTH_RESPONSE = null
    this.PREFIX = options.PREFIX ? options.PREFIX : ''
  }

  oauthLogin() {
    window.location = `${this.OAUTH_URL}?client_id=${this.OAUTH_CLIENT_ID}&redirect_uri=${this.OAUTH_REDIRECT_URI}&response_type=code&state=${this.OAUTH_STATE}`
  }

  ethLogin(provider, callback = () => { window.location.reload() }) {
    localStorage.clear()
    const web3 = new Web3(provider)
    web3.currentProvider.enable()
      .then((accounts) => {
        this.authStart(web3, accounts[0], callback)
      })
  }

  authStart(_web3, account, callback) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(account)) {
      return alert('Wallet not detected.')
    }

    return fetch(this.AUTH_ROUTE + '/' + account, { method: 'get' }).then(res => {
      return res.text()
    })
      .then(res => {
        const resJson = JSON.parse(res)
        const method = 'eth_signTypedData_v4'
        const { banner, token } = resJson.message

        const structure = {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            Eauth: [
              { name: 'banner', type: 'string' },
              { name: 'message', type: 'string' },
              { name: 'token', type: 'string' },
            ],
          },
          primaryType: 'Eauth',
          domain: {
            name: 'Eauth',
            version: '1',
            chainId: 1,
            verifyingContract: '0x0000000000000000000000000000000000000000',
          },
          message: {
            banner: banner,
            message: this.PREFIX,
            token: token,
          },
        }

        const params = [account, JSON.stringify(structure)]
        _web3.currentProvider.sendAsync({
          id: 1,
          method,
          params,
        }, (err, result) => {
          if (err) {
            alert(err.message)
            return console.error(err)
          }
          if (result.error) return console.error(result.error)

          const signature = result.result

          if (token !== null && signature !== null) {
            return fetch(this.AUTH_ROUTE + '/' + token + '/' + signature, { method: 'post' })
              .then((res) => { return res.text() })
              .then((res) => {
                this.AUTH_RESPONSE = res
                callback()
              })
              .catch((err) => { callback() })
          }
          return console.error('Missing arguments')
        })
      })
  }

  contractEthLogin(provider, contractAddr, callback = () => { window.location.reload() }) {
    const web3 = new Web3(provider)
    web3.currentProvider.enable()
      .then((accounts) => {
        this.walletValidation(web3, contractAddr, accounts[0], callback)
      })
  }

  walletValidation(_web3, contractAddr, account, callback) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(contractAddr)) {
      return alert('Not a valid address.')
    }

    return fetch(this.CONTRACT_AUTH_ROUTE + '/' + contractAddr, { headers: { 'user-target': _web3.currentProvider.isWalletConnect ? 'WalletConnect' : '' }, method: 'get' }).then(res => {
      return res.text()
    })
      .then(res => {
        let data = ''
        let message = null
        let method = 'eth_signTypedData'

        try {
          res = JSON.parse(res)
          message = res[1].value
          data = res
          data[1].value = this.PREFIX + res[1].value
        } catch (e) {
          message = res
          const prefixedRes = this.PREFIX + res
          method = 'personal_sign'
          data = WalletConnectUtils.convertUtf8ToHex(prefixedRes)
        }

        if (!/^[a-fA-F0-9]+$/.test(message))
          return alert('Something went wrong, please try again later.')

        const params = [data, account]
        _web3.currentProvider.sendAsync({
          id: 1,
          method,
          params,
        }, (err, result) => {
          if (err) {
            alert(err.message)
            return console.error(err)
          }
          if (result.error) return console.error(result.error)

          const signature = result.result

          if (message !== null && signature !== null) {
            return fetch(this.CONTRACT_AUTH_ROUTE + '/' + message + '/' + signature, { headers: { 'user-target': _web3.currentProvider.isWalletConnect ? 'WalletConnect' : '' }, method: 'post' })
              .then((res) => { return res.text() })
              .then((res) => {
                this.AUTH_RESPONSE = res
                callback()
              })
              .catch((err) => { callback() })
          }
          return console.error('Missing arguments')
        })
      })
  }

  getMessage(contractAddr) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(contractAddr)) {
      return alert('Not a valid address.')
    }

    return fetch(this.CONTRACT_AUTH_ROUTE + '/' + contractAddr, { method: 'get' }).then(res => {
      return res.text()
    })
      .then(message => {
        if (!/^[a-fA-F0-9]+$/.test(message))
          return alert('Something went wrong, please try again later.')

        return this.PREFIX + message
      })
  }

  checkIsValid(message, signature, callback) {
    const token = message.replace(this.PREFIX, '')
    return fetch(this.CONTRACT_AUTH_ROUTE + '/' + token + '/' + signature, { method: 'post' }).then(res => {
      return res.text()
    })
      .then((res) => {
        this.AUTH_RESPONSE = res
        callback()
      })
      .catch((err) => { callback() })
  }
}

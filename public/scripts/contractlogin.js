const Web3Modal = window.Web3Modal.default
const WalletConnectProvider = window.WalletConnectProvider.default
const Eauth = window.Eauth.default
const {
  Fortmatic, Torus, Authereum, Portis,
} = window

class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('#fulladdress').innerHTML
    this.eauthButton = document.querySelector('.button--eauth')
    this.customizedButton = document.querySelector('.button--customized')

    this.eauth = new Eauth({
      CONTRACT_AUTH_ROUTE: '/auth/contract',
      PREFIX: prefix,
    })

    this.eauthButton.addEventListener('click', this.onConnect.bind(this))
    this.customizedButton.addEventListener('click', this.useCustomizedSign.bind(this))
    this.init()
  }

  init() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '3c15ed5027f541278717d536db299ef4',
        },
      },
      torus: {
        package: Torus,
      },
      authereum: {
        package: Authereum,
      },
      fortmatic: {
        package: Fortmatic,
        options: {
          key: 'pk_live_CC75CEEE7D7E8630',
        },
      },
      portis: {
        package: Portis,
        options: {
          id: 'f36fb347-a067-42a8-82b7-ca77cf8b7277',
        },
      },
    }
  
    this.web3Modal = new Web3Modal({
      cacheProvider: false, // optional
      providerOptions, // required
      disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    })
  
    // console.log('Web3Modal instance is', this.web3Modal)
  }

  authorise() {
    const url = new URL(document.URL)
    let location = '/'
    const c = url.searchParams.get('url')
    const q = url.searchParams.get('socket_id')
    const s = url.searchParams.get('session_id')
    if (c) {
      location = c
    } else if (q && s) {
      location = '/api/qrcode?socket_id=' + q + '&session_id=' + s
    }

    if (this.eauth.ERROR) {
      alert(JSON.stringify(this.eauth.ERROR))
      window.location.reload()
    } else {
      window.location = location
    }
  }

  async onConnect() {
    // console.log('Opening a dialog', this.web3Modal)
    try {
      this.provider = await this.web3Modal.connect()
      this.eauth.contractEthLogin(this.provider, this.contractWallet, this.authorise.bind(this))
    } catch (e) {
      // console.log('Could not get a wallet connection', e)
    }
  }

  useCustomizedSign() {
    const url = new URL(document.URL)
    const c = url.searchParams.get('url')
    let location = `/customizedsign?wallet=${this.contractWallet}`
    if (c) {
      location = `/customizedsign?url=${encodeURIComponent(c)}&wallet=${this.contractWallet}`
    }
    window.location = location
  }
}

window.onload = () => {
  window.app = new LoginApp()
}

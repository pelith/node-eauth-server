const domain = ''
let accessToken = null
const fm = new Fortmatic('pk_live_CC75CEEE7D7E8630')
let fortmaticWeb3 = null

function authStart(_web3) {
  return $.get(domain + '/auth/' + _web3.eth.accounts[0], (res) => {
    let data = ''
    let message = ''

    if ($('#method')[0].value === 'personal_sign') {
      data = '0x' + Array.from(res).map(x => x.charCodeAt(0).toString(16)).join('')
      message = res
    } else if ($('#method')[0].value === 'eth_signTypedData') {
      data = res
      message = res[1].value
    }

    // Call metamask to sign
    const from = _web3.eth.accounts[0]
    const params = [data, from]
    const method = $('#method')[0].value
    _web3.currentProvider.sendAsync({
      id: 1,
      method,
      params,
    }, async (err, result) => {
      if (err) return console.error(err)
      if (result.error) return console.error(result.error)
      
      const signature = result.result

      if (message !== null && signature !== null) {
        $.post(domain + '/auth/' + message + '/' + signature, (res) => {
          if (res.success) {
            accessToken = res.token
            console.log('Eauth Success')
            console.log('Your JWT token: ' + accessToken)
            const url = new URL(document.URL)

            let location = '/'
            const c = url.searchParams.get('url')
            const q = url.searchParams.get('socket_id')
            const s = url.searchParams.get('session_id')
            if (c) {
              location = c
            } else if (q && s) {
              location = '/qrcode?socket_id=' + q + '&session_id=' + s
            }
            window.location = location
          } else {
            console.log('Eauth Failed')
          }
        })
      }
      return true
    })
  })
}

$(() => {
  fortmaticWeb3 = new Web3(fm.getProvider())
  $('.eth-signin')[0].disabled = false
  $('.fortmatic-signin')[0].disabled = false
})

$('.eth-signin').on('click', () => {
  // Detect metamask
  if (typeof web3 !== 'undefined') {
    console.log('web3 is detected.')
  } else {
    return alert('No web3 detected. Please install metamask')
  }

  if (web3.currentProvider.enable) {
    web3.currentProvider.enable()
    .then(() => {
      if (web3.currentProvider.isMetaMask === true && web3.eth.accounts[0] === undefined) {
        return alert('Please login metamask first.')
      }
      authStart(web3)
    })
  } else if (web3.eth.accounts[0]) {
    authStart(web3)
  }
})

$('.fortmatic-signin').on('click', () => {
  fortmaticWeb3.currentProvider.enable()
  .then(() => {
    authStart(fortmaticWeb3)
  })
})

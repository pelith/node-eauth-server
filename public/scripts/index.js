let domain = "";
let confirmcode = null;
let signature = null;
let access_token = null;
let fm = new Fortmatic('pk_live_CC75CEEE7D7E8630');
let fortmatic_web3 = null

function authStart(_web3) {
  return $.get(domain + '/auth/' + _web3.eth.accounts[0], (res) => {
    data = ''
    meassage = ''
    if ( $("#method")[0].value === 'personal_sign' ) {
      data = "0x"+Array.from(res).map(x=>x.charCodeAt(0).toString(16)).join('');
      message = res
    }
    else if ( $("#method")[0].value === 'eth_signTypedData' ) {
      data = res
      message = res[1].value
    }

    // Call metamask to sign
    const from = _web3.eth.accounts[0];
    const params = [data, from];
    const method = $("#method")[0].value;
    _web3.currentProvider.sendAsync({
      id:1,
      method,
      params
    }, async (err, result) => {
      if (err) {
        return console.error(err);
      }
      if (result.error) {
        return console.error(result.error);
      }
      signature = result.result;

      if (message !== null && signature !== null){
        $.post(domain + '/auth/' + message + '/' + signature, (res) => {
          if (res.success) {
            access_token = res.token;
            console.log("Eauth Success")
            console.log("Your JWT token: " + access_token)
            var url_string = document.URL; //window.location.href
            var url = new URL(url_string);

            var location = '/'
            var c = url.searchParams.get("url");
            var q = url.searchParams.get("socket_id");
            var s = url.searchParams.get("session_id");
            if (c)
              location = c;
            else if (q && s)
              location = '/qrcode?socket_id='+q+'&session_id='+s
            window.location = location
          } else {
            console.log("Eauth Failed")
          }
        });
      }
    });
  }).fail(function() {
    document.getElementById("test").innerText='test1'
    // alert('woops'); // or whatever
  });
}

$(()=>{
  fortmatic_web3 = new Web3(fm.getProvider());
});

$('.eth-signin').on('click', function () {
  // Detect metamask
  if (typeof web3 !== 'undefined') {
    console.log("web3 is detected.");
  } else {
    return alert("No web3 detected. Please install metamask");
  }
  
  if ( web3.currentProvider.isMetaMask === true && web3.eth.accounts[0] === undefined)
    return alert("Please login metamask first.");

  if (web3.currentProvider.enable)
    web3.currentProvider.enable()
    .then(function() {
      authStart(web3);
    });
  else if (web3.eth.accounts[0]) {
    authStart(web3);
  }
});

$('.fortmatic-signin').on('click', function () {
  fortmatic_web3.currentProvider.enable()
  .then(function() {
    authStart(fortmatic_web3);
  });
});


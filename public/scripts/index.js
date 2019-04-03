let domain = "";
let confirmcode = null;
let signature = null;
let access_token = null;

(function () { var script = document.createElement('script'); script.src="//cdn.jsdelivr.net/npm/eruda"; document.body.appendChild(script); script.onload = function () { eruda.init() } })();
$('.eth-signin').on('click', function () {
  // Detect metamask
  if (typeof web3 !== 'undefined') {
    console.log("web3 is detected.");
    if ( web3.currentProvider.isMetaMask === true)
      if (web3.eth.accounts[0] === undefined && !web3.currentProvider.enable)
        return alert("Please login metamask first.");
  } else {
    return alert("No web3 detected. Please install metamask");
  }

  function authStart() {
    return $.get(domain + '/auth/' + web3.eth.accounts[0], (res) => {
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
      const from = web3.eth.accounts[0];
      const params = [data, from];
      const method = $("#method")[0].value;
      web3.currentProvider.sendAsync({
        method,
        params,
        from
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
              if (c)
                location = c;

              console.log(location)
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

  if (web3.currentProvider.enable)
    web3.currentProvider.enable()
    .then(function() {
      authStart();
    });
  else if (web3.eth.accounts[0]) {
    authStart();
  }
});
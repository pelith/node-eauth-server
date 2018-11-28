let domain = ""; 
let confirmcode = null;
let signature = null;
let access_token = null;

$('.eth-signin').on('click', function () {
  // Detect metamask
  if (typeof web3 !== 'undefined') {
    console.log("web3 is detected.");
    if ( web3.currentProvider.isMetaMask === true)
      if (web3.eth.accounts[0] === undefined)
        return alert("Please login metamask first.");
  } else {
    return alert("No web3 detected. Please install metamask");
  }

  if ( web3.currentProvider.enable ){
   return web3.currentProvider.enable();
  }


  if (web3.eth.accounts[0]) {
    $.get(domain + '/auth/' + web3.eth.accounts[0], (res) => {
      confirmcode = res;

      // Call metamask to sign
      const from = web3.eth.accounts[0];
      const params = [confirmcode, from];
      const method = 'eth_signTypedData';
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
        if (confirmcode !== null && signature !== null){
          $.post(domain + '/auth/' + confirmcode[1].value + '/' + signature, (res) => {
            if (res.success) {
              access_token = res.token;
              console.log("EthAuth Success")
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
              console.log("EthAuth Failed")
            }
          });
        }
      });
    });
  }
});
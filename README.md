# Eauth Server

An OAuth2-compatiable service based on Ethereum credentials to authenticate users on website.

## Demo

Eauth - Decentralized Identity Authentication on Ethereum https://www.youtube.com/watch?v=Rbo5AzYk79s

Gitlab OAuth with Eauth: https://gitlab-demo.pelith.com

Usages: [eauth-examples](https://github.com/pelith/eauth-examples)

## Installing

Installing dependencies: You can use `npm i --no-optional` instead of `npm i` to speed up this step if you're not using ENS and web3.

1. Copy a configuration:
   ```bash
   cp config/config.json.example config/config.json
   ln -s  ../../../config/config.json components/oauth/config/config.json
   ```

   You can also execute `cp components/oauth/config/config.json.example components/oauth/config/config.json` and fill in database configs instead of linking `config/config.json` to `components/oauth/config/config.json` if you want to use another database for OAuth.

2. Configure your `config/config.json` accordingly. Edit the following entries:
   ```js
   {
     "development": {
       // app secret
       "secret": "YOUR_SECRET_HERE",
       // your brand name
       "banner": "YOUR_BANNER_HERE",
       // use the connection path from this environment variable, if specified
       "use_env_variable": "CONNECTION_PATH",
       // rpc for ENS and contract wallets
       "rpcURL": "https://rinkeby.infura.io/",
       // prefix showing with token
       "messagePrefix": "This is a prefix example\n\ntoken:\n----------\n",
       // component configs
       "components": {
          "ui": true,
          // Fortmatic ui component
          "fortmatic": true,
          // OAuth component
          "oauth": true,
          // isValidSignature feature for ERC-1271
          "contract": true,
          // ENS feature for OAuth and contract wallet
          "ens": true,
          // qrcode for remote login
          "qrcode": true
       },
       // session lifetime for OAuth
       "sessionMinutes": 1,
       /* or fill in database-related configs... */
     },
     "test": { /* ... */ }
     "production": { /* ... */ }
   }
   ```

   Note that you may need to install additional packages to operate on databases.

   ### Fortmatic

   Let users access blockchain apps from anywhere 💻📱 - without forcing them to wrestle with browser extensions, wallets, or seed phrases, see more at [fortmatic.com](fortmatic.com)

## Usage
### Quickstart

Start the server: `node index.js`. \
Test it on `http://localhost:8080/`.

### Using PM2

```bash
npm i -g pm2
cp pm2.config.js.example pm2.config.js
pm2 start pm2.config.js --env development // development mode on port 8080
pm2 start pm2.config.js --env production // production mode on port 80
```

### Docker

```bash
docker build -t pelith/node-eauth-server .
docker run --net=host -d pelith/node-eauth-server
```

### Setup OAuth Clients

  1. setup your `client_id, client_secret, redirect_uri` in components/seeders/20190725062038-oauth_clients.js
  2. seeding them with `npx sequelize db:seed:all`


## Tutorial

This service requires a wallet which supports `eth_signTypedData`, `personal_sign` or customized method for your contract wallet. For first-time visitors, the simplest setup is to include a MetaMask download badge before proceeding to the authentication page.

Browser Extensions (MetaMask) | Mobile Wallets (imToken / Trustwallet) | Other SDK (Fortmatic)
:-------------------------:|:-------------------------:|:-------------------------:
[<img alt="MetaMask badge" src="https://raw.githubusercontent.com/MetaMask/faq/master/images/download-metamask.png" height="100">](https://metamask.io)  |  [<img alt="MetaMask badge" src="https://token.im/img/appLogo.97de1461.svg" height="100">](https://token.im/download?locale=en-us) [<img alt="MetaMask badge" src="https://avatars0.githubusercontent.com/u/32179889?s=100&v=4" height="100">](https://trustwallet.com/) | [<img alt="MetaMask badge" src="https://avatars1.githubusercontent.com/u/38988377?s=90&v=4" height="100">](https://fortmatic.com/)

1. In the page `/`, you can decide to login with your Ethereum wallet or contract wallet which implements [ERC-1271](https://github.com/ethereum/EIPs/issues/1271).

![Main Page](https://user-images.githubusercontent.com/16600750/64110015-7dac8400-cd70-11e9-83ab-412ad8b17a59.png)

2. For Ethereum wallet, there is no email/id/password input fields. Instead, **you gotta sign in with your Ethereum credentials**. If your MetaMask is locked or in [the privacy mode](https://medium.com/metamask/introducing-privacy-mode-42549d4870fa), it would prompt you to unlock. You can also scan the QR Code to open the URL with your mobile wallet (imToken or Trustwallet), then sign the message for authentication through socket.

![Login with Ethereum](https://user-images.githubusercontent.com/16600750/64110510-e8aa8a80-cd71-11e9-9f5a-8bd3195b95e8.png)

3. In your wallet, you should check the banner and the prefix of message, usually the brand name of a site. The challenge message should contain a token string. If it's the correct info from the site you are about to login, click "Sign" or "Confirm" to proceed.

![Signing Process](https://user-images.githubusercontent.com/16600750/64104830-90b95700-cd64-11e9-8f0f-6d642692b72b.jpeg)

3. Next, your wallet address is shown and you are asked for authorization. **This step is to bind that wallet address to your account.** Click "Authorize" to proceed, or click "Use another account" if this is not the account you intend to use.

![Authorise](https://user-images.githubusercontent.com/16600750/64116418-d3d5f300-cd81-11e9-9de6-fb81bfb437df.png)

4. If everything is fine, you will be redirected back to the original site. Clicking "Logout" will log you out and reset the session.

5. For contract wallet, you'll have to input your contract address (ENS is also acceptable if the feature is enabled), Click "Use Contract" and choose your way to verify.

![Contract Input](https://user-images.githubusercontent.com/16600750/64110524-f19b5c00-cd71-11e9-9705-39fe7ee70084.png)

6. The `eth_signTypedData` and `personal_sign` will both works if you implement the [ERC-1271](https://github.com/ethereum/EIPs/issues/1271) like [this](https://github.com/artistic709/solidity_contracts/blob/master/personalwalletfactory.sol#L106). The signing process will be the same as Ethereum login. However, if you're using customized signature for verification, click "Customized Sign".

![Contract](https://user-images.githubusercontent.com/16600750/64110536-f7913d00-cd71-11e9-9107-5d5ce93ca57b.png)

7. For Customized Sign, server will return the full message for signing and the hexed message after web3.sha3(message). Sign the message with your customized way and fill the signature below. Click "Verify Signature" to login with your contract wallet.

![Customized](https://user-images.githubusercontent.com/16600750/64110579-17286580-cd72-11e9-89d4-42bf5cfd4123.png)

## Discourse Integration

1. Install [discourse-eauth](https://github.com/pelith/discourse-eauth) plugin by following this [guide](https://meta.discourse.org/t/install-plugins-in-discourse/19157).

2. Enable the plugin at `/admin/site_settings/category/plugins`.
![Setup Plugin](https://user-images.githubusercontent.com/16600750/64149783-63c57c80-ce16-11e9-92f1-693eb0a70680.png)
![Configs](https://user-images.githubusercontent.com/16600750/64155221-e7d13180-ce21-11e9-9ae8-0644a81d85a0.png)

3. Set max username length up to 42. Remember to setup username change period if you're allowing users to edit their username instead of using the address they registered.
![username length](https://user-images.githubusercontent.com/16600750/64155052-9a54c480-ce21-11e9-92a7-fbe6e08befff.png)
![edit username](https://user-images.githubusercontent.com/16600750/64159073-26b6b580-ce29-11e9-80a8-abc1235ae46a.png)

4. [Setup OAuth client](https://github.com/pelith/node-eauth-server/tree/componentize#setup-oauth-clients) and use `http://your.domain/auth/eauthoauth2/callback` as your OAuth `redirect_uri`

5. Finally, enjoy!

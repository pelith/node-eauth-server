# ETH Auth Server

An OAuth-compatiable service based on Ethereum credentials to authenticate users on a website.

## Installing

After installing dependencies,

1. Move `config/config.json.example` to `config/config.json`:
   ```bash
   mv config/config.json.example config/config.json
   ln -s  ../../../config/config.json components/oauth/config/config.json
   ```

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
       /* or fill in database-related configs... */
     },
     "test": { /* ... */ }
     "production": { /* ... */ }
   }
   ```

   Note that you may need to install additional packages to operate on databases.

## Usage
### Server

Start the server: `node index.js`. \
Test it on `http://localhost:8080/`.

### Docker

```bash
docker build -t pelith/node-eth-auth-server .
docker run --net=host  -d pelith/node-eth-auth-server
```

## Testing

Users should have the [MetaMask extension](https://github.com/MetaMask/metamask-extension) or alternatives installed in order to use the service. For further information, click the MetaMask badge below.

[<img alt="MetaMask badge" src="https://github.com/MetaMask/faq/blob/master/images/download-metamask.png" width="400">](https://metamask.io)

1. In the demo page `/` is an ordinary login button. Think it as a way to sign in with Ethereum credentials. (You need to unlock your wallet on MetaMask prior to this step).

   ![signing process](https://user-images.githubusercontent.com/5269414/43250814-cbdc2832-90f0-11e8-8a75-71565fbb9e3d.png)

2. In MetaMask, you can check the banner, usually the brand name of a site, and a challenge string. If that is indeed the site you are about to login, click "Sign" to proceed.
3. Next, in the second page, where your wallet address is shown and you are asked for authorization. Think this step as a process to bind that wallet address to your account. Click "Authorise" to proceed, or click "Use another account" to switch between different wallets.
4. You will be redirected back to the original site. Click "Logout" will log you out and reset the session.

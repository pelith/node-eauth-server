# ETH Auth Server

A live demo to use MetaMask to authenticate users on a website, issuing JWT (JSON web tokens).

## Installing

After installing dependencies.

1. Move `config/config.json.example` to `config/config.json`:
  ```bash
  mv config/config.json.example config/config.json
  ln -s  ../../../config/config.json components/oauth/config/config.json
  ```

2. Configure your `config/config.json.example`, depending on the environment. Add the following entries:
  ```js
  {
    "development": {
      // app secret
      "secret": "YOUR_SECRET_HERE",
      "baner": "YOUR_BANER_HERE",
      // use the connection path from this environment variable, if specified
      "use_env_variable": "CONNECTION_PATH",
      /* ... */
    },
    "production": { /* ... */ }
  }
  ```

   Note that you may need to install additional packages to operate on databases.

## Usage
  ### Server
    Start the server: `node index.js`. Test it on `http://localhost:8080/`.

  ### Docker
    ```bash
    docker build -t pelith/node-eth-auth-server .
    docker run --net=host  -d pelith/node-eth-auth-server
    ```

## Testing

Users should have the [MetaMask extension](https://github.com/MetaMask/metamask-extension) or alternatives installed in order to use the service. For further information, click the MetaMask badge below.

[<img alt="MetaMask badge" src="https://github.com/MetaMask/faq/blob/master/images/download-metamask.png" width="400">](https://metamask.io)

1. The demo page `/` is an article hosted on M\*dium. Click the "Sign in" link on the upper-right side and select "Sign in with Ethereum". (You need to unlock your wallet on MetaMask prior to this step).

   ![signing process](https://user-images.githubusercontent.com/5269414/43250814-cbdc2832-90f0-11e8-8a75-71565fbb9e3d.png)

2. In MetaMask, click "Sign" to proceed. The JWT token is then displayed in the console.
3. When clicking the avatar, there will be a message showing your wallet address. Click "Sign out" to reset the session.
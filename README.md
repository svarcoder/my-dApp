# My dApp

This is a decentralized app with React.js frontend and CSS. There are wallet connect, show balance and nft details view function.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)

## Features

- Normal UI
- User Login
- Show Any Wallet Balance
- View NFT Details

## Getting Started

### Prerequisites

- Node.js (version 14.x or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/svarcoder/my-dApp.git
   cd my-dApp
   ```

2.Install dependencies:

```sh
npm install
# or
yarn install
```

3. Create a .env file in the root directory and add the following environment variables:

```sh
REACT_APP_PROJECT_ID=""
REACT_APP_ALCHYME_KEY=""
REACT_APP_WETH_ADDRESS=""
REACT_APP_USDC_ADDRESS=""
REACT_APP_USDT_ADDRESS=""
REACT_APP_ETHERSCAN_API_KEY=""
```

4. Start the development server:

```sh
   npm start
   # or
   yarn start
```

### Project Structure

```sh
├── public
│ └── ...
├── src
│ ├── services
│ ├── component
│ │   ├── HomePage.js
│ │   ├── HomeRoute.js
│ │   ├── Navbar.js
│ │   ├── NFTDetails.js
│ │   ├── PrivateRoute.js
│ │   ├── Spinner.js
│ │   ├── TokenBalance.js
│ │   ├── ValidationFn.js
│ │   └── WalletConnect.js
│ └── style
├── .env
├── .gitignore
├── README.md # Project documentation
└── package.json
```

### Scripts

test: Runs test for testcases.
build: Builds the application for production.
start: Starts the production server.
eject: Runs eject for eject.

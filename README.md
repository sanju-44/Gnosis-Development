# Gnosis-Development

## to use localhost ethereum node with mastercopy of gnosis safe (0nly if you are working with localhost)
This deploys the gnosis safe sore contracts into hardhat's localhost ethereum network (this localhsot ethereum network has to be running when under development)

    git clone https://github.com/gnosis/safe-contracts/
    cd safe-contracts
    git checkout v1.3.0-libs.0
    yarn add hardhat
    npx hardhat node

## working with gnosis safe deployed on public network (for sepolia or local)
    yarn install 

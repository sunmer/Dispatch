# Dispatch
A web3 based fundraiser platform which allows content creators to raise crypto for future projects.

Get the project up and running locally by:
## Front-end
* Then go to the `frontend` folder and run:
  * `npm install`
  * Then run `npm run dev` to get the front-end up and running
* For the serverless endpoints, go to the root folder, run `vercel dev`

## Contracts
* Edit the .env file in order to set the private key of the deployment wallet. Then run `npm deploy` which compiles the smart contracts and deploys them to the blockchain specified in the hardhat config file.

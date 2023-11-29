import { Magic } from 'magic-sdk';
import Settings from '../Settings';
import { OAuthExtension } from '@magic-ext/oauth';

import { userFundraiserContext } from '../contexts/FundraiserContext';


export function Signup() {

  const { currentChain } = userFundraiserContext();

  const customNodeOptions = {
    rpcUrl: currentChain.rpcUrls.default.http.toString(),
    chainId: currentChain.id
  }

  const magic = new Magic(Settings.API_KEY_MAGIC, {
    network: customNodeOptions,
    extensions: [new OAuthExtension()],
  });

  const signUp = async () => {
    try {
      await magic.oauth.loginWithRedirect({
        provider: 'twitter',
        redirectURI: Settings.WEB_URL + "/oauth/callback",
        scope: ['user:email']
      })
      //await magic.wallet.getProvider();
      //const accounts = await magic.wallet.connectWithUI();

      //console.log(accounts)
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div
        className="absolute top-0 w-full h-full bg-center bg-cover left-0"
        style={{
          backgroundImage: "linear-gradient(rgba(217, 38, 169, 0.2), rgba(59, 28, 49, 1)), url('https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=2165&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
        }}
      >
        <span style={{
          backgroundImage: "linear-gradient(rgba(0, 38, 169, 0.2), rgba(59, 28, 49, 1))"
        }} className="w-full h-full absolute opacity-75 bg-black"></span>
      </div>
      <div className="relative flex flex-wrap items-top mt-32 z-50 text-white">
        <div className="w-full md:w-5/12 px-4 mr-auto ml-auto">
          <h3 className="text-3xl mb-2 font-semibold leading-normal">
            Start your next fundraiser on Dispatch
          </h3>
          <div className="text-lg font-light leading-relaxed mt-4 mb-4">
            <p className="mb-2">
              Sign up with your existing Twitter account and start accepting web3 donations for your next project.
            </p>
            <ul>
              <li>
                <svg className="w-6 h-6 inline align-text-top" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>&nbsp;
                Sign up is free and takes 30 seconds
              </li>
              <li>
                <svg className="w-6 h-6 inline align-text-top" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>&nbsp;
                No technical experience or wallet needed
              </li>
              <li>
                <svg className="w-6 h-6 inline align-text-top" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>&nbsp;
                Keep 100% of the funds after fundraising
              </li>
            </ul>
          </div>
          <button className="btn btn-secondary" onClick={signUp}>Sign up for Dispatch</button>
        </div>
        <div className="w-full md:w-4/12 px-4 mr-auto ml-auto">
          <div className="flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-pink-500">
            <img
              alt="..."
              src="https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=1200"
              className="w-full align-middle rounded-t-lg"
            />
            <blockquote className="p-8 mb-4">
              <h4 className="text-xl font-bold">Suited for all creators</h4>
              <p className="text-md font-light mt-2">
                Dispatch enables creators to fundraise in web3
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
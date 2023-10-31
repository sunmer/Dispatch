import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { userFundraiserContext } from '../contexts/FundraiserContext';
import { useAuth } from '../contexts/AuthContext';
import { Magic } from 'magic-sdk';
import Settings from '../Settings';
import { OAuthExtension } from '@magic-ext/oauth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export function TopNav() {

  const { currentChain } = userFundraiserContext();
  const navigate = useNavigate();

  const { clearAuthData } = useAuth();

  const customNodeOptions = {
    rpcUrl: currentChain.rpcUrls.default.http.toString(),
    chainId: currentChain.id
  }

  const magic = new Magic(Settings.API_KEY_MAGIC, {
    network: customNodeOptions,
    extensions: [new OAuthExtension()],
  });

  useEffect(() => {
    const init = async () => {
      const isLoggedIn = await magic.user.isLoggedIn();

      if (!isLoggedIn) {
        clearAuthData();
      }
    }

    init();
  }, []);

  return (
    <div className="navbar relative z-10 relative flex flex-col md:flex-row items-center">
      <div className="flex-1 text-center mx-auto md:text-left md:mx-0">
        <h2 className="logo custom-font text-2xl"><a href="/" onClick={() => navigate('/')}>Dispatch</a></h2>
      </div>

      <div className="flex-none mt-4 md:mt-0">
        <ConnectButton label="Login" />
        <a href="https://twitter.com/web3pushers" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current ml-4">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
          </svg>
        </a>
      </div>
    </div>

  )

}
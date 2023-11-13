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
    <div className="navbar relative z-10 flex flex-col md:flex-row items-center">
      <div className="flex-1 text-center mx-auto mb-4 md:mb-0 md:text-left md:mx-0">
        <h2 className="logo custom-font text-2xl"><a href="/" onClick={() => navigate('/')}>Dispatch</a></h2>
      </div>
      <div className="flex-none md:mt-0">
        <ConnectButton label="Login" />
        <a href="/api/about" className="ml-2 font-bold">About</a>
      </div>
    </div>
  )

}

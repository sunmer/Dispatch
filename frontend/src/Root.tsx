import { base, polygon } from 'viem/chains'
import App from './App.tsx'
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { BrowserRouter } from 'react-router-dom';
import { DedicatedWalletConnector } from '@magiclabs/wagmi-connector';
import Settings from './Settings.ts';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { AuthProvider } from './contexts/AuthContext.tsx'
import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  rabbyWallet
} from '@rainbow-me/rainbowkit/wallets';
import { publicProvider } from 'wagmi/providers/public';

import '@rainbow-me/rainbowkit/styles.css';
import { GetCustomAvatar } from './components/CustomAvatar.tsx';
import { FundraiserProvider } from './contexts/FundraiserContext.tsx';


const { chains, publicClient } = configureChains(
  [polygon, base],
  [
    alchemyProvider({ apiKey: Settings.API_KEY_ALCHEMY }),
    publicProvider()
  ],
  {
    batch: {
      multicall: true
    }
  }
);

export const rainbowMagicConnector = ({ chains }: any) => ({
  id: 'magic',
  name: 'Twitter',
  iconUrl: 'https://static.vecteezy.com/system/resources/previews/018/930/695/original/twitter-logo-twitter-icon-transparent-free-free-png.png',
  iconBackground: '#fff',
  createConnector: () => {
    const connector = new DedicatedWalletConnector({
      chains,
      options: {
        apiKey: Settings.API_KEY_MAGIC,
        isDarkMode: true,
        oauthOptions: {
          providers: ["twitter"],
          callbackUrl: Settings.WEB_URL + "/oauth/callback",
        },
        magicSdkConfiguration: {
          network: {
            rpcUrl: polygon.rpcUrls.default.http.toString(),
            chainId: polygon.id,
          },
        },
      },
    });
    return {
      connector,
    };
  },
});

const projectId = "f5701e68fe5874b3bd95e8f3fa7d5539"

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [rainbowMagicConnector({ chains })],
  },
  {
    groupName: 'Custom',
    wallets: [
      injectedWallet({ chains, shimDisconnect: true }),
      walletConnectWallet({ projectId, chains }),
      rabbyWallet({ chains }),
      metaMaskWallet({ projectId, chains, shimDisconnect: true })
    ]
  }
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});


function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WagmiConfig config={wagmiConfig}>
          <FundraiserProvider publicClient={wagmiConfig.getPublicClient()}>
            <RainbowKitProvider chains={chains} avatar={GetCustomAvatar}>
              <App />
            </RainbowKitProvider>
          </FundraiserProvider>
        </WagmiConfig>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default Root;
import { Magic } from 'magic-sdk';
import Settings from '../Settings';
import { OAuthExtension, OAuthRedirectResult } from '@magic-ext/oauth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userFundraiserContext } from '../contexts/FundraiserContext';

export function SignupSuccess() {

  const { currentChain } = userFundraiserContext();

  const navigate = useNavigate();
  const { setAuthData } = useAuth();

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
      const redirectResult: OAuthRedirectResult = await magic.oauth.getRedirectResult();
      const userData = await magic.user.getInfo();
      console.log("JSON.stringify(userData)")
      console.log(JSON.stringify(userData))
      console.log("JSON.stringify(redirectResult)")
      console.log(JSON.stringify(redirectResult))

      setAuthData({
        idToken: redirectResult.magic.idToken,
        userMetadata: userData,
        oauthRedirectResult: redirectResult
      });

      try {
        await fetch(Settings.API_URL + '/publicaddress', {
          method: 'POST',
          //headers: { Setting headers to Content-Type JSON creates CORS issues when running locally
            //"Content-Type": "application/json",
          //},
          body: JSON.stringify({ 
            publicAddress: userData.publicAddress,
            userInfo: redirectResult.oauth.userInfo
          })
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }

    init();
  }, []);

  return (
    <div className="flex flex-row space-x-4 justify-center items-center h-auto mt-5">
      <div className="card card-compact w-96 bg-base-100 shadow-xl text-start">
        <figure>
          <img src="https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=1200" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">You've successfully signed up!</h2>
          <p className="mb-4 text-md font-light">
            Now get started by publishing your first content.<br /> <br />
            Content can either be free to view and tippable, or locked behind a pay-per-view paywall. You decide how to monetise on a content basis.
          </p>
          <div className="card-actions justify-end">
            <button className="btn btn-secondary" onClick={() => navigate('/create')}>Create a fundraiser</button>
          </div>
        </div>
      </div>
    </div>
  );
}
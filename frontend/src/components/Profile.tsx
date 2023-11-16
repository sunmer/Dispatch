import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EventContributionCreated } from '../Interfaces';
import { CONTRACT_ADDRESS, userFundraiserContext } from '../contexts/FundraiserContext';
import { GetCustomAvatar } from './CustomAvatar';
import { getPublicClient } from '@wagmi/core'
import Settings from '../Settings';
import { OpenIDConnectUserInfo } from '@magic-ext/oauth';


export function Profile() {

  const publicClient = getPublicClient();

  const { priceData, currentChain, getUSDValue } = userFundraiserContext();

  const { publicAddress } = useParams<{ publicAddress: string }>();
  const [userInfo, setUserInfo] = useState<OpenIDConnectUserInfo>()

  const [totalContributions, setTotalContributions] = useState<bigint>(0n);
  const [numberOfContributions, setNumberOfContributions] = useState<number>(0)
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (publicAddress) {
        const response = await fetch(
          Settings.API_URL + '/publicaddress?' + new URLSearchParams({ publicAddress: publicAddress }),
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const userInfo: OpenIDConnectUserInfo[] = await response.json();
        console.log(userInfo)
        setUserInfo(userInfo[0])
      }

      setIsLoadingContributions(true);
      const contributionCreatedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
        event: EventContributionCreated,
        fromBlock: CONTRACT_ADDRESS[currentChain.id][1],
        toBlock: 'latest',
        args: {
          sender: publicAddress as `0x${string}`
        },
      });

      setNumberOfContributions(contributionCreatedEvents.length);
      let totalContributed = 0n;
      for (let contributionCreatedEvent of contributionCreatedEvents) {
        totalContributed += contributionCreatedEvent.args.amount!
      }

      setTotalContributions(totalContributed)
      setIsLoadingContributions(false);
    };

    init();
  }, [publicAddress]);

  if (isLoadingContributions) {
    return (
      <div className="flex flex-col space-y-4 justify-center items-center h-auto mt-5">
        {isLoadingContributions && (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
      </div>
    )
  } else {
    return (
      <>
        {userInfo && priceData && publicAddress && (

          <div className="flex flex-col space-y-4 justify-center items-center h-auto mt-5">

            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <div className="avatar flex justify-center items-center">
                    <div className="avatar-pic w-10 rounded-full">
                      <GetCustomAvatar address={publicAddress} size={40} />
                    </div>
                  </div>
                </div>
                <div className="stat-value">86%</div>
                <div className="stat-title">Tasks done</div>
                <div className="stat-desc text-secondary">31 tasks remaining</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <div className="stat-title">Twitter Followers</div>
                <div className="stat-value text-primary">{userInfo.sources![Object.keys(userInfo.sources!)[0]].followers_count}</div>
                <div className="stat-desc">21% more than last month</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="stat-title">Page Views</div>
                <div className="stat-value text-secondary">2.6M</div>
                <div className="stat-desc">21% more than last month</div>
              </div>

            </div>

            <h1 className="text-5xl leading-tight max-w-3xl font-bold tracking-tight pb-2 mt-6 mx-auto bg-clip-text"><h2>{userInfo.name}</h2></h1>
            <div className="stats shadow">

              <div className="stat">
                <div className="stat-title"></div>
                <div className="avatar flex justify-center items-center">
                  <div className="avatar-pic w-10 rounded-full">
                    <GetCustomAvatar address={publicAddress} size={40} />
                  </div>
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Contributions</div>
                <div className="stat-value text-primary">{numberOfContributions}</div>
                <div className="stat-desc"></div>
              </div>

              <div className="stat">
                <div className="stat-title">Total contributions:</div>
                <div data-tip={`Total tips amount in $`} className="stat-value text-secondary">${Number(getUSDValue(totalContributions)).toFixed(4)}</div>
                <div className="stat-desc">
                </div>
              </div>

            </div>
          </div>
        )}
      </>
    )
  }
}
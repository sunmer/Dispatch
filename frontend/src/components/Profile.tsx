import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EventContributionCreated } from '../Interfaces';
import { CONTRACT_ADDRESS, userFundraiserContext } from '../contexts/FundraiserContext';
import { GetCustomAvatar } from './CustomAvatar';
import { getPublicClient } from '@wagmi/core'


export function Profile() {

  const publicClient = getPublicClient();

  const { priceData, currentChain } = userFundraiserContext();

  const { username } = useParams<{ username: string }>();
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoadingContributions(true);
      const contributionsData = await publicClient.getLogs({
        address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
        event: EventContributionCreated,
        fromBlock: CONTRACT_ADDRESS[currentChain.id][1],
        toBlock: 'latest',
        args: {
          sender: username as `0x${string}`
        },
      });
      console.log(contributionsData)
    };

    init();
  }, [username]);

  return (
    <>
      {priceData && username && (
        <div className="flex flex-col space-y-4 justify-center items-center h-auto mt-5">
          <h1 className="text-5xl leading-tight max-w-3xl font-bold tracking-tight pb-2 mt-6 mx-auto bg-clip-text">{username?.substring(0, username.length - 20)}</h1>
          <div className="stats shadow">

            <div className="stat">
              <div className="avatar flex justify-center items-center">
                <div className="avatar-pic w-10 rounded-full">
                  <GetCustomAvatar address={username} size={40} />
                </div>
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Contributions</div>
              <div className="stat-value text-primary">{'profileDispatches.length'}</div>
              <div className="stat-desc"></div>
            </div>

            <div className="stat">
              <div className="stat-title">Total contributions:</div>
              <div data-tip={`Total tips amount in $`} className="stat-value text-secondary">something.$</div>
              <div className="stat-desc">
              </div>
            </div>

          </div>
        </div>
      )}
      <div className="flex flex-col space-y-4 justify-center items-center h-auto mt-5">
       
        {isLoadingContributions && (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
      </div >
    </>
  );
}
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EventContributionCreated } from '../Interfaces';
import { CONTRACT_ADDRESS, userFundraiserContext } from '../contexts/FundraiserContext';
import { GetCustomAvatar } from './CustomAvatar';
import { getPublicClient } from '@wagmi/core'


export function Profile() {

  const publicClient = getPublicClient();

  const { priceData, currentChain, getUSDValue } = userFundraiserContext();

  const { username } = useParams<{ username: string }>();

  const [totalContributions, setTotalContributions] = useState<bigint>(0n);
  const [numberOfContributions, setNumberOfContributions] = useState<number>(0)
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoadingContributions(true);
      const contributionCreatedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
        event: EventContributionCreated,
        fromBlock: CONTRACT_ADDRESS[currentChain.id][1],
        toBlock: 'latest',
        args: {
          sender: username as `0x${string}`
        },
      });

      setNumberOfContributions(contributionCreatedEvents.length);
      let totalContributed = 0n;
      for(let contributionCreatedEvent of contributionCreatedEvents) {
        totalContributed += contributionCreatedEvent.args.amount!
      }
      
      setTotalContributions(totalContributed)
      setIsLoadingContributions(false);
    };

    init();
  }, [username]);

  if(isLoadingContributions) {
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
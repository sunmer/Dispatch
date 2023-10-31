import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { base, polygon } from 'viem/chains'
import { FundraiserView, ContributorView, PriceData, EventFundraiserCreated, EventContributionCreated } from '../Interfaces';
import { Chain, PublicClient, formatEther } from 'viem';
import { useAccount, useNetwork } from 'wagmi';
import Settings from '../Settings';
import { OpenIDConnectUserInfo } from '@magic-ext/oauth';

interface FundraiserContextType {
  allFundraisers: FundraiserView[];
  allContributors: ContributorView[];
  addFundraiser: (fundraiser: FundraiserView) => void;
  priceData: PriceData | null;
  getUSDValue: (amount: bigint) => string;
  getSocialAvatarURL: (publicAddress: string) => Promise<OpenIDConnectUserInfo | null>;
  getTotalContributionsBySender: (sender: string) => bigint;
  currentChain: Chain;
}


const FundraiserContext = createContext<FundraiserContextType | undefined>(undefined);

interface FundraiserProviderProps {
  children: ReactNode;
  publicClient: PublicClient
}

export const DEFAULT_CHAIN = polygon;

export const CONTRACT_ADDRESS: { [key: number]: [string, bigint] } = {
  [polygon.id]: ["0xfd48801A09fA17410EA1cE009a839a7a65728685", 49340464n],
  [base.id]: ["0xeE87fFAA792b36AEe3769364a6617773d8F6C313", 0n]
};

const BLOCKS_PRODUCED_PER_24_HOURS = 43200n;

export const FundraiserProvider: React.FC<FundraiserProviderProps> = ({ children, publicClient }) => {
  const { chain: connectedChain } = useNetwork();
  const { isConnected } = useAccount();

  const [currentChain, setCurrentChain] = useState<Chain>(DEFAULT_CHAIN);

  const [allFundraisers, setAllFundraisers] = useState<FundraiserView[]>([]);
  const [allContributors, setAllContributors] = useState<ContributorView[]>([]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);

  useEffect(() => {
    const init = async () => {
      const determineTargetChain = () => {
        if (isConnected && connectedChain) {
          return connectedChain;
        }
        return DEFAULT_CHAIN;
      };

      let targetChain = determineTargetChain();
      setCurrentChain(targetChain);
    };

    init();
  }, [isConnected]);

  useEffect(() => {
    if (currentChain) {
      const init = async () => {
        const priceDataResponse = await fetch(`https://api.coinbase.com/v2/prices/${currentChain.nativeCurrency.symbol}-usd/buy`);
        const priceData = await priceDataResponse.json();
        setPriceData(priceData.data);

        const block = await publicClient.getBlock();
        const blockHeight24HoursAgo = block.number - BLOCKS_PRODUCED_PER_24_HOURS;

        const fundraisersData = await publicClient.getLogs({
          address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
          event: EventFundraiserCreated,
          fromBlock: blockHeight24HoursAgo,
          toBlock: 'latest'
        });

        const fundraisersMap: { [key: string]: FundraiserView } = {};
        fundraisersData.map(r => {
          const fundraiser: FundraiserView = {
            id: r.args.id!,
            sender: r.args.sender!,
            content: r.args.content!,
            goalAmount: r.args.goalAmount!,
            deadline: r.args.deadline!,
            amount: 0n,
            timestamp: r.args.timestamp!,
            txHash: r.transactionHash
          };
          
          fundraiser.content = JSON.parse(r.args.content!).t;
          fundraiser.contentFileIDs = JSON.parse(r.args.content!).f;

          fetch('https://gateway.irys.xyz/' + fundraiser.content)
            .then(response => response.text())
            .then(data => {
              const fundraiserText = JSON.parse(data);
              
              fundraiser.contentTextBody = fundraiserText.tb;
              fundraiser.contentTextTitle = fundraiserText.tt;
              fundraisersMap[fundraiser.id.toString()] = fundraiser;

              return fundraiser;
            })
            .catch(err => {
              console.error("Error fetching the file:", err);
            });
        });

        const contributionsData = await publicClient.getLogs({
          address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
          event: EventContributionCreated,
          fromBlock: CONTRACT_ADDRESS[currentChain.id][1],
          toBlock: 'latest'
        });

        const groupedTippers: { [key: string]: ContributorView } = {};

        for (const contribution of contributionsData) {
          const key = contribution.args.sender!;
          if (!groupedTippers[key]) {
            groupedTippers[key] = {
              sender: contribution.args.sender as `0x${string}`,
              totalContributions: BigInt(0),
              contributions: []
            };
          }
          groupedTippers[key].totalContributions += BigInt(contribution.args.amount!);
          groupedTippers[key].contributions.push(contribution);
        }

        setAllFundraisers(Object.values(fundraisersMap));
        setAllContributors(Object.values(groupedTippers));
      }

      init();
    }
  }, [currentChain]);

  const addFundraiser = (fundraiser: FundraiserView) => {
    setAllFundraisers(prevFundraisers => [fundraiser, ...prevFundraisers]);
  }

  const getUSDValue = (amount: bigint): string => {
    if (!priceData)
      throw new Error("Price data is not available yet");

    return (parseFloat(priceData.amount) * parseFloat(formatEther(amount, "wei"))).toString();
  }

  const getSocialAvatarURL = async (publicAddress: string): Promise<OpenIDConnectUserInfo | null> => {
    if (!publicAddress)
        return null;

      try {
        const response = await fetch(
          Settings.API_URL + '/publicaddress?' + new URLSearchParams({ publicAddress: publicAddress }), 
          { method: 'GET' }
        );
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        const data: OpenIDConnectUserInfo[] = await response.json();

        return data[0] || null;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
  }

  const getTotalContributionsBySender = (sender: string) => {
    const tipper = allContributors.find(contributor => contributor.sender === sender);
    return tipper ? BigInt(tipper.totalContributions) : 0n;
  };

  return (
    <FundraiserContext.Provider value={{ allFundraisers, allContributors, addFundraiser, priceData, getUSDValue, getSocialAvatarURL, getTotalContributionsBySender, currentChain }}>
      {children}
    </FundraiserContext.Provider>
  );
};

export const userFundraiserContext = (): FundraiserContextType => {
  const context = useContext(FundraiserContext);
  if (!context) {
    throw new Error("useFundraiserContext must be used within a FundraiserProvider");
  }
  return context;
}

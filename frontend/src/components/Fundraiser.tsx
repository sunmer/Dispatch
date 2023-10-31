import { default as Dispatcher } from '../abi/contracts/Dispatcher.sol/Dispatcher.json';
import { useEffect, useState } from 'react';
import {
  useAccount, useBlockNumber, useContractRead, useContractWrite, usePrepareContractWrite
} from 'wagmi'
import { getPublicClient } from '@wagmi/core'
import { FundraiserView, EventFundraiserCreated, CommentView, EventCommentCreated, FundraiserBlockchain, EventContributionCreated } from '../Interfaces';
import { toast } from 'react-toastify';
import { CreateComment } from './CreateComment';
import { BLOCKS_PRODUCED_PER_12_HOURS, CONTRACT_ADDRESS, userFundraiserContext } from '../contexts/FundraiserContext';
import { useNavigate, useParams } from 'react-router-dom';
import Settings from '../Settings';
import { GetCustomAvatar } from './CustomAvatar';
import AvatarFlame from '../assets/avatar-flame.svg';
import { parseEther } from 'viem';


export function Fundraiser() {

  const { fundraiserId } = useParams<{ fundraiserId: string }>();
  const publicClient = getPublicClient();

  const navigate = useNavigate();
  const { getUSDValue, getTotalContributionsBySender, allContributors, currentChain } = userFundraiserContext();

  const [fundraiserContribution, setFundraiserContribution] = useState<string>("0.001");
  const [fundraiser, setFundraiser] = useState<FundraiserView>();
  const [sortedComments, setSortedComments] = useState<CommentView[]>([]);
  const [numberOfContributions, setNumberOfContributions] = useState<number>(0)
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [isCreatingContribution, setIsCreatingContribution] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const { data: blocknumberData } = useBlockNumber({
  })

  const { address } = useAccount();

  type BlockchainFundraiserArray = [bigint, string, string, bigint, bigint, bigint];
  const { data: fundraiserData }: { data: BlockchainFundraiserArray | undefined, isError: boolean, isLoading: boolean } = useContractRead({
    address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
    abi: Dispatcher.abi,
    functionName: 'fundraiserById',
    args: [fundraiserId ? BigInt(fundraiserId) : 0n]
  })

  useEffect(() => {
    if (fundraiserId && fundraiserData && blocknumberData) {
      const blockHeight24HoursAgo = blocknumberData - BLOCKS_PRODUCED_PER_12_HOURS;

      const fundraiserBlockchain: FundraiserBlockchain = {
        id: fundraiserData[0],
        sender: fundraiserData[1],
        content: fundraiserData[2],
        amount: fundraiserData[3],
        goalAmount: fundraiserData[4],
        deadline: fundraiserData[5]
      };

      const init = async () => {
        const fundraiserCreatedEvents = await publicClient.getLogs({
          address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
          event: EventFundraiserCreated,
          fromBlock: CONTRACT_ADDRESS[currentChain.id][1],
          toBlock: 'latest',
          args: {
            id: BigInt(fundraiserId)
          }
        });

        const fundraiserCreatedEvent = fundraiserCreatedEvents[0];

        let fundraiserView: FundraiserView = {
          id: fundraiserBlockchain.id,
          sender: fundraiserBlockchain.sender,
          content: fundraiserBlockchain.content,
          amount: fundraiserBlockchain.amount,
          deadline: fundraiserBlockchain.deadline,
          goalAmount: fundraiserBlockchain.goalAmount,
          timestamp: fundraiserCreatedEvent.args.timestamp!,
          txHash: fundraiserCreatedEvent.transactionHash
        };

        const fundraiserContent = JSON.parse(fundraiserBlockchain.content);
        const contentTextID = fundraiserContent.t;
        fundraiserView.contentFileIDs = fundraiserContent.f;

        const fetchMainContent = async () => {
          try {
            const response = await fetch('https://gateway.irys.xyz/' + contentTextID);
            const data = await response.text();
            const fundraiserText = JSON.parse(data);
            fundraiserView.contentTextBody = fundraiserText.tb;
            fundraiserView.contentTextTitle = fundraiserText.tt;
            return fundraiserView;
          } catch (err) {
            console.error("Error fetching the main file:", err);
          }
        };

        const getNumberOfContributions = async () => {
          const contributionEvents = await publicClient.getLogs({
            address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
            event: EventContributionCreated,
            fromBlock: CONTRACT_ADDRESS[currentChain.id][1],
            toBlock: 'latest',
            args: {
              fundraiserId: BigInt(fundraiserId)
            },
          });
          return contributionEvents.length;
        }

        const getLatestReplies = async () => {
          setIsLoadingComments(true);
          const repliesData = await publicClient.getLogs({
            address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
            event: EventCommentCreated,
            fromBlock: blockHeight24HoursAgo,
            args: {
              fundraiserId: BigInt(fundraiserId)
            },
            toBlock: 'latest'
          });

          console.log("repliesData")
          console.log(repliesData)

          return await Promise.all(repliesData.map(async r => {
            const comment = {
              ...r.args as unknown as CommentView,
              txHash: r.transactionHash
            };
            comment.contentTextBody = JSON.parse(r.args.content!).t;
            comment.contentFileIDs = JSON.parse(r.args.content!).f;

            const response = await fetch('https://gateway.irys.xyz/' + comment.contentTextBody);
            const content = await response.text();
            comment.contentTextBody = content;

            return comment;
          }));
        };

        const [updatedFundraiserView, contributionsCount, replies] = await Promise.all([
          fetchMainContent(),
          getNumberOfContributions(),
          getLatestReplies()
        ]);

        setIsLoadingComments(false);

        setFundraiser(updatedFundraiserView);
        setNumberOfContributions(contributionsCount);
        setFundraiser(prevFundraiser => ({ ...prevFundraiser, comments: replies } as FundraiserView));
      };

      init();
    }
  }, [fundraiserId, blocknumberData]);


  useEffect(() => {
    if (fundraiser?.comments) {
      const sorted = [...fundraiser.comments].sort((a: CommentView, b: CommentView): number => {
        return Number(b.timestamp) - Number(a.timestamp);
      });

      setSortedComments(sorted);
    }
  }, [fundraiser?.comments]);


  let { config: configCreateContribution, error: errorCreateContribution, refetch: refetchCreateContribution } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
    abi: Dispatcher.abi,
    functionName: 'contribute',
    value: !isNaN(Number(fundraiserContribution)) ? parseEther(fundraiserContribution) : 0n,
    args: [fundraiser ? fundraiser.id : -1]
  });

  const { writeAsync: writeCreateContribution, status: writeCreateContributionStatus, data: writeCreateContributionData } = useContractWrite(configCreateContribution);

  let { config: configClaimAmount, error: errorClaimAmount, refetch: refetchClaimAmount } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
    abi: Dispatcher.abi,
    functionName: 'claimAmount',
    args: [fundraiser ? fundraiser.id : 0],
    enabled: false
  });

  const { write: writeClaimFundraiserAmount, status: writeClaimFundraiserAmountStatus, data: writeClaimFundraiserAmountData } = useContractWrite(configClaimAmount);

  useEffect(() => {
    if (writeCreateContributionStatus === "success") {
      toast(<div>Thanks for contributing! It will show when <a target="_blank" className="link link-secondary" href={currentChain.blockExplorers?.default.url + '/tx/' + writeCreateContributionData?.hash}>the transaction</a> completes</div>);

      setShowContributionForm(false);
    } else if (writeClaimFundraiserAmountStatus === "success") {
      toast(<div>Your contributions have been claimed. It will show when <a target="_blank" className="link link-secondary" href={currentChain.blockExplorers?.default.url + '/tx/' + writeClaimFundraiserAmountData?.hash}>the transaction</a> completes</div>);
    }
  }, [writeCreateContributionStatus, writeClaimFundraiserAmountStatus]);

  const createContribution = async () => {
    setIsCreatingContribution(true);
    await refetchCreateContribution();

    if (errorCreateContribution) {
      console.log(errorCreateContribution);
      return;
    }

    writeCreateContribution?.();
  }

  const createClaimAmount = async () => {
    await refetchClaimAmount();

    if (errorClaimAmount) {
      console.log(errorClaimAmount);
      return;
    }

    await writeClaimFundraiserAmount?.();
    setIsCreatingContribution(false);
  }

  const addComment = (newComment: CommentView) => {
    if (fundraiser) {
      const updatedFundraiser = {
        ...fundraiser,
        replies: [newComment, ...(fundraiser.comments || [])]
      };

      setFundraiser(updatedFundraiser);
    }
  };

  if (!fundraiser) {
    return (
      <div className="text-center">
        <h4 className="text-lg mb-2">Loading fundraiser</h4>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  } else {
    return (
      <div>
        <div className="flex flex-col space-y-4 justify-center items-center h-auto mt-5">
          <h1 className="text-5xl leading-tight max-w-3xl font-bold tracking-tight pb-2 mt-6 mx-auto">
            {fundraiser.contentTextTitle}
          </h1>
          <div className="card bg-[#1d1d1f] shadow-lg w-full mx-2.5 md:max-w-[620px] md:mx-auto">
            <div className="card-body">
              <p className="text-left mb-2 whitespace-pre-line">{fundraiser.contentTextBody}</p>
              {fundraiser.contentFileIDs && fundraiser.contentFileIDs.map((fileContent, index) => (
                <img className="w-2/5" key={index} src={Settings.IRYS_URL + fileContent} alt="" />
              ))}
            </div>
            <div className="card-actions flex justify-end items-center mt-4 p-4 bg-base-100 rounded-b-lg">
              {fundraiser.id === -1n && (
                <><span className="loading loading-spinner h-6 w-6"></span>Saving...</>
              )}
              {!showContributionForm && (
                <button className="btn btn-outline btn-sm btn-secondary"
                  onClick={() => setShowContributionForm(true)}>
                  Contribute
                </button>
              )}
              {showContributionForm && (
                <div className="join">
                  <input className="input input-bordered input-sm focus:outline-none join-item max-w-[120px]" placeholder="amount" value={`${fundraiserContribution} ${currentChain.nativeCurrency.symbol}`}
                    onChange={e => setFundraiserContribution(e.target.value.replace(` ${currentChain.nativeCurrency.symbol}`, ''))} />
                  <button
                    className="btn btn-outline btn-sm btn-secondary join-item z-10"
                    disabled={isCreatingContribution}
                    onClick={createContribution}>
                    Add contribution
                    {isCreatingContribution && (
                      <span className="text-white loading loading-spinner"></span>
                    )}
                  </button>
                </div>
              )}
              {address === fundraiser.sender && (
                <button
                  className="btn btn-outline btn-sm btn-accent"
                  disabled={!writeClaimFundraiserAmount}
                  onClick={createClaimAmount}>
                  Claim contributions
                </button>
              )}
              <div
                className="chat-image avatar self-end tooltip hover cursor-pointer"
                data-tip={`This user has tipped $${Number(getUSDValue(getTotalContributionsBySender(fundraiser.sender))).toFixed(4)} in total`}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/profile/${fundraiser.sender}`);
                }}>
                {Number(allContributors.find((contributor => contributor.sender === fundraiser.sender))?.totalContributions) > 0 && (
                  <img className="!h-6 !w-6 absolute -right-2 -top-2 z-10" src={AvatarFlame} />
                )}
                <div className="avatar-pic w-8 rounded-full">
                  <GetCustomAvatar address={fundraiser.sender} size={30} />
                </div>
              </div>
            </div>
          </div>
          <div className="stats card shadow w-full md:max-w-[620px] md:mx-auto">
            <div className="stat">
              <div className="stat-title">Raised</div>
              <div className="stat-value text-primary">
                {Number(getUSDValue(fundraiser.amount ? fundraiser.amount : 0n)).toFixed(4)}$
              </div>
              <div className="stat-desc"></div>
            </div>
            <div className="stat">
              <div className="stat-title">Goal</div>
              <div className="stat-value text-primary">{Number(getUSDValue(fundraiser.goalAmount ? fundraiser.goalAmount : 0n)).toFixed(4)}$</div>
              <div className="stat-desc"></div>
            </div>
            <div className="stat">
              <div className="stat-title">Number of contributions:</div>
              <div data-tip={`Total tips amount in $`} className="stat-value text-secondary">{numberOfContributions}</div>
              <div className="stat-desc">
              </div>
            </div>
          </div>
          {isLoadingComments && (
            <div className="text-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          <CreateComment parentFundraiser={fundraiser} onCreated={addComment} />
          {!isLoadingComments && sortedComments.map((comment, index) => (
            <div key={index} className="chat chat-start w-full mx-2.5 md:max-w-[620px] md:mx-auto">
              <div
                className="chat-image avatar self-end tooltip hover cursor-pointer"
                data-tip={`This user has tipped $${Number(getUSDValue(getTotalContributionsBySender(comment.sender))).toFixed(4)} in total`}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/profile/${fundraiser.sender}`);
                }}>
                {Number(allContributors.find((contributor => contributor.sender === comment.sender))?.totalContributions) > 0 && (
                  <img className="!h-6 !w-6 absolute -right-2 -top-2 z-10" src={AvatarFlame} />
                )}
                <div className="avatar-pic w-10 rounded-full">
                  <GetCustomAvatar address={comment.sender} size={40} />
                </div>
              </div>
              <div className="chat-bubble text-start">
                <p>{comment.contentTextBody}</p>
                {comment.contentFileIDs && comment.contentFileIDs.map((fileId, index) => (
                  <img key={index} src={Settings.IRYS_URL + fileId} alt="" />
                ))}
              </div>
              <div className="chat-footer flex flex-row mt-1">
                {comment.id === -1n && (
                  <><span className="loading loading-spinner h-4 w-4"></span>&nbsp;Saving</>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


}

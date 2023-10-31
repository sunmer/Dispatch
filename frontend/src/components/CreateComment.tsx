import { default as Dispatcher } from '../abi/contracts/Dispatcher.sol/Dispatcher.json';
import { useState } from 'react';
import { getPublicClient } from '@wagmi/core'
import {
  useAccount,
  useWalletClient
} from 'wagmi'
import { CommentView, FundraiserView, UploadResponse } from '../Interfaces';
import { toast } from 'react-toastify';
import Settings from '../Settings';
import { GetCustomAvatar } from './CustomAvatar';
import AvatarFlame from '../assets/avatar-flame.svg';
import { CONTRACT_ADDRESS, userFundraiserContext } from '../contexts/FundraiserContext';
import { FileUpload } from './FileUpload';


export function CreateComment({ parentFundraiser: fundraiser, onCreated }: { parentFundraiser: FundraiserView, onCreated: (comment: CommentView) => void }) {

  const publicClient = getPublicClient();

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { getUSDValue, getTotalContributionsBySender, currentChain, allContributors } = userFundraiserContext();

  const [showCommentForm, setShowCommentForm] = useState(false);

  const [isCreatingComment, setIsCreatingComment] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);

  const createComment = async () => {
    setIsCreatingComment(true);

    const formData = new FormData();
    formData.append('commentText', commentText);
    commentFiles.forEach(file => formData.append('commentFiles', file));

    const uploadRawResponse = await fetch(Settings.API_URL + '/upload', {
      method: 'POST',
      body: formData
    });

    const uploadResponse: { textContent: UploadResponse, filesContent?: UploadResponse[] } = await uploadRawResponse.json();

    let commentContent: { t: string, f?: string[] } = {
      t: uploadResponse.textContent.id
    };

    if (uploadResponse.filesContent) {
      commentContent.f = [];
      for (const file of uploadResponse.filesContent) {
        commentContent.f.push(file.id)
      }
    }

    if (walletClient) {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
        abi: Dispatcher.abi,
        functionName: 'createComment',
        args: [JSON.stringify(commentContent), fundraiser.id]
      });

      const txHash = await walletClient.writeContract(request);
      if (txHash) {
        const date = new Date();
        const commentUnprocessed: CommentView = {
          id: -1n,
          sender: address as `0x${string}`,
          content: JSON.stringify(commentContent),
          timestamp: BigInt(Math.round(date.getTime() / 1000).toString()),
          textContent: commentText,
          filesContent: commentContent.f,
          fundraiserId: fundraiser.id
        };

        onCreated(commentUnprocessed);
        toast(<div>Your comment was successful. It will show when <a target="_blank" className="link link-secondary" href={currentChain.blockExplorers?.default.url + '/tx/' + txHash}>the transaction</a> completes</div>);

        setIsCreatingComment(false);
        setShowCommentForm(false);
      }
    }
  };

  return (
    <>
      <div className="chat chat-start w-full mx-2.5 md:max-w-[620px] md:mx-auto">
        <div
          className="chat-image avatar self-end tooltip"
          data-tip={`This user has contributed $${Number(getUSDValue(getTotalContributionsBySender(address as string))).toFixed(4)} in total`}>
          {Number(allContributors.find((contributor => contributor.sender === address))?.totalContributions) > 0 && (
            <img className="!h-6 !w-6 absolute -right-2 -top-2 z-10" src={AvatarFlame} />
          )}
          <div className="avatar-pic w-10 rounded-full hover cursor-pointer">
            <GetCustomAvatar address={address as string} size={40} />
          </div>
        </div>
        <div className="chat-bubble text-start flex items-end">
          {!showCommentForm && (
            <button className="btn btn-sm btn-secondary"
              onClick={() => setShowCommentForm(true)}>Comment..</button>
          )}
          {showCommentForm && (
            <>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your comment"
                className="input input-bordered mr-2 !outline-none input-secondary chat-start chat-bubble"></textarea>
              <div className="mb-4 text-center hidden">
                <FileUpload onFilesAccepted={setCommentFiles} maxFiles={2} />
              </div>
              <button
                className="btn btn-secondary btn-sm text-white"
                disabled={isCreatingComment}
                onClick={createComment}>Comment
                {isCreatingComment && (
                  <span className="loading loading-spinner"></span>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </>
  );
}

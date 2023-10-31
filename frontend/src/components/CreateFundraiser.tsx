import { default as Dispatcher } from '../abi/contracts/Dispatcher.sol/Dispatcher.json';
import { useState } from 'react';
import { getPublicClient } from '@wagmi/core'
import { useAccount, useWalletClient } from 'wagmi';
import { FundraiserView, UploadResponse } from '../Interfaces';
import { toast } from 'react-toastify';
import { CONTRACT_ADDRESS, userFundraiserContext } from '../contexts/FundraiserContext';
import { FileUpload } from './FileUpload';
import Settings from '../Settings';
import { useNavigate } from 'react-router-dom';
import { parseEther } from 'viem';


export function CreateFundraiser() {

  const navigate = useNavigate();
  const publicClient = getPublicClient()

  const { address } = useAccount();
  const { addFundraiser, currentChain } = userFundraiserContext();
  const { data: walletClient } = useWalletClient();
  const [fundraiserTextTitle, setFundraiserTextTitle] = useState('');
  const [fundraiserTextBody, setFundraiserTextBody] = useState('');
  const [fundraiserGoalAmount, setFundraiserGoalAmount] = useState("0.0001");
  const [fundraiserFiles, setFundraiserFiles] = useState<File[]>([]);
  const [isCreatingFundraiser, setIsCreatingFundraiser] = useState(false);


  const createFundraiser = async () => {
    setIsCreatingFundraiser(true);

    const formData = new FormData();
    formData.append('contentTextTitle', fundraiserTextTitle);
    formData.append('contentTextBody', fundraiserTextBody);
    fundraiserFiles.forEach(file => formData.append('contentFiles', file));

    const uploadRawResponse = await fetch(Settings.API_URL + '/upload', {
      method: 'POST',
      body: formData
    });

    const uploadResponse: { textContent: UploadResponse, filesContent?: UploadResponse[] } = await uploadRawResponse.json();

    let fundraiserContent: { t: string, f?: string[] } = {
      t: uploadResponse.textContent.id
    };

    if (uploadResponse.filesContent) {
      fundraiserContent.f = [];
      for (const file of uploadResponse.filesContent) {
        fundraiserContent.f.push(file.id)
      }
    }

    if (walletClient) {
      const date = new Date();
      const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
      const futureDate = new Date(date.getTime() + oneWeekInMilliseconds);
      const futureTimestamp = BigInt(Math.round(futureDate.getTime() / 1000));

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS[currentChain.id][0] as `0x${string}`,
        abi: Dispatcher.abi,
        functionName: 'createFundraiser',
        args: [JSON.stringify(fundraiserContent), parseEther(fundraiserGoalAmount), futureTimestamp]
      });

      const txHash = await walletClient.writeContract(request);
      if (txHash) {
        const fundraiserUnprocessed: FundraiserView = {
          id: -1n,
          sender: address as `0x${string}`,
          content: JSON.stringify(fundraiserContent),
          amount: 0n,
          goalAmount: parseEther(fundraiserGoalAmount),
          deadline: futureTimestamp,
          timestamp: BigInt(Math.round(date.getTime() / 1000).toString()),
          txHash: txHash,
          contentTextTitle: fundraiserTextTitle,
          contentTextBody: fundraiserTextBody,
          contentFileIDs: fundraiserContent.f
        };

        addFundraiser(fundraiserUnprocessed);
        navigate('/');
        toast(<div>Fundraiser saved in <a target="_blank" className="link link-secondary" href={currentChain.blockExplorers?.default.url + '/tx/' + txHash}>transaction</a>...</div>);

        setIsCreatingFundraiser(false);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4 justify-center items-center h-auto mt-5">
      <div className="card w-1/2 bg-[#1d1d1f] shadow-lg p-4 hover cursor-pointer w-full mx-2.5 md:max-w-[620px] md:mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fundraiserTitle">
            Title
          </label>
          <input
            id="fundraiserTitle"
            className="input input-bordered w-full text-lg focus:outline-none"
            placeholder="Fundraiser title"
            value={fundraiserTextTitle}
            onChange={e => setFundraiserTextTitle(e.target.value)} />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Fundraiser description..."
            value={fundraiserTextBody}
            onChange={(e) => setFundraiserTextBody(e.target.value)}
            className="textarea input-bordered w-full text-lg min-h-[100px]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="goalAmount">
            Goal amount
          </label>
          <input
            id="goalAmount"
            className="input input-bordered focus:outline-none"
            placeholder="Goal amount"
            value={`${fundraiserGoalAmount} ${currentChain.nativeCurrency.symbol}`}
            onChange={e => setFundraiserGoalAmount(e.target.value.replace(` ${currentChain.nativeCurrency.symbol}`, ''))} />
        </div>
        <div className="mb-4 text-center">
          <FileUpload onFilesAccepted={setFundraiserFiles} maxFiles={2} />
        </div>
        <button
          className="btn btn-secondary btn-lg text-white"
          disabled={isCreatingFundraiser || fundraiserTextTitle === '' || fundraiserTextBody === ''}
          onClick={createFundraiser}>Create fundraiser
          {isCreatingFundraiser && (
            <span className="loading loading-spinner"></span>
          )}
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { formatDate } from "../App"
import { userFundraiserContext } from '../contexts/FundraiserContext';
import { useNavigate } from 'react-router-dom';
import { GetCustomAvatar } from './CustomAvatar';
import AvatarFlame from '../assets/avatar-flame.svg';
import Settings from '../Settings';


export function AllFundraisers() {

  const navigate = useNavigate();
  const { allFundraisers, allContributors, getUSDValue } = userFundraiserContext();

  const [sort, setSort] = useState(['timestamp', 'desc']);

  const getSortedFundraisers = () => {
    const [field, order] = sort;
    let sorted;
    if (field === 'amount') {
      sorted = [...allFundraisers].sort((a, b) =>
        parseFloat(b.amount!.toString()) - parseFloat(a.amount!.toString())
      );
    } else {
      sorted = [...allFundraisers].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    }
    if (order === 'asc') {
      return sorted.reverse();
    }
    return sorted;
  }

  const onSort = (type: 'timestamp' | 'amount') => {
    if (type === sort[0]) {
      setSort([type, sort[1] === 'asc' ? 'desc' : 'asc']);
    } else {
      setSort([type, 'desc']);
    }
  }

  if (!allFundraisers.length) {
    return (
      <div className="text-center">
        <h4 className="text-lg mb-2">Loading fundraisers</h4>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  } else {
    return (
      <>
        <div className="flex flex-col space-y-4 justify-center items-center h-auto mt-4">
          {allFundraisers && (
            <>
              <div className="tabs tabs-boxed mt-4">
                <a className={'tab ' + (sort[0] === 'timestamp' ? 'tab-active' : '')} onClick={() => onSort('timestamp')}>Recent</a>
                <a className={'tab ' + (sort[0] === 'amount' ? 'tab-active' : '')} onClick={() => onSort('amount')}>Most raised</a>
              </div>

              {getSortedFundraisers().map((fundraiser, index) => (
                <div key={index} className="card bg-[#1d1d1f] shadow-lg hover cursor-pointer w-full mx-2.5 md:max-w-[620px] md:mx-auto" onClick={() => navigate(`/fundraiser/${fundraiser.id}`)}>
                  <div className="card-body">
                    <h2 className="card-title">{fundraiser.contentTextTitle}</h2>
                    <p className="text-left mb-2 whitespace-pre-line line-clamp-3 overflow-hidden">{fundraiser.contentTextBody}</p>
                    {fundraiser.contentFileIDs && fundraiser.contentFileIDs.map((fileContent, index) => (
                      <img className="w-2/5" key={index} src={Settings.IRYS_URL + fileContent} alt="" />
                    ))}
                  </div>
                  <div className="card-actions flex justify-end items-center mt-4 p-4 bg-base-100 rounded-b-lg">
                    {fundraiser.id !== -1n && (
                      <>
                        <div className="badge">Raised: {Number(getUSDValue(fundraiser.amount ? fundraiser.amount : 0n)).toFixed(4)}$</div>
                        <div className="badge">Goal: {Number(getUSDValue(fundraiser.goalAmount ? fundraiser.goalAmount : 0n)).toFixed(4)}$</div>
                      </>
                    )}
                    {fundraiser.id === -1n && (
                      <><span className="loading loading-spinner h-6 w-6"></span>Saving...</>
                    )}
                    <div
                      className="chat-image avatar self-end tooltip hover cursor-pointer"
                      data-tip={`This user has contributed $${Number(getUSDValue((allContributors.find(contributor => contributor.sender === fundraiser.sender) || {}).totalContributions || 0n)).toFixed(4)} in total`}
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
              ))}
            </>
          )}
        </div >
      </>
    );
  }
}

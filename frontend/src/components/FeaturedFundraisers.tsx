import { useEffect, useState } from 'react';
import { userFundraiserContext } from '../contexts/FundraiserContext';
import { FundraiserView } from '../Interfaces';
import Settings from '../Settings';
import { useNavigate } from 'react-router-dom';


export function FeaturedFundraisers() {

	const navigate = useNavigate();
	const { allFundraisers } = userFundraiserContext();
	const [featuredFundraiser, setFeaturedFundraiser] = useState<FundraiserView>();

	useEffect(() => {
		const init = async () => {
			setFeaturedFundraiser([...allFundraisers]
				.sort((a, b) => parseFloat(b.amount!.toString()) - parseFloat(a.amount!.toString()))[0]);
		};

		init();
	}, [allFundraisers]);

	if (!featuredFundraiser) {
		return (
			<div className="text-center">
				<h4 className="text-lg mb-2">Loading featured fundraisers</h4>
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		)
	} else {
		return (
			<>
				{allFundraisers && (
					<div className="featured my-[80px]">
						<div className="flex flex-wrap bg-black">
							<a className="bg-black relative w-full md:w-4/12 flex items-center justify-center h-72 font-heading text-white uppercase tracking-widest">
								<div className="relative z-10">
									<span className="text-gray-400">Featured fundraiser</span>
								</div>
							</a>
							<a onClick={() => navigate(`/fundraiser/${featuredFundraiser.id}`)}
								className="bg-black hover cursor-pointer relative w-full md:w-8/12 flex items-center justify-center h-72 font-heading text-white uppercase tracking-widest hover:brightness-200">
								<div className="relative z-10">
									<span className="text-gray-400">{featuredFundraiser.contentTextTitle}</span>
								</div>
								{featuredFundraiser.contentFileIDs && featuredFundraiser.contentFileIDs.map((fileContent, index) => (
									<img className="absolute inset-0 w-full h-full object-cover opacity-50" key={index} src={Settings.IRYS_URL + fileContent} alt="" />
								))}
							</a>
						</div>
					</div>
				)}
			</>
		);
	}
}

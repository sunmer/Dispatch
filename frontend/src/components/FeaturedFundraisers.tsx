import { useEffect, useState } from 'react';
import { userFundraiserContext } from '../contexts/FundraiserContext';
import { FundraiserView } from '../Interfaces';
import Settings from '../Settings';
import { useNavigate } from 'react-router-dom';


export function FeaturedFundraisers() {

	const navigate = useNavigate();
	const { allFundraisers } = userFundraiserContext();
	const [featuredFundraisers, setFeaturedFundraisers] = useState<FundraiserView[]>();

	useEffect(() => {
		const init = async () => {
			setFeaturedFundraisers([...allFundraisers]
				.sort((a, b) => parseFloat(b.amount!.toString()) - parseFloat(a.amount!.toString()))
				.slice(0, 2));
		};

		init();
	}, [allFundraisers]);

	if (!featuredFundraisers) {
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
							<a className="bg-black relative w-full md:w-auto md:flex-1 flex items-center justify-center h-72 font-heading text-white uppercase tracking-widest hover:opacity-75">
								<div className="relative z-10">
									<span className="text-gray-400">FEATURED</span>
								</div>
							</a>
							{featuredFundraisers.map((fundraiser, index) => (
								<a key={index}
									 onClick={() => navigate(`/fundraiser/${fundraiser.id}`)}
									 className="bg-black hover cursor-pointer relative w-full md:w-auto md:flex-1 flex items-center justify-center h-72 font-heading text-white uppercase tracking-widest hover:opacity-75">
									<div className="relative z-10">
										<span className="text-gray-400">{fundraiser.contentTextTitle}</span>
									</div>
									{fundraiser.contentFileIDs && fundraiser.contentFileIDs.map((fileContent, index) => (
										<img className="absolute inset-0 w-full h-full object-cover opacity-50" key={index} src={Settings.IRYS_URL + fileContent} alt="" />
									))}
								</a>
							))}
						</div>
					</div>
				)}
			</>
		);
	}
}

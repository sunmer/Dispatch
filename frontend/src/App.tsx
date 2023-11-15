import { ToastContainer } from 'react-toastify';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Profile } from './components/Profile';
import { TopNav } from "./components/TopNav"
import { AllFundraisers } from "./components/AllFundraisers"
import { CreateFundraiser } from "./components/CreateFundraiser"
import { Fundraiser } from './components/Fundraiser';
import { Signup } from './components/Signup';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import { SignupSuccess } from './components/SignupSuccess';


export const formatAddress = (address: string) => {
  return `${address.slice(0, 2)}...${address.slice(-2)}`;
}

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };

  return date.toLocaleDateString(undefined, options);
}


function App() {

  const navigate = useNavigate();

  return (
    <>
      <div id="parent">
        <TopNav />
        {(location.pathname === '/' || (location.pathname !== '/signup' && location.pathname !== '/discover' && location.pathname !== '/oauth/callback' && location.pathname !== '/create' && !location.pathname.startsWith('/profile/') && !location.pathname.startsWith('/fundraiser/'))) && (
          <div className="flex mb-[40px]">
            <div className="text-center mx-auto inline-block">
              <h1 className="text-5xl max-w-3xl font-bold tracking-tight pb-2 mt-6 mx-auto bg-clip-text text-transparent bg-gradient-to-r from-[#ed4e50] to-[#d926a9] font-extrabold hover cursor-pointer">
                Fundraising for content creators
              </h1>
              <div className="rotating-text text-2xl leading-tight mb-[40px]">
                <div className="hidden md:block">
                  <p className="custom-font text-white">Dispatch allows creators to fundraise for</p>
                  <span className="font-bold">
                    <div className="inner text-left">
                      community projects<br />
                      educational content<br />
                      digital art<br />
                      research<br />
                    </div>
                  </span>
                </div>
                <div className="md:hidden">
                  <p className="custom-font text-white">Dispatch allows creators to fundraise in web3</p>
                </div>
              </div>

              <div className="flex flex-col space-y-4 lg:space-x-4 lg:space-y-0 lg:flex-row lg:items-center">
                <div className="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg mt-[60px] mx-auto">
                  <div className="flex justify-center lg:justify-start -mt-16">
                    <img className="w-20 h-20 object-cover rounded-full border-2 border-indigo-500" src="https://images.unsplash.com/photo-1628359355624-855775b5c9c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=334&q=80" />
                  </div>
                  <div>
                    <h2 className="text-gray-800 text-3xl font-semibold">For Creators</h2>
                    <p className="mt-2 text-gray-600 mb-5">Jumpstart your project by accepting web3 donations. No technical experience or wallet needed.</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/signup')}>
                      Sign up as a creator
                    </button>
                  </div>
                </div>

                <div className="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg !mt-[60px] mx-auto">
                  <div className="flex justify-center lg:justify-end -mt-16">
                    <img className="w-20 h-20 object-cover rounded-full border-2 border-indigo-500" src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=334&q=80" />
                  </div>
                  <div>
                    <h2 className="text-gray-800 text-3xl font-semibold">For Fans</h2>
                    <p className="mt-2 text-gray-600 mb-5">Support & engage with your favorite creators. Earn badges and get in early on promising projects.</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/discover')}>
                      Discover fundraisers
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth/callback" element={<SignupSuccess />} />
          <Route path="/profile/:publicAddress" element={<Profile />} />
          <Route path="/" element={<AllFundraisers />} />
          <Route path="/discover" element={<AllFundraisers />} />
          <Route path="/create" element={<CreateFundraiser />} />
          <Route path="/fundraiser/:fundraiserId" element={<Fundraiser />} />
        </Routes>

        <ToastContainer theme="dark" />
      </div>

      <div className="mt-[120px] bg-gray-900 text-white text-opacity-40 font-semibold uppercase text-xs tracking-widest bg-opacity-80 px-12">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 text-center lg:text-left py-12">
          <div>
            <div className="font-display text-white uppercase text-sm tracking-widest mb-6">
              Helpful Links
            </div>
            <a href="/about" className="block mb-4">
              About
            </a>
            <a href="https://twitter.com/web3pushers" className="block mb-4">
              Twitter
            </a>
            <a href="https://www.dispatch.bio" className="block mb-4">
              Dispatch.bio
            </a>
          </div>
          <div>
            <div className="font-display text-white uppercase text-sm tracking-widest mb-6">
              More
            </div>
            <a href="/about" className="block mb-4">
              Contact
            </a>
            <a href="https://github.com/sunmer/dispatch" className="block mb-4">
              Github
            </a>
          </div>
        </div>
        <div className="text-sm lg:text-base text-center font-heading font-light tracking-widest uppercase text-white opacity-75 pb-12">
          ©2023 Dispatch
        </div>
      </div>
    </>
  )
}

export default App
import { parseAbiItem } from "viem";

// Fundraiser fetched from the contract's state
export interface FundraiserBlockchain {
  id: bigint;
  sender: string;
  content: string;
  amount: bigint;
  goalAmount: bigint;
  deadline: bigint;
}

export interface BlockchainComment {
  id: bigint;
  sender: string;
  content: string;
  fundraiserId: bigint;
}

export const EventFundraiserCreated = parseAbiItem('event FundraiserCreated(uint256 indexed id,address indexed sender,string content,uint256 goalAmount,uint256 deadline,uint256 timestamp)')

export const EventCommentCreated = parseAbiItem('event CommentCreated(uint256 indexed id,uint256 indexed fundraiserId,address indexed sender,string content,uint256 timestamp)')

export const EventContributionCreated = parseAbiItem('event Contribution(uint256 indexed fundraiserId,address indexed sender,uint256 amount,uint256 timestamp)')

// PledgeClaimed event data
export interface TipClaimedEvent {
  id: bigint; // or string
  claimer: string;
  amount: bigint;
}

// Combined Fundraiser for the frontend, containing potential extra fields
export interface FundraiserView extends FundraiserBlockchain {
  timestamp: bigint; // Block timestamp
  txHash: string;
  comments?: CommentView[];

  contentTextTitle?: string;
  contentTextBody?: string;
  contentFileIDs?: string[];
}

export interface CommentView extends BlockchainComment {
  timestamp: bigint; // Block timestamp
  
  textContent?: string;
  contentFileIDs?: string[];
}


export interface ContributorView {
  sender: string;
  totalContributions: bigint;
  contributions: any[];
}

// Price data remains unchanged
export interface PriceData {
  amount: string;
  currency: string;
}

export interface UploadResponse {
  id: string;
  public: string;
  signature: string;
  deadlineHeight: number;
  validatorSignatures: {
      address: string;
      signature: string;
  }[];
  timestamp: number;
  version: "1.0.0";
  verify: () => Promise<boolean>;
}

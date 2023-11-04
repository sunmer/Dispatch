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

export interface CommentBlockchain {
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
  timestamp?: bigint; // Block timestamp
  txHash?: string;
  comments?: CommentView[];

  contentTextTitle?: string;
  contentTextBody?: string;
  contentFileIDs?: string[];
}

export interface CommentView extends CommentBlockchain {
  timestamp: bigint; // Block timestamp
  
  contentTextBody?: string;
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

export const MULTICALL_POLYGON = [
  "struct Call { address target; bytes callData; }",
  "struct Call3 { address target; bool allowFailure; bytes callData; }",
  "struct Call3Value { address target; bool allowFailure; uint256 value; bytes callData; }",
  "struct Result { bool success; bytes returnData; }",
  "function aggregate(Call[] calldata calls) public payable returns (uint256 blockNumber, bytes[] memory returnData)",
  "function aggregate3(Call3[] calldata calls) public payable returns (Result[] memory returnData)",
  "function aggregate3Value(Call3Value[] calldata calls) public payable returns (Result[] memory returnData)",
  "function blockAndAggregate(Call[] calldata calls) public payable returns (uint256 blockNumber, bytes32 blockHash, Result[] memory returnData)",
  "function getBasefee() view returns (uint256 basefee)",
  "function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)",
  "function getBlockNumber() view returns (uint256 blockNumber)",
  "function getChainId() view returns (uint256 chainid)",
  "function getCurrentBlockCoinbase() view returns (address coinbase)",
  "function getCurrentBlockDifficulty() view returns (uint256 difficulty)",
  "function getCurrentBlockGasLimit() view returns (uint256 gaslimit)",
  "function getCurrentBlockTimestamp() view returns (uint256 timestamp)",
  "function getEthBalance(address addr) view returns (uint256 balance)",
  "function getLastBlockHash() view returns (bytes32 blockHash)",
  "function tryAggregate(bool requireSuccess, Call[] calldata calls) public payable returns (Result[] memory returnData)",
  "function tryBlockAndAggregate(bool requireSuccess, Call[] calldata calls) public payable returns (uint256 blockNumber, bytes32 blockHash, Result[] memory returnData)",
] as const
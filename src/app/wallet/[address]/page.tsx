"use client";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getOwnedNFTs } from "thirdweb/extensions/erc1155";
import { getContract, createThirdwebClient, prepareContractCall, sendTransaction, NFT } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { clientId, allow_list } from "@/app/const/constants";
import { Container } from "@/app/components/Container";
import { ThirdwebNftMedia } from "@thirdweb-dev/react";
import { useActiveAccount } from "thirdweb/react";
import { Badge } from "@/app/components/v0/badge";
import { Button } from "@/app/components/v0/button";
import { Card, CardContent } from "@/app/components/v0/NFT/card";
import Link from "next/link";
import { WalletId, createWallet, injectedProvider } from "thirdweb/wallets";
import { get_wallet_id } from "@/app/const/utils";
import Image from "next/image";

function CopyIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TickIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function WalletPage({ params }: { params: { address: string } }) {
  const searchParams = useSearchParams();
  const nftParam = searchParams.get("nft");
  const nft = nftParam ? JSON.parse(decodeURIComponent(nftParam)) : null;

  const [nfts, setNfts] = useState<(NFT & { quantityOwned: bigint })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeAccount = useActiveAccount();

  const client = createThirdwebClient({
    clientId: "6f548b049f47f192d385041415b48f24",
  });

  const contractAddress = "0x5dabeEBc71B75fb9681D67CC4aeB654c6c858126";
  const contract = getContract({
    client,
    chain: baseSepolia,
    address: contractAddress,
  });

  useEffect(() => {
    if (params.address) {
      fetchNFTs(params.address);
    }
  }, [params.address]);

  const fetchNFTs = async (walletAddress: string) => {
    const ownedNFTs = await getOwnedNFTs({
      contract,
      start: 0,
      count: 10,
      address: walletAddress,
    });
    console.log("Owned NFTs:", ownedNFTs);
    setNfts(ownedNFTs);
  };

  const claimToken = async () => {
    setIsLoading(true);
    const client = createThirdwebClient({ clientId });

    let wallet_type: WalletId = (await get_wallet_id()) as WalletId;
    const metamask = createWallet(wallet_type);

    if (injectedProvider(wallet_type)) {
      let _account = await metamask.connect({ client });
      const tx = prepareContractCall({
        contract,
        method:
          "function claim(address _receiver, uint256 _tokenId,  uint256 _quantity, address _currency, uint256 _pricePerToken, (bytes32[],uint256,uint256,address) _allowlistProof, bytes _data) public",
        params: [
          params.address,
          0n,
          1n,
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          0n,
          allow_list,
          "0x",
        ],
      } as any);

      const transactionResult = await sendTransaction({
        transaction: tx,
        account: _account,
      });

      console.log("transactionResult", transactionResult);
      await fetchNFTs(params.address);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(params.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Container className="flex flex-col items-center p-4 md:p-8">
        <div className="flex flex-col w-full md:flex-row  md:max-w-5xl md:space-x-8">
          <div className="md:flex-shrink-0 bg-gray-300 rounded-lg mx-auto  mb-4 md:mb-0 h-full">
            {nft ? (
              <ThirdwebNftMedia metadata={nft.metadata} className="w-full rounded-lg" style={{ objectFit: 'cover' }}/>
            ) : (
              <Image src="/placeholder.svg" alt="NFT Image" className="w-full h-full rounded-lg" />
            )}
          </div>
          <div className="flex flex-col md:w-full p-4 bg-white rounded-lg shadow dark:bg-gray-800 mx-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg font-medium dark:text-gray-200">
                  {params.address.slice(0, 6)}...{params.address.slice(-4)}
                </span>
                <Button variant="outline" size="sm" className="mx-4" onClick={handleCopy}>
                  {copied ? <TickIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
              <Link href={`https://sepolia.basescan.org/address/${params.address}`} target="_blank">
                <Button variant="default" className="bg-purple-500 text-white md:block hidden">
                  View on Explorer
                </Button>
              </Link>
            </div>
            <div className="flex items-center mt-3 space-x-2">
              <Badge variant="default">Collectibles</Badge>
              <Badge variant="default">Assets</Badge>
            </div>
            {nfts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {nfts.map((nft, idx) => (
                  <NFTCard key={idx} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground dark:text-gray-400">No NFTs in this account.</p>
                <Button
                  onClick={claimToken}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Claiming..." : "Claim ERC1155 Token"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

function NFTCard({ nft }: { nft: NFT }) {
  return (
    <Card className="md:max-w-40 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-lg">
      <CardContent className="p-0">
      <ThirdwebNftMedia metadata={{...nft.metadata, id: nft.id.toString()}} className="max-h-36 mx-auto rounded-t-md" style={{ objectFit: 'cover' }} />
      </CardContent>
      <div>
        <CardContent className="flex flex-col items-start p-2 space-y-2">
          <div className="flex justify-between w-full">
            <div className="text-sm font-semibold">{nft.metadata.name}</div>
            <Badge variant="outline">#{nft.id.toString()}</Badge>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

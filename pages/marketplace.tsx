import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import axios from 'axios';
import DefaultLayout from '@/layouts/default';
import { Link } from '@nextui-org/react';
import { Snippet, Code } from '@nextui-org/react';
import { Button, Input, Spacer } from '@nextui-org/react';

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";

 // Aggiunto Modal
import {Card, CardHeader, CardBody, CardFooter, Image,Divider} from "@nextui-org/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/react";
import { button as buttonStyles } from '@nextui-org/react';
import { siteConfig } from '@/config/site';
import { title, subtitle } from '@/components/primitives';
import { GithubIcon } from '@/components/icons';

import NFTCollectionABI from '../engine/NFTCollection.json';
import ERC20ABI from '../engine/ERC20.json'; // Import the ERC20 ABI
import { puztoken, testnftcol, testnet, cipherEth, simpleCrypto } from '../engine/configuration';

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

interface INFT {
  name: string;
  img: string;
  tokenId: number;
  wallet: string;
  desc: string;
}

interface LotDetail {
  id: number;
  pieceIds: number[];
  price: number;
  isRevealed: boolean;
  hasJolly: boolean;
  isSold: boolean;
}
function formatUserString(user: string): string {
	// Controllo se la stringa è abbastanza lunga da essere troncata
	if (user.length > 12) {
	  // Estraggo i primi 6 caratteri
	  const start = user.substring(0, 6);
	  // Estraggo gli ultimi 6 caratteri
	  const end = user.substring(user.length - 6);
	  // Combino le parti con i tre puntini in mezzo
	  return `${start}...${end}`;
	} else {
	  // Se la stringa è più corta di 12 caratteri, la restituisco intera
	  return user;
	}
  }
const IndexPage = () => {
  const [user, setUser] = useState<string>("");
  const [resalePrice, setResalePrice] = useState<{ price: string }>({ price: '' });
  const [nfts, setNfts] = useState<INFT[]>([]);
  const [loadingState, setLoadingState] = useState<'not-loaded' | 'loaded'>('not-loaded');
  const [claimableStatus, setClaimableStatus] = useState<{ [key: number]: boolean }>({});
  
  useEffect(() => {
    connectUser();
    getWalletNFTs();
    getClaimableNFTs();
  }, [setNfts, setUser, setClaimableStatus,user]);

  const [selectedTokenId, setSelectedTokenId] = useState<string>('');


  const router = useRouter();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const [lotDetails, setLotDetails] = useState<LotDetail[]>([]); // Stato per memorizzare i dettagli dei lotti per il token selezionato
  const [jollyCount, setJollyCount] = useState<number>(0);  // Nuovo stato per jollyCount
  

  async function connectUser() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      setUser(account);
      console.log(account);
    }
  }

  const handleCreateLotClick = async (tokenId: any) => {
    setSelectedTokenId(tokenId);
    console.log("handleCreateLotClick ", tokenId); // Memorizza il tokenID selezionato nello stato
    
  
    const provider = new ethers.providers.JsonRpcProvider(testnet);
    const key = simpleCrypto.decrypt(cipherEth);
    const wallet = new ethers.Wallet(key as string, provider);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);
  
    const lotCount = await contract.getLotCount(tokenId);
    console.log("lotCount:---->>>> ", lotCount.toNumber());
    const lotDetailsPromises = [];
    for (let i = 0; i < lotCount.toNumber(); i++) {

      console.log("i:---->>>> ", i);
      lotDetailsPromises.push(contract.getLotDetailsByTokenIdAndLotId(tokenId, i+1));

    }
    const lotDetails = await Promise.all(lotDetailsPromises);
    console.log("lotDetails:---->>>> ", lotDetails);
    const formattedLots: LotDetail[] = lotDetails.map((lot: any) => ({
      
      id: lot.id.toNumber(),
      pieceIds: lot.pieceIds.map((pieceId: any) => pieceId.toNumber()),
      price: parseFloat(ethers.utils.formatUnits(lot.price, 'ether')), 
      isRevealed: lot.isRevealed,
      hasJolly: lot.hasJolly,
      isSold: lot.isSold,
    }));
    console.log("formattedLots:---->>>> ", formattedLots);
    setLotDetails(formattedLots);
    onOpen(); // Apre il modal
    console.log("DOPO:---->>>> ");
  };
  


  async function getClaimableNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(testnet);
    const key = simpleCrypto.decrypt(cipherEth);
    const wallet = new ethers.Wallet(key as string, provider);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);
    const itemArray: INFT[] = [];
    const totalSup = await contract.totalSupply();
    console.log("totalSup: in CLAIMABLE----->", totalSup.toNumber());
    const claimableStatuses: { [key: number]: boolean } = {};
    
    // Create signer for calling isClaimable
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const contractWithSigner = new ethers.Contract(testnftcol, NFTCollectionABI, signer);
      const jcount = await contractWithSigner.jollyCount(signer);
      setJollyCount(jcount);
  
      for (let i = 0; i < totalSup.toNumber(); i++) {
        const token = i + 1;
        console.log("token: in CLAIMABLE----->", token);
        try {

  
          const isClaimable = await contractWithSigner.isClaimable(token);
          console.log("isClaimable: in CLAIMABLE----->", isClaimable);
          claimableStatuses[token] = isClaimable;
        } catch (error) {
          console.error("Error fetching NFT or metadata", error);
        }
      }
    }
    console.log("claimableStatuses: in CLAIMABLE----->", claimableStatuses);
    setClaimableStatus(claimableStatuses);
    
    setLoadingState('loaded');
  }

  async function getWalletNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(testnet);
    console.log("provider:----->",provider);
    const key = simpleCrypto.decrypt(cipherEth);
    console.log("key:----->",key);
    const wallet = new ethers.Wallet(key as string, provider);
    console.log("wallet:----->",wallet);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);
    console.log("contract:----->",contract);

    const itemArray: INFT[] = [];
    const totalSup = await contract.totalSupply();
    console.log("totalSup:----->",totalSup.toNumber());
    
    for (let i = 0; i < totalSup.toNumber(); i++) {
      const token = i + 1;
      try {
        console.log("token:----->",token);
        const owner = await contract.ownerOf(token);
        const cleanUri = await contract.tokenURI(token);
        console.log("cleanUri:----->",cleanUri);
       // const cleanUri = rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        const metadata = await axios.get(cleanUri);
        const { name, description: desc, image: img } = metadata.data;
        itemArray.push({ name, img, tokenId: token, wallet: owner, desc });

      } catch (error) {
        console.error("Error fetching NFT or metadata", error);
      }
    }
    console.log("itemArray:----->",itemArray);
  
    setNfts(itemArray);
    
    setLoadingState('loaded');
  }

  const buyLot = async (puzzleId: number, lotId: number) => {
    console.log("buyLot:----->");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const erc20Contract = new ethers.Contract(puztoken, ERC20ABI, signer);
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);

      const lotprice = await  contract.getLotPriceByTokenIdAndLotId(puzzleId,lotId);
      console.log("lotPrice: ", ethers.utils.formatUnits(lotprice, 'ether'));

      // Check the allowance
      const allowance = await erc20Contract.allowance(user, testnftcol);
      console.log("allowance:----->", ethers.utils.formatUnits(allowance, 'ether'));
  
      if (allowance.lt(lotprice)) {
        console.log("lotPrice:----->", ethers.utils.formatUnits(lotprice, 'ether'));
        // Approve the NFT contract to spend tokens
        const approveTx = await erc20Contract.approve(testnftcol, lotprice);
        await approveTx.wait();
      }

      const transaction = await contract.buyLot(puzzleId, lotId);

      await transaction.wait();
      alert('Lot purchased successfully!');

      // Update the lotDetails state to reflect the purchase
      setLotDetails((prevLotDetails) =>
        prevLotDetails.map((lot) =>
          lot.id === lotId ? { ...lot, isSold: true } : lot
        )
      );
    } catch (error) {
      console.error('Error buying lot:', error);
      alert('Error buying lot. Please check the console for details.');
    }
  }; 

  const claimNFT = async (tokenId: number) => {
    console.log("claimNFT:----->");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);

      const transaction = await contract.claimNFT(tokenId);
      await transaction.wait();
      console.log('NFT claimed successfully!');
    } catch (error) {
      console.error('Error claiming NFT:', error);
      console.log('Error claiming NFT. Please check the console for details.');
    }
  };
  const claimNFTWithJolly = async (tokenId: number) => {
    console.log("claimNFT:----->");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);

      const transaction = await contract.claimNFTWithJolly(tokenId);
      await transaction.wait();
      console.log('NFT claimed successfully! with jolly');
    } catch (error) {
      console.error('Error claiming NFT:', error);
      console.log('Error claiming NFT. Please check the console for details.');
    }
  };
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
				<div className="inline-block max-w-lg text-center justify-center">
					<h1 className={title()}>Marketplace&nbsp;</h1>
					<h1 className={title({ color: "violet" })}>Puzzle&nbsp;</h1>
					<h4 className={subtitle({ class: "mt-4" })}>
						Best NFT Puzzle Marketplace
					</h4>
				</div>
			</section>
            <div>
           
    </div>
  
     <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nfts.map((nft) => 
            <Card className="justify-center items-center py-0" key={nft.tokenId} isHoverable isPressable>
                <CardHeader className=" pb-0 pt-2 px-4 flex-col items-start">
                    <p className="text-tiny uppercase font-bold">{nft.name}</p>
                    <small className="text-default-500">{nft.desc}</small>
                    <h4 className="font-bold text-large">Puzzle ID: {nft.tokenId}</h4>
                    
                    <small className="text-default-500">Owner: {formatUserString(nft.wallet)}</small>
                </CardHeader>
              <CardBody>
                <Image
                  src={nft.img}       
                  width="100%"
                  alt={nft.name}
                />
              </CardBody>
              <CardFooter className="space-x-12 mb-5  w-full flex justify-between">
              
                <Button color="primary" variant="ghost"
                onClick={() => handleCreateLotClick(nft.tokenId)} >
                  Buy Lots
                </Button>   
                {claimableStatus[nft.tokenId] && jollyCount>0 && (
                  <Button color="warning" variant="ghost"
                    onClick={() => claimNFTWithJolly(nft.tokenId)}>
                    Claim With Jolly
                  </Button>
               
                )}
                {claimableStatus[nft.tokenId] && (
                  <Button color="warning" variant="ghost"
                    onClick={() => claimNFT(nft.tokenId)}>
                    Claim
                  </Button>
               
                )}
                 
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent style={{ width: '120%' }}> 
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Lots Token - {selectedTokenId}</ModalHeader>
              <ModalBody>
              <div className="grid grid-cols-6 gap-4 mb-1 p-2 border-b border-gray-200">
                  <div>Lot N</div>
                  <div>Price</div>
                  <div>Piece</div>
                  <div>Jolly</div>
                  <div></div>
                </div>
                {lotDetails.map((lot) => (
                  <div key={lot.id} className="flex justify-center grid grid-cols-6 gap-4 mb-2 p-2 border-gray-200">
                    <div>{lot.id}</div>
                    
                    <div>{lot.price}</div>
                    <div>{lot.isRevealed ? lot.pieceIds.join(', ') : 'Hidden'}</div>
                    <div>{lot.hasJolly ? 'Yes' : 'No'}</div>
                    <div className="flex justify-center mt-[-8px]">{lot.isSold ? 'Already Sold' : <Button  color="primary" variant="ghost"
              //  onClick={() => handleCreateLotClick(nft.tokenId)} 
              onClick={() => buyLot(Number(selectedTokenId), lot.id)}
              >
                  Buy Lot n.{lot.id} 
                </Button> }</div>
                    
                  </div>
                  
                ))}
              </ModalBody>
              <ModalFooter>
              <div className="flex justify-center w-full">
              <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                </div>

              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
		</DefaultLayout>
	);
};

export default IndexPage;

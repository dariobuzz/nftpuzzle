import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { ethers } from 'ethers';
import axios from 'axios';
import DefaultLayout from '@/layouts/default';
import { Button } from '@nextui-org/react';
import { BigNumber } from "ethers";
import { Card, CardHeader, CardBody, CardFooter, Image } from "@nextui-org/react";
import NFTCollectionABI from '../engine/NFTCollection.json';

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import ERC20ABI from '../engine/ERC20.json'; // Import the ERC20 ABI
import { puztoken, testnftcol, testnet, cipherEth, simpleCrypto } from '../engine/configuration';
import styles from '@/styles/puzzle.module.css';
//https://fuchsia-select-junglefowl-195.mypinata.cloud/ipfs/bafybeihh3en4jxzd2xhsbwoywttypn6dfpknk33cfhuriufqfr6ztmiara/
declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}
interface LotDetail {
  id: number;
  pieceIds: number[];
  price: number;
  isRevealed: boolean;
  hasJolly: boolean;
  isSold: boolean;
}

interface IAttribute {
  trait_type: string;
  value: string;
}

interface INFT {
  name: string;
  img: string;
  tokenId: number;
  wallet: string;
  desc: string;
  attributes: IAttribute[];  // Nuovo campo per gli attributi
  width?: number;
  height?: number;
}

const IndexPage = () => {
  const [user, setUser] = useState<string>("");
  const [nfts, setNfts] = useState<INFT[]>([]);
  const [loadingState, setLoadingState] = useState<'not-loaded' | 'loaded'>('not-loaded');
  const [revealedPieces, setRevealedPieces] = useState<{ [tokenId: number]: boolean[] }>({});
  const [lastRevealedPiece, setLastRevealedPiece] = useState<{ [tokenId: number]: number | null }>({});
  const [claimableStatus, setClaimableStatus] = useState<{ [key: number]: boolean }>({});
  const [puzTokenBalance, setPuzTokenBalance] = useState<string>("0");

  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);


  const router = useRouter();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const [lotDetails, setLotDetails] = useState<LotDetail[]>([]); // Stato per memorizzare i dettagli dei lotti per il token selezionato
  const [jollyCount, setJollyCount] = useState<number>(0);  // Nuovo stato per jollyCount
  

/*
  useEffect(() => {
    connectUser();
  }, []); // Esegue la connessione una sola volta al montaggio del componente
  */

  
  useEffect(() => {
    const savedUser = localStorage.getItem("userAddress");
  console.log("savedUser: ", savedUser);
    if (savedUser && ethers.utils.isAddress(savedUser)) {
      console.log("if savedUser: ", savedUser);
      setUser(savedUser);
      
      setIsConnected(true);

    }
  }, []);

  useEffect(() => {
    if(user) {
      getWalletNFTs();
      getClaimableNFTs();
      getPuzTokenBalance(user);
    }
  }, [user]); // Esegue il recupero degli NFT quando 'user' è stato impostato

 
  
  const getPuzTokenBalance = async (userAddress: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const puzTokenContract = new ethers.Contract(puztoken, ERC20ABI, signer);
      const balance: BigNumber = await puzTokenContract.balanceOf(userAddress);
      const formattedBalance = ethers.utils.formatUnits(balance, 18); // Assumendo 18 decimali
      setPuzTokenBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching PuzToken balance:", error);
    }
  };
  
    async function connectUser() {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to connect.");
        return;
      }
    
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    
      try {
        // Richiedi l'accesso all'account
        await provider.send("eth_requestAccounts", []);
    
        // Controlla la rete corrente
        const chainId = await provider.send("eth_chainId", []);
       // const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Chain ID della rete Sepolia
    
       const ARBITRUM_CHAIN_ID = "0xa4b1"; // Chain ID della rete Arbitrum One
       const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Chain ID della rete Sepolia
  
      if (chainId !== SEPOLIA_CHAIN_ID) {
          try {
            // Guida l'utente a cambiare rete
            await provider.send("wallet_switchEthereumChain", [
              { chainId: SEPOLIA_CHAIN_ID },
            ]);
            //alert("Switched to Sepolia network.");
          } catch (switchError) {
            console.error("Error switching network:", switchError);
            if ((switchError as any).code === 4902) {
              alert(
                "Arbitrum  network is not available in MetaMask. Please add it manually."
              );
            } else {
              alert(
                "Failed to switch to the Arbitrum  network. Please switch it manually in MetaMask."
              );
            }
            return;
          }
        }
    
        const signer = provider.getSigner();
        const account = await signer.getAddress();
    
        if (account && ethers.utils.isAddress(account)) {
          setUser(account);
          setIsConnected(true);
          localStorage.setItem("userAddress", account);
             // Recupera il saldo di PuzToken
      await getPuzTokenBalance(account);
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    }
    
  
    const disconnectUser = () => {
      setUser("");
      setIsConnected(false);
      localStorage.removeItem("userAddress");
    };
  
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
    if (!user) return;  // Esce se l'utente non è connesso
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
      const userAddress = await signer.getAddress();  // Ottieni l'indirizzo utente
      console.log("userAddress: in CLAIMABLE----->", userAddress);
      const jcount = await contractWithSigner.jollyCount(userAddress);  // Passa l'indirizzo, non il signer
      setJollyCount(jcount.toNumber());
      console.log("jcount: in CLAIMABLE----->", jcount);

  
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

  async function getWalletNFTs() {
    if (!user) return; // Assicurati che l'utente sia connesso
  
    const provider = new ethers.providers.JsonRpcProvider(testnet);
    const key = simpleCrypto.decrypt(cipherEth);
    const wallet = new ethers.Wallet(key as string, provider);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);
  
    const itemArray: INFT[] = [];
    const totalSup = await contract.totalSupply();
    
    for (let i = 0; i < totalSup.toNumber(); i++) {
      const token = i + 1;
      try {
        const owner = await contract.ownerOf(token);
        // Recupera le informazioni del puzzle per il token corrente
        const [puzzleId, puzzleOwner, pieceOwners]: [any, string, string[]] = await contract.getPuzzle(token);
  
        // Determina per ogni pezzo se è posseduto dall'utente connesso
        const userPieces = pieceOwners.map((owner: string) => owner.toLowerCase() === user.toLowerCase());
  
        const cleanUri = await contract.tokenURI(token);
        const metadata = await axios.get(cleanUri);
        const { name, description: desc, image: img, attributes } = metadata.data;
  
        let width, height;
        // Estrae le dimensioni dalla proprietà "Misure"
        for (let attr of attributes) {
          if (attr.trait_type === "Misure") {
            const match = attr.value.match(/(\d+)[xX](\d+)/);
            if(match) {
              width = parseInt(match[1]);
              height = parseInt(match[2]);
            }
            break;
          }
        }
  
        // Aggiungi l'NFT all'array, indipendentemente dalla proprietà dei pezzi
        itemArray.push({ name, img, tokenId: token, wallet: puzzleOwner, desc, attributes, width, height });
  
        // Imposta lo stato dei pezzi rivelati in base ai pezzi posseduti dall'utente
        setRevealedPieces(prev => ({ 
          ...prev, 
          [token]: userPieces 
        }));
      } catch (error) {
        console.error("Error fetching NFT or metadata", error);
      }
    }
    
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
 

         // Aggiorna i dati dopo l'acquisto
    await getWalletNFTs(); 
    // Se necessario, aggiorna anche altri stati come claimableStatus o jollyCount qui

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
  const revealPiece = async (tokenId: number) => {
    // Passo 1: Rivelare tutti e 9 i pezzi in ordine casuale con 250ms di intervallo
  
    // Crea manualmente un array di indici da 0 a 8
    const indices: number[] = [];
    for (let i = 0; i < 9; i++) {
      indices.push(i);
    }
  
    // Mescola l'array degli indici utilizzando l'algoritmo di Fisher-Yates
    for (let k = indices.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      const temp = indices[k];
      indices[k] = indices[j];
      indices[j] = temp;
    }
  
    // Rivelare ogni pezzo secondo l'ordine casuale con 250ms di intervallo
    for (let m = 0; m < indices.length; m++) {
      const randomIndex = indices[m];
      setRevealedPieces(prev => {
        const currentPieces = prev[tokenId] ? [...prev[tokenId]] : Array(9).fill(false);
        currentPieces[randomIndex] = true; // Rivela il pezzo alla posizione casuale
        return {
          ...prev,
          [tokenId]: currentPieces
        };
      });
      await new Promise(resolve => setTimeout(resolve, 350)); 
    }
  
    // Passo 2: Far lampeggiare tutti i pezzi on/off 5 volte con intervalli di 100ms
    for (let j = 0; j < 5; j++) {
      // Spegni tutti i pezzi
      setRevealedPieces(prev => ({
        ...prev,
        [tokenId]: Array(9).fill(false)
      }));
      await new Promise(resolve => setTimeout(resolve, 100));
  
      // Accendi tutti i pezzi
      setRevealedPieces(prev => ({
        ...prev,
        [tokenId]: Array(9).fill(true)
      }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  
    // Passo 3: Lascia tutti i pezzi accesi per 3000ms, poi spegnili definitivamente
    setRevealedPieces(prev => ({
      ...prev,
      [tokenId]: Array(9).fill(true)
    }));
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    // Spegni definitivamente tutti i pezzi
    setRevealedPieces(prev => ({
      ...prev,
      [tokenId]: Array(9).fill(false)
    }));
  };
  
  
  

  const PuzzlePiece = ({
    imgSrc,
    pieceIndex,
    isRevealed,
  }: {
    imgSrc: string;
    pieceIndex: number;
    isRevealed: boolean;
  }) => {
    const gridSize = 3; // Griglia 3x3
    const row = Math.floor(pieceIndex / gridSize);
    const col = pieceIndex % gridSize;
  
    return (
      <div
        className={`puzzle-piece ${isRevealed ? "visible" : ""}`}
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: `${gridSize * 100}%`,  
          backgroundPosition: `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`,
          opacity: isRevealed ? 1 : 0.6,
          filter: isRevealed ? "none" : "blur(1px) grayscale(90%)",
          transition: "opacity 0.5s ease-in-out, filter 0.5s ease-in-out",
          width: '100%',
          height: '100%',
        }}
      ></div>
    );
  };
  
  
  
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1>NFT Puzzle Marketplace</h1>
          <h4>Best NFT Puzzle Marketplace</h4>
        </div>
      </section>
      {!isConnected ? (
  <div className="flex flex-col items-center justify-center mt-1">
    <Button onClick={connectUser}>
      Connect
    </Button>
  </div>
) : (
  <div className="flex justify-between items-center w-full">
    {/* Sezione Saldo PuzToken */}
    <div className="flex items-center space-x-2">
      <span style={{ fontWeight: 'bold', color: 'white' }}>Balance:</span>
      <span>{puzTokenBalance}</span>
      <span style={{ color: 'white' }}>Usdt</span>
    </div>
    
    {/* Bottone Disconnect */}
    <Button onClick={disconnectUser} style={{ fontSize: '1em' }}>
      Disconnect: {formatUserString(user)}
    </Button>
  </div>
)}


      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <Card className="justify-center items-center py-0" key={nft.tokenId} isHoverable isPressable>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold">{nft.name} - ID: {nft.tokenId}</p> 
              <small className="text-default-500">Owner: {formatUserString(nft.wallet)}</small>            
              <div className="attributes-grid mt-2">
                {nft.attributes.map((attr, idx) => (
                  <p key={idx} className="attribute text-xs">
                    <strong>{attr.trait_type}</strong><br />
                    {attr.value}
                  </p>
                ))}
              </div>

            </CardHeader>

             
            <CardBody>
              <div 
                className="puzzle-container" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '5px',
                  width: '100%',  // Occupa tutta la larghezza disponibile
                  aspectRatio: nft.width && nft.height ? `${nft.width} / ${nft.height}` : '1 / 1',
                }}
              >
                {revealedPieces[nft.tokenId]?.map((isRevealed, pieceIndex) => (
                  <PuzzlePiece 
                    key={pieceIndex} 
                    imgSrc={nft.img} 
                    pieceIndex={pieceIndex} 
                    isRevealed={isRevealed} 
                  />
                ))}
              </div>
            </CardBody>




              <CardFooter className="flex justify-center items-center space-x-12 mb-5 ">
              <Button onClick={() => revealPiece(nft.tokenId)}>
  Reveal Random Piece
</Button>

              </CardFooter>
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
          ))}
        </div>
      </div>

      <style jsx>{`
        .puzzle-container {
          width: 100%;
          aspect-ratio: 1;
        }
        .puzzle-piece {
          background-size: 300%; /* Scegli la dimensione desiderata */
          background-repeat: no-repeat;
          width: 100%;
          aspect-ratio: 1;
          opacity: 0.2;
          transition: opacity 0.5s ease-in-out;
        }
        .puzzle-piece.visible {
          opacity: 1;
          filter: none;
        }
      `}</style>
      <style jsx>{`
  .attributes-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 colonne uguali */
    gap: 2px; /* Spaziatura tra le celle, regolabile secondo necessità */
  }

  .attribute {
    margin: 0;
    padding: 0;
  }
`}</style>
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

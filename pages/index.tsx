import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { ethers } from 'ethers';
import axios from 'axios';
import DefaultLayout from '@/layouts/default';
import { Button} from '@nextui-org/react';

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
  owner?: string; // Nuovo campo per salvare l'indirizzo del possessore del lotto
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
  userPieces: boolean[]; // Nuovo campo: array dei pezzi posseduti dall'utente
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

  // Esegui il fetch dei dati NFT al mount
useEffect(() => {
  getWalletNFTs();
  getClaimableNFTs();
}, []);

// Recupera il saldo solo se l'utente è connesso
useEffect(() => {
  if (user) {
    getPuzTokenBalance(user);
  }
}, [user]);

/*
  useEffect(() => {
    // Se l'utente è connesso, esegui periodicamente il refresh dei dati ogni 2 secondi
    const interval = setInterval(() => {
      if (user) {
        getWalletNFTs();
        getClaimableNFTs();
        getPuzTokenBalance(user);
      }
    }, 2000);
  
    return () => clearInterval(interval); // Pulisci l'intervallo al dismount del componente
  }, [user]);
  
  */
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
    
       const POLYGON_CHAIN_ID = "0x89"; // Chain ID della rete Arbitrum One
       const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Chain ID della rete Sepolia
  
      if (chainId !== POLYGON_CHAIN_ID) {
          try {
            // Guida l'utente a cambiare rete
            await provider.send("wallet_switchEthereumChain", [
              { chainId: POLYGON_CHAIN_ID },
            ]);
            //alert("Switched to Sepolia network.");
          } catch (switchError) {
            console.error("Error switching network:", switchError);
            if ((switchError as any).code === 4902) {
              alert(
                "Polygon  network is not available in MetaMask. Please add it manually."
              );
            } else {
              alert(
                "Failed to switch to the Polygon  network. Please switch it manually in MetaMask."
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
      owner: lot.owner, // Estendi con l'indirizzo del proprietario
    }));
    console.log("formattedLots:---->>>> ", formattedLots);
    setLotDetails(formattedLots);
    onOpen(); // Apre il modal
    console.log("DOPO:---->>>> ");
  };
  


  async function getClaimableNFTs() {
   // if (!user) return;  // Esce se l'utente non è connesso
    const provider = new ethers.providers.JsonRpcProvider(testnet);
    const key = simpleCrypto.decrypt(cipherEth);
    const wallet = new ethers.Wallet(key as string, provider);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);
    //const itemArray: INFT[] = [];
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
    
  //  setLoadingState('loaded');

  setTimeout(() => {
    setLoadingState('loaded');
  }, 5000);
  
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
    


    async function fetchNFT(token: number, contract: any, user: string): Promise<INFT | null> {
      try {
        // Recupera owner e dati puzzle
        const owner = await contract.ownerOf(token);
        const [puzzleId, puzzleOwner, pieceOwners]: [any, string, string[]] = await contract.getPuzzle(token);
        const userPieces = pieceOwners.map((owner: string) =>
          owner.toLowerCase() === user.toLowerCase()
        );
    
        // Recupera il tokenURI e i metadati da IPFS
        const cleanUri = await contract.tokenURI(token);
        const metadata = await axios.get(cleanUri);
        const { name: metaName, description, image, attributes: metaAttrs } = metadata.data;
    
        // Per i token 1-9, sostituisce l'immagine con quella presente nel server locale
        let finalImg = image;
        if (token <= 9) {
          finalImg = `/img/${token}.jpg`;
        }
    
        // Estrae le dimensioni, se presenti, dalla proprietà "Misure"
        let width: number | undefined = undefined;
        let height: number | undefined = undefined;
        for (let attr of metaAttrs) {
          if (attr.trait_type === "Misure") {
            const match = attr.value.match(/(\d+)[xX](\d+)/);
            if (match) {
              width = parseInt(match[1]);
              height = parseInt(match[2]);
            }
            break;
          }
        }
    
        return {
          name: metaName,
          img: finalImg,
          tokenId: token,
          wallet: puzzleOwner,
          desc: description,
          attributes: metaAttrs,
          width,
          height,
          userPieces
        };
      } catch (error) {
        console.error(`Error fetching NFT for token ${token}:`, error);
        return null;
      }
    }
    
    

async function getWalletNFTs() {
//  if (!user) return; // Assicurati che l'utente sia connesso

  const provider = new ethers.providers.JsonRpcProvider(testnet);
  const key = simpleCrypto.decrypt(cipherEth);
  const wallet = new ethers.Wallet(key as string, provider);
  const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);

  const totalSup = await contract.totalSupply();
  const promises: Promise<INFT | null>[] = [];
  for (let i = 0; i < totalSup.toNumber(); i++) {
    const token = i + 1;
    promises.push(fetchNFT(token, contract, user));
  }
  
  // Esegui in parallelo tutte le richieste
  const nftItems = await Promise.all(promises);
  // Filtra eventuali valori null (in caso di errori)
  const filteredItems = nftItems.filter((item): item is INFT => item !== null);
  setNfts(filteredItems);

 // Costruisci lo stato iniziale dei pezzi rivelati usando userPieces per ogni NFT
 const initialRevealed: { [tokenId: number]: boolean[] } = {};
 filteredItems.forEach((nft) => {
   initialRevealed[nft.tokenId] = nft.userPieces;
 });
 setRevealedPieces(initialRevealed);

  setLoadingState('loaded');
}
  
const buyLot = async (puzzleId: number, lotId: number) => {
  console.log("buyLot:----->");
  try {
    // Recupera i dettagli del lotto dallo stato, dove è già presente il prezzo
    const selectedLot = lotDetails.find((lot) => lot.id === lotId);
    if (!selectedLot) {
      throw new Error("Dettagli del lotto non trovati per lotId: " + lotId);
    }
    // Converte il prezzo (che è stato salvato come numero) in un BigNumber
    const lotprice = ethers.utils.parseEther(selectedLot.price.toString());
    console.log("lotPrice: ", ethers.utils.formatUnits(lotprice, 'ether'));

    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    const erc20Contract = new ethers.Contract(puztoken, ERC20ABI, signer);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);

    // Verifica l'allowance
    const allowance = await erc20Contract.allowance(user, testnftcol);
    console.log("allowance:----->", ethers.utils.formatUnits(allowance, 'ether'));

    if (allowance.lt(lotprice)) {
      console.log("lotPrice:----->", ethers.utils.formatUnits(lotprice, 'ether'));
      // Approva il contratto NFT a spendere i token
      const approveTx = await erc20Contract.approve(testnftcol, lotprice);
      await approveTx.wait();
      console.log("APPROVE1");
    }
    console.log("APPROVE2", ethers.utils.formatUnits(allowance, 'ether'));

    // Esegui l'acquisto del lotto
    const transaction = await contract.buyLot(puzzleId, lotId);
    await transaction.wait();

    // Aggiorna i dati dopo l'acquisto
    await getWalletNFTs();
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
    const gridSize = 3; // griglia 3x3
    const row = Math.floor(pieceIndex / gridSize);
    const col = pieceIndex % gridSize;
  
    return (
      <div
        className={`${styles['puzzle-piece']} ${isRevealed ? styles['visible'] : ''}`}
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: `${gridSize * 100}%`,
          backgroundPosition: `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`,
          // Se vuoi mantenere un filtro dinamico, lo puoi lasciare:
        //  filter: isRevealed ? "none" : "blur(1px) grayscale(90%)",
        filter: "none",
          transform: "translateZ(0)",         // Forza l'accelerazione hardware
          backfaceVisibility: "hidden",        // Migliora il rendering su Safari
          willChange: "filter, opacity",       // Suggerisce al browser di ottimizzare queste proprietà
        }}
      ></div>
    );
  };
  
  
  
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      
   

      </section>
      {!isConnected ? (
  <div className="flex flex-col items-center justify-center mt-1">
    <Button className={styles.cardCustom}  onClick={connectUser}>
      Connect
    </Button>
  </div>
) : (
  <div className="flex justify-between items-center w-full">
    {/* Sezione Saldo PuzToken */}
    <div className={styles.custombox}>
  Balance: {puzTokenBalance} Usdt
    </div>
    
    {/* Bottone Disconnect */}
    <Button className={styles.cardCustom} onClick={disconnectUser} style={{ fontSize: '1em' }}>
      Disconnect: {formatUserString(user)}
    </Button>
  </div>
)}


      <div className="mt-8 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {loadingState !== 'loaded'
    ? Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className={styles.cardCustom}>
          {/* Placeholder/Skeleton per header */}
          <div className="animate-pulse flex flex-col items-center px-4 pt-2">
            <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
          </div>
          {/* Placeholder/Skeleton per body */}
          <div className="animate-pulse flex justify-center items-center h-48 bg-gray-200"></div>
          {/* Placeholder/Skeleton per footer */}
          <div className="animate-pulse flex justify-around items-center py-2">
            <div className="w-16 h-6 bg-gray-300 rounded"></div>
            <div className="w-16 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))
    : nfts.map((nft) => (
        <Card className={styles.cardCustom} key={nft.tokenId} isHoverable isPressable>
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-center text-center">
            <p className="text-tiny uppercase font-bold">
              {nft.name} - ID: {nft.tokenId}
            </p>
            <small className="text-default-500">
              Owner: {formatUserString(nft.wallet)}
            </small>
            <div className="attributes-grid mt-2">
              {nft.attributes.map((attr, idx) => (
                <p key={idx} className="attribute text-xs">
                  <strong>{attr.trait_type}</strong>
                  <br />
                  {attr.value}
                </p>
              ))}
            </div>
          </CardHeader>
          <CardBody>
            <div 
              className={styles['puzzle-container']} 
              style={{
                aspectRatio: nft.width && nft.height ? `${nft.width} / ${nft.height}` : '1 / 1'
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
          <CardFooter className="flex justify-center items-center space-x-12 mb-5">
            <Button className={styles.revealButton} onClick={() => revealPiece(nft.tokenId)}>
              Reveal Random Piece
              <img src="/revealimg.png" alt="Reveal Icon" />
            </Button>
          </CardFooter>
          <CardFooter className="space-x-12 mb-5 w-full flex justify-between justify-center items-center ">
            <Button className={styles.buyLotsButton} justify-center items-center color="primary" variant="ghost"
              onClick={() => handleCreateLotClick(nft.tokenId)}>
              Buy Lots
              <img src="/icon.svg" alt="Icon" />
            </Button>
            {claimableStatus[nft.tokenId] && jollyCount > 0 && (
              <Button className={styles.buyLotsButton} color="warning" variant="ghost"
                onClick={() => claimNFTWithJolly(nft.tokenId)}>
                Claim With Jolly
              </Button>
            )}
            {claimableStatus[nft.tokenId] && (
              <Button className={styles.buyLotsButton} color="warning" variant="ghost"
                onClick={() => claimNFT(nft.tokenId)}>
                Claim
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
</div>

      </div>
{/* Rimuovi o commenta questi blocchi se non servono più */}
{/*
<style jsx>{`
  .puzzle-container {
    width: 100%;
    aspect-ratio: 1;
  }
  .puzzle-piece {
    background-size: 300%;
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
*/}

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
      <ModalContent className={`${styles.cardCustom} ${styles.modalWide}`}> 
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Lots Token - {selectedTokenId}</ModalHeader>
              <ModalBody>
              <div className="grid grid-cols-7 gap-4 mb-1 p-2 border-b border-gray-200">
  <div>Lot N</div>
  <div>Price</div>
  <div>Piece</div>
  <div>Jolly</div>
  <div>Owner</div>
  <div></div>
</div>
{lotDetails.map((lot) => {
  const isOwner = (lot.owner ?? "").toLowerCase() === user.toLowerCase();
  return (
    <div key={lot.id} className="grid grid-cols-7 gap-4 mb-2 p-2 border-gray-200 text-center items-center">
      <div>{lot.id}</div>
      <div>{lot.price}</div>
      <div>
        {lot.isRevealed 
          ? lot.pieceIds.join(", ") 
          : (isOwner ? `Hidden (${lot.pieceIds.join(", ")})` : "Hidden")
        }
      </div>
      <div>
        {lot.isRevealed 
          ? (lot.hasJolly ? "Yes" : "No") 
          : (isOwner ? `? (${lot.hasJolly ? "Yes" : "No"})` : "?")
        }
      </div>
      <div>{formatUserString(lot.owner ?? "N/A")}</div>
      <div className="flex justify-center items-center">
        {isOwner ? (
          "Already My lot"
        ) : (
          <Button  
            className={styles.buyLotsButton}
            style={{ transform: "scale(0.6)" }}
            onClick={() => buyLot(Number(selectedTokenId), lot.id)}
          >
            Buy Lot n.{lot.id}
          </Button>
        )}
      </div>
    </div>
  )
})}


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

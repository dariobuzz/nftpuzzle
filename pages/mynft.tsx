import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import axios from 'axios';
import DefaultLayout from '@/layouts/default';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure,Input} from "@nextui-org/react";
 // Aggiunto Modal
import {Card, CardHeader, CardBody, CardFooter, Image} from "@nextui-org/react";
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
import { testnftcol, testnet, cipherEth, simpleCrypto } from '../engine/configuration';
import styles from '@/styles/puzzle.module.css';

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
  lotCount: number;
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
  const [showPopup, setShowPopup] = useState(false); // Stato per mostrare/nascondere il pop-up
  const [lotNumber, setLotNumber] = useState<string>('');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [petIds, setPetIds] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [jollyFlag, setJollyFlag] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  useEffect(() => {
    connectUser();
  }, []); // Esegue la connessione una sola volta al montaggio del componente
  
  useEffect(() => {
    if(user) {
      getWalletNFTs();
    
    }
  }, [user]); // Esegue il recupero degli NFT quando 'user' è stato impostato
 /* 
  useEffect(() => {
    connectUser();
    getWalletNFTs();
  }, [setNfts, setUser, user]);*/
  const router = useRouter();
    // Aggiungo un effetto che resetta i dati quando il modal viene aperto
    useEffect(() => {
      if (isOpen) {
        resetFormData();
      }
    }, [isOpen]);
  
    const resetFormData = () => {
      setLotNumber('');
      setPetIds('');
      setPrice('');
      setJollyFlag(false);
      setIsRevealed(false);
    };

    async function connectUser() {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          setUser(account);
          console.log("Connected account:", account);
        } catch (error) {
          console.error("Errore durante la connessione al wallet:", error);
        }
      } else {
        console.error("Nessun provider Ethereum rilevato.");
      }
    }
    
 


 // Funzione helper per il fetch di un singolo NFT
  async function fetchNFT(token: number, contract: any, user: string): Promise<INFT | null> {
    try {
      // Recupera i dettagli del puzzle
      const [puzzleId, puzzleOwner, pieceOwners] = await contract.getPuzzle(token);
      // Se l'NFT non appartiene all'utente, lo scarta
      if (puzzleOwner.toLowerCase() !== user.toLowerCase()) {
        return null;
      }
      const cleanUri = await contract.tokenURI(token);
      const metadata = await axios.get(cleanUri);
      const { name, description: desc, image: img } = metadata.data;
      // Recupera il numero dei lotti creati per questo NFT
      const lotCountBN = await contract.getLotCount(token);
      const lotCount = lotCountBN.toNumber();
      return { name, img, tokenId: token, wallet: puzzleOwner, desc, lotCount };
    } catch (error) {
      console.error(`Error fetching NFT for token ${token}:`, error);
      return null;
    }
  }

  // Caricamento degli NFT in parallelo con Promise.all
  async function getWalletNFTs() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(testnet);
      const key = simpleCrypto.decrypt(cipherEth);
      const wallet = new ethers.Wallet(key as string, provider);
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);

      const totalSupBN = await contract.totalSupply();
      const totalSup = totalSupBN.toNumber();
      const promises: Promise<INFT | null>[] = [];

      for (let i = 0; i < totalSup; i++) {
        const token = i + 1;
        promises.push(fetchNFT(token, contract, user));
      }
      const nftItems = await Promise.all(promises);
      const filteredItems = nftItems.filter((item): item is INFT => item !== null);
      setNfts(filteredItems);
      setLoadingState('loaded');
    } catch (error) {
      console.error("Error in getWalletNFTs:", error);
    }
  }

  // Aggiungi una funzione per ottenere i dettagli del lotto
async function getLotDetails(tokenId: number, lotId: number) {
  const provider = new ethers.providers.JsonRpcProvider(testnet);
  const key = simpleCrypto.decrypt(cipherEth);
  const wallet = new ethers.Wallet(key as string, provider);
  const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);

  const lotDetails = await contract.getLotDetailsByTokenIdAndLotId(tokenId, lotId);
  return lotDetails;
}

  const handleCreateLotClick = (tokenId: any) => {
    setSelectedTokenId(tokenId);
    console.log("handleCreateLotClick ",tokenId); // Memorizza il tokenID selezionato nello stato
    onOpen(); // Apre il modal
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      // Sostituisci con l'indirizzo del tuo contratto
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);
      console.log("selectedTokenId: -> ",selectedTokenId);
      console.log("lotNumber: -> ",lotNumber);
      console.log("selectedTokenId: -> ",selectedTokenId);
      console.log("selectedTokenId: -> ",selectedTokenId);
    

       // Invia la transazione per creare il lotto
    const tx = await contract.createPuzzleLots(
      selectedTokenId,
      lotNumber,
      petIds.split(',').map(Number),
      ethers.utils.parseUnits(price, 'ether'),
      isRevealed,
      jollyFlag
    );

    // Attendi che la transazione venga confermata
    await tx.wait();
      // Dopo la creazione del lotto, aggiorna i dati degli NFT
    await getWalletNFTs();

      // Resetta i dati del form dopo l'invio
      resetFormData();
      // Chiudi il modal dopo l'invio
      onOpenChange();
    } catch (error) {
      console.error('Errore durante l\'invio dei dati:', error);
    }
  };

      
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
				<div className="inline-block max-w-lg text-center justify-center">
					<h1 className={title()}>My Nft Puzzle&nbsp;</h1>		
				</div>
			</section>
    
  
      <div className="mt-8 mb-">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {loadingState !== 'loaded' ? (
      // Placeholder/skeleton per mostrare subito la struttura delle card
      Array.from({ length: 6 }).map((_, idx) => (
        <Card key={idx} className={styles.cardCustom} isHoverable isPressable>
          <CardHeader className="animate-pulse pb-0 pt-2 px-4 flex-col items-start">
            <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-1/2 h-3 bg-gray-300 rounded mb-2"></div>
            <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
          </CardHeader>
          <CardBody>
            <div className="animate-pulse w-full h-48 bg-gray-200"></div>
          </CardBody>
          <CardFooter className="animate-pulse space-x-12 mb-5">
            <div className="w-20 h-6 bg-gray-300 rounded"></div>
          </CardFooter>
        </Card>
      ))
    ) : nfts.length === 0 ? (
      // Alert: nessun NFT trovato
      <div className="col-span-1 md:col-span-3">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Alert! </strong>
          <span className="block sm:inline">You do not yet own any NFT.</span>
        </div>
      </div>
    ) : (
      // Render delle card con i dati reali
      nfts.map((nft) => (
        <Card
          className={styles.cardCustom}
          key={nft.tokenId}
          isHoverable
          isPressable
        >
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">{nft.name}</p>
            <small className="text-default-500">{nft.desc}</small>
            <h4 className="font-bold text-large">Puzzle ID: {nft.tokenId}</h4>
            <small className="text-default-500">
              Owner: {formatUserString(nft.wallet)}
            </small>
            <small className="font-bold text-default-500">
              Lots Created: {nft.lotCount.toString()}
            </small>
          </CardHeader>
          <CardBody>
            <Image src={nft.img} width="100%" alt={nft.name} />
          </CardBody>
          <CardFooter className="space-x-12 mb-5">
            <Button
              radius="full"
              className={styles.buyLotsButton}
              onClick={() => handleCreateLotClick(nft.tokenId)}
            >
              Create New Lot
            </Button>
          </CardFooter>
        </Card>
      ))
    )}
  </div>
</div>


      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent className={styles.cardCustom} style={{ width: '20%' }}> 
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create NFT Lot</ModalHeader>
              <ModalBody>
            
                <form className="text-2xl text-default-400  flex-shrink-0" onSubmit={handleFormSubmit}>
                <div className="flex flex-col gap-2"> 
               <Input className="text-2xl text-default-400 flex-shrink-0"
              autoFocus
             
              label="Lot Number"
              placeholder="Enter Lot number"
              variant="bordered"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            required
          />
          <Input className="text-2xl text-default-400 flex-shrink-0"
            placeholder="Enter Ids list es. 1,2,3,..."
            variant="bordered"
            label="Pt IDs"
            value={petIds}
            onChange={(e) => setPetIds(e.target.value)}
            required
          />
          <Input className="text-2xl text-default-400 flex-shrink-0"
            label="Price"
            value={price}
            variant="bordered"
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <Input className="text-2xl text-default-400 flex-shrink-0"
            type="checkbox"
            label="Jolly Flag"
            variant="bordered"
            checked={jollyFlag}
            onChange={() => setJollyFlag(!jollyFlag)}
          />
            <Input className="text-2xl text-default-400 flex-shrink-0"
            type="checkbox"
            label="Is Revealed"
            variant="bordered"
            checked={isRevealed}
            onChange={() => setIsRevealed(!isRevealed)}
          />
          </div>
        </form>
              </ModalBody>
              <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                    color="primary"
                    variant="light"
                    onClick={handleFormSubmit}
                    type="button"
                  >
                 Create New Lot 
                </Button>

              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
		</DefaultLayout>
	);
};

export default IndexPage;

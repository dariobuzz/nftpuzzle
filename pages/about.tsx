import { useState, useEffect,useRef } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import {CircularProgress} from "@nextui-org/react";
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import DefaultLayout from '@/layouts/default';
import { Link } from '@nextui-org/react';
import { Snippet, Code } from '@nextui-org/react';
import { Button, Input, Spacer } from '@nextui-org/react';
import {Card, CardHeader, CardBody, CardFooter, Image} from "@nextui-org/react";
import {
  pinatakey,
  pinatasecret,
  pinatajwt,
  ipfsgateway,
  sendJsonHeader
  // Importa altre funzioni e configurazioni necessarie
} from '../components/config'
import { title, subtitle } from '@/components/primitives';
import { GithubIcon } from '@/components/icons';

import NFTCollectionABI from '../engine/NFTCollection.json';
import {testnftcol, testnet, cipherEth, simpleCrypto } from '../engine/configuration';



const pinataURL = "https://fuchsia-select-junglefowl-195.mypinata.cloud/ipfs/";

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

const sendFileToIPFS = async (file: File): Promise<string> => {
  const url: string = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  let data: FormData = new FormData();
  data.append('file', file);
  console.log("data->>>>>>>>  ", data)
  const opts = JSON.stringify({
    cidVersion: 0,
  })
  data.append('pinataOptions', opts);
  console.log("data->>>>>>>>  ", data)
  const options = {
    maxBodyLength: Infinity,
    headers: {
    'Content-Type': `multipart/form-data`,
   // 'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
      pinata_api_key: pinatakey,
      pinata_secret_api_key: pinatasecret,
      Accept: 'text/plain',
  }
}


  try {
    const response: AxiosResponse = await axios.post(url, data, options);
    console.log("CID IMG:",response.data.IpfsHash);
    return response.data.IpfsHash; // Restituisce il CID del file su IPFS
  } catch (error) {
    console.error('Error uploading file to IPFS: ', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

const sendJSONToIPFS = async (jsonData: object): Promise<string> => {
  const url: string = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const options = {
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: pinatakey,
      pinata_secret_api_key: pinatasecret,
    },
  };

  try {
    const response: AxiosResponse = await axios.post(url, jsonData, options);
    console.log("CID JSON:",response.data.IpfsHash);
    return response.data.IpfsHash; // Restituisce il CID del JSON su IPFS
  } catch (error) {
    console.error('Error uploading JSON to IPFS: ', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
};
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
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [attributes, setAttributes] = useState([
    { trait_type: "Artista", value: "" },
    { trait_type: "Anno", value: "" },
    { trait_type: "Categoria", value: "" },
    { trait_type: "Soggetto", value: "" },
    { trait_type: "Tecnica", value: "" },
    { trait_type: "Materiale", value: "" },
    { trait_type: "Misure", value: "" },
    { trait_type: "Luogo Esposizione", value: "" }
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [loadingState, setLoadingState] = useState<'not-loaded' | 'loaded'>('not-loaded');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    connectUser();
    getWalletNFTs();
  }, [setNfts, setUser, user,setFile]);
  const router = useRouter();

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
    console.log("totalSup:----->",totalSup);
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
  const handleFileChange = () => {
    // Assicurati che fileInputRef.current esista e abbia una selezione di file non-null e non-vuota
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length > 0) {
        console.log("File selected:", fileInputRef.current.files[0]);
        setFile(fileInputRef.current.files[0]);
    }
};

const handleAttributeChange = (index: number, value: string) => {
  const updatedAttributes = [...attributes];
  updatedAttributes[index].value = value;
  setAttributes(updatedAttributes);
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !description) {
      alert('Please provide both a description and an image');
      return;
    }
  
    setIsLoading(true); // Inizia a mostrare il loader

    const imageUrl = await sendFileToIPFS(file);
  
    // Creazione dell'oggetto JSON con i dati raccolti
    const metadata = {
      name,
      description,
      image: pinataURL + imageUrl,
      dna: "generated_dna_placeholder",
      edition: new Date().getTime(), 
      date: new Date().getTime(),
      attributes,
      compiler: "Art Engine"
    };
    // Qui potresti voler salvare l'oggetto JSON su IPFS o un altro storage e gestire il risultato
    console.log("metadataJson: ----->>>>",metadata);
      // Caricamento dei metadati su IPFS
  const metadataCid = await sendJSONToIPFS(metadata);
  const metadataUri = pinataURL + metadataCid;
  console.log("metadataUri: ----->>>>",metadataUri);
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);

    try {
      // Chiamata alla funzione del contratto per creare l'NFT con l'URI dei metadati
      const transaction = await nftContract.createNFTWithURI(metadataUri);
      await transaction.wait();

      setIsLoading(false); // Nascondi il loader
        router.push('/'); // Reindirizza all'homepage
    } catch (error) {
      console.error('Error creating NFT: ', error);
      setIsLoading(false); // Assicurati di nascondere il loader anche in caso di errore
        alert('Failed to create NFT'); // Considera di sostituire con una UI di errore più amichevole
      }
  } else {
    console.log('Ethereum object not found, you need to install MetaMask!');
    setIsLoading(false); 
    alert('Please install MetaMask');
  }
  };
  
  // Funzione fittizia per l'upload dell'immagine su IPFS
  // Dovrai implementare questa funzione in base al servizio che utilizzi
  async function uploadImageToIPFS(file: File): Promise<string> {
    // Logica di upload qui
    // Dopo l'upload, ritorna l'URL dell'immagine
    return "https://example.com/path/to/image.jpg"; // URL fittizio
  }
  
      
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
				<div className="inline-block max-w-lg text-center justify-center">
					<h1 className={title()}>Nft&nbsp;</h1>
					<h1 className={title({ color: "violet" })}>Puzzle&nbsp;</h1>
					<h4 className={subtitle({ class: "mt-4" })}>
						Create your new Puzzle
					</h4>
				</div>
       
         {/* Form per l'input di descrizione, caricamento immagine e invio dati */}
         <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
         <Input
          
          fullWidth
          color="primary"
          size="sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
          <Input
          
            fullWidth
            color="primary"
            size="lg"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
             {attributes.map((attr, index) => (
            <Input 
              key={index} 
              fullWidth 
              color="primary" 
              size="md" 
              placeholder={`${attr.trait_type}`} 
              value={attr.value} 
              onChange={(e) => handleAttributeChange(index, e.target.value)} 
            />
          ))}
          <input
    ref={fileInputRef}
    type="file"
    onChange={handleFileChange}
/>
          <Button type="submit" color="primary">Create</Button>
          {isLoading && <CircularProgress aria-label="Loading..." />}
        </form>

        
			</section>
            <div>

    </div>
  
		</DefaultLayout>
	);
};

export default IndexPage;

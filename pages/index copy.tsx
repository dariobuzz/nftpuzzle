import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import axios from 'axios';
import DefaultLayout from '@/layouts/default';
import { Link } from '@nextui-org/react';
import { Snippet, Code } from '@nextui-org/react';
import { Button, RadioGroup, Radio } from '@nextui-org/react';
import {Select, SelectSection, SelectItem} from "@nextui-org/react";
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
import {testnftcol, testnet, cipherEth, simpleCrypto } from '../engine/configuration';

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
  const [selected, setSelected] = useState("london");
  useEffect(() => {
    connectUser();
    getWalletNFTs();
  }, [setNfts, setUser, user]);
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

      
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
				<div className="inline-block max-w-lg text-center justify-center">
					<h1 className={title()}>Nft&nbsp;</h1>
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
              <CardFooter className="flex justify-center items-center space-x-12 mb-5 ">
              <div className="flex flex-col gap-3" style={{ flex: '1' }}>


      

      
               
    </div>
    
    
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
		</DefaultLayout>
	);
};

export default IndexPage;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import axios from 'axios';
import DefaultLayout from '@/layouts/default';
import { Button } from '@nextui-org/react';
import { BigNumber } from 'ethers';
import { Card, CardHeader, CardBody, CardFooter, Image } from '@nextui-org/react';
import NFTCollectionABI from '../engine/NFTCollection.json';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import ERC20ABI from '../engine/ERC20.json';
import { puztoken, testnftcol, testnet, cipherEth, simpleCrypto } from '../engine/configuration';
import styles from '@/styles/puzzle.module.css';
import LanguageSelector from '@/components/selector';
import { useTranslation } from 'next-i18next';

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
  owner?: string;
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
  attributes: IAttribute[];
  width?: number;
  height?: number;
  userPieces: boolean[];
}

const IndexPage = () => {
  // Mappatura per convertire i nomi degli attributi dell'NFT nelle chiavi usate nel file di traduzione
  const attributeMapping: { [key: string]: string } = {
    'artista': 'artist',
    'anno': 'year',
    'categoria': 'category',
    'soggetto': 'subject',
    'tecnica': 'technique',
    'materiale': 'material',
    'misure': 'measurements',
    'luogo esposizione': 'exhibitionLocation',
  };

  const [user, setUser] = useState<string>('');
  const [nfts, setNfts] = useState<INFT[]>([]);
  const [loadingState, setLoadingState] = useState<'not-loaded' | 'loaded'>('not-loaded');
  const [revealedPieces, setRevealedPieces] = useState<{ [tokenId: number]: boolean[] }>({});
  const [claimableStatus, setClaimableStatus] = useState<{ [key: number]: boolean }>({});
  const [puzTokenBalance, setPuzTokenBalance] = useState<string>('0');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [lotDetails, setLotDetails] = useState<LotDetail[]>([]);
  const [jollyCount, setJollyCount] = useState<number>(0);

  // Hook per le traduzioni del namespace "card"
  const { t: tCard } = useTranslation('card');

  useEffect(() => {
    const savedUser = localStorage.getItem('userAddress');
    if (savedUser && ethers.utils.isAddress(savedUser)) {
      setUser(savedUser);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      getWalletNFTs();
      getClaimableNFTs();
      getPuzTokenBalance(user);
    }
  }, [user]);

  useEffect(() => {
    getWalletNFTs();
    getClaimableNFTs();
  }, []);

  useEffect(() => {
    if (user) {
      getPuzTokenBalance(user);
    }
  }, [user]);

  const getPuzTokenBalance = async (userAddress: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const puzTokenContract = new ethers.Contract(puztoken, ERC20ABI, signer);
      const balance: BigNumber = await puzTokenContract.balanceOf(userAddress);
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      setPuzTokenBalance(formattedBalance);
    } catch (error) {
      console.error('Error fetching PuzToken balance:', error);
    }
  };

  async function connectUser() {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to connect.');
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    try {
      await provider.send('eth_requestAccounts', []);
      const chainId = await provider.send('eth_chainId', []);
      const POLYGON_CHAIN_ID = '0x89';
      if (chainId !== POLYGON_CHAIN_ID) {
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId: POLYGON_CHAIN_ID }]);
        } catch (switchError) {
          console.error('Error switching network:', switchError);
          if ((switchError as any).code === 4902) {
            alert('Polygon network is not available in MetaMask. Please add it manually.');
          } else {
            alert('Failed to switch to the Polygon network. Please switch it manually in MetaMask.');
          }
          return;
        }
      }
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      if (account && ethers.utils.isAddress(account)) {
        setUser(account);
        setIsConnected(true);
        localStorage.setItem('userAddress', account);
        await getPuzTokenBalance(account);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  }

  const disconnectUser = () => {
    setUser('');
    setIsConnected(false);
    localStorage.removeItem('userAddress');
  };

  const handleCreateLotClick = async (tokenId: any) => {
    setSelectedTokenId(tokenId);
    const provider = new ethers.providers.JsonRpcProvider(testnet);
    const key = simpleCrypto.decrypt(cipherEth);
    const wallet = new ethers.Wallet(key as string, provider);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);
    const lotCount = await contract.getLotCount(tokenId);
    const lotDetailsPromises = [];
    for (let i = 0; i < lotCount.toNumber(); i++) {
      lotDetailsPromises.push(contract.getLotDetailsByTokenIdAndLotId(tokenId, i + 1));
    }
    const lotDetails = await Promise.all(lotDetailsPromises);
    const formattedLots: LotDetail[] = lotDetails.map((lot: any) => ({
      id: lot.id.toNumber(),
      pieceIds: lot.pieceIds.map((pieceId: any) => pieceId.toNumber()),
      price: parseFloat(ethers.utils.formatUnits(lot.price, 'ether')),
      isRevealed: lot.isRevealed,
      hasJolly: lot.hasJolly,
      isSold: lot.isSold,
      owner: lot.owner,
    }));
    setLotDetails(formattedLots);
    onOpen();
  };

  async function getClaimableNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(testnet);
    const key = simpleCrypto.decrypt(cipherEth);
    const wallet = new ethers.Wallet(key as string, provider);
    const contract = new ethers.Contract(testnftcol, NFTCollectionABI, wallet);
    const totalSup = await contract.totalSupply();
    const claimableStatuses: { [key: number]: boolean } = {};
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
      await web3Provider.send('eth_requestAccounts', []);
      const signer = web3Provider.getSigner();
      const contractWithSigner = new ethers.Contract(testnftcol, NFTCollectionABI, signer);
      const userAddress = await signer.getAddress();
      const jcount = await contractWithSigner.jollyCount(userAddress);
      setJollyCount(jcount.toNumber());
      for (let i = 0; i < totalSup.toNumber(); i++) {
        const token = i + 1;
        try {
          const isClaimable = await contractWithSigner.isClaimable(token);
          claimableStatuses[token] = isClaimable;
        } catch (error) {
          console.error('Error fetching NFT or metadata', error);
        }
      }
    }
    setClaimableStatus(claimableStatuses);
    setTimeout(() => {
      setLoadingState('loaded');
    }, 5000);
  }

  function formatUserString(user: string): string {
    if (user.length > 12) {
      const start = user.substring(0, 6);
      const end = user.substring(user.length - 6);
      return `${start}...${end}`;
    } else {
      return user;
    }
  }

  async function fetchNFT(token: number, contract: any, user: string): Promise<INFT | null> {
    try {
      const owner = await contract.ownerOf(token);
      const [puzzleId, puzzleOwner, pieceOwners]: [any, string, string[]] = await contract.getPuzzle(token);
      const userPieces = pieceOwners.map((owner: string) =>
        owner.toLowerCase() === user.toLowerCase()
      );
      const cleanUri = await contract.tokenURI(token);
      const metadata = await axios.get(cleanUri);
      const { name: metaName, description, image, attributes: metaAttrs } = metadata.data;
      let finalImg = image;
      if (token <= 9) {
        finalImg = `/img/${token}.jpg`;
      }
      let width: number | undefined = undefined;
      let height: number | undefined = undefined;
      for (let attr of metaAttrs) {
        if (attr.trait_type === 'Misure') {
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
        userPieces,
      };
    } catch (error) {
      console.error(`Error fetching NFT for token ${token}:`, error);
      return null;
    }
  }

  async function getWalletNFTs() {
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
    const nftItems = await Promise.all(promises);
    const filteredItems = nftItems.filter((item): item is INFT => item !== null);
    setNfts(filteredItems);
    const initialRevealed: { [tokenId: number]: boolean[] } = {};
    filteredItems.forEach((nft) => {
      initialRevealed[nft.tokenId] = nft.userPieces;
    });
    setRevealedPieces(initialRevealed);
    setLoadingState('loaded');
  }

  const buyLot = async (puzzleId: number, lotId: number) => {
    try {
      const selectedLot = lotDetails.find((lot) => lot.id === lotId);
      if (!selectedLot) {
        throw new Error('Dettagli del lotto non trovati per lotId: ' + lotId);
      }
      const lotprice = ethers.utils.parseEther(selectedLot.price.toString());
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const erc20Contract = new ethers.Contract(puztoken, ERC20ABI, signer);
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);
      const allowance = await erc20Contract.allowance(user, testnftcol);
      if (allowance.lt(lotprice)) {
        const approveTx = await erc20Contract.approve(testnftcol, lotprice);
        await approveTx.wait();
      }
      const transaction = await contract.buyLot(puzzleId, lotId);
      await transaction.wait();
      await getWalletNFTs();
      setLotDetails((prevLotDetails) =>
        prevLotDetails.map((lot) => (lot.id === lotId ? { ...lot, isSold: true } : lot))
      );
    } catch (error) {
      console.error('Error buying lot:', error);
      alert('Error buying lot. Please check the console for details.');
    }
  };

  const claimNFT = async (tokenId: number) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);
      const transaction = await contract.claimNFT(tokenId);
      await transaction.wait();
      console.log('NFT claimed successfully!');
    } catch (error) {
      console.error('Error claiming NFT:', error);
    }
  };

  const claimNFTWithJolly = async (tokenId: number) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(testnftcol, NFTCollectionABI, signer);
      const transaction = await contract.claimNFTWithJolly(tokenId);
      await transaction.wait();
      console.log('NFT claimed successfully! with jolly');
    } catch (error) {
      console.error('Error claiming NFT:', error);
    }
  };

  const revealPiece = async (tokenId: number) => {
    const indices: number[] = [];
    for (let i = 0; i < 9; i++) {
      indices.push(i);
    }
    for (let k = indices.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      const temp = indices[k];
      indices[k] = indices[j];
      indices[j] = temp;
    }
    for (let m = 0; m < indices.length; m++) {
      const randomIndex = indices[m];
      setRevealedPieces((prev) => {
        const currentPieces = prev[tokenId] ? [...prev[tokenId]] : Array(9).fill(false);
        currentPieces[randomIndex] = true;
        return {
          ...prev,
          [tokenId]: currentPieces,
        };
      });
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    for (let j = 0; j < 5; j++) {
      setRevealedPieces((prev) => ({
        ...prev,
        [tokenId]: Array(9).fill(false),
      }));
      await new Promise((resolve) => setTimeout(resolve, 100));
      setRevealedPieces((prev) => ({
        ...prev,
        [tokenId]: Array(9).fill(true),
      }));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    setRevealedPieces((prev) => ({
      ...prev,
      [tokenId]: Array(9).fill(true),
    }));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setRevealedPieces((prev) => ({
      ...prev,
      [tokenId]: Array(9).fill(false),
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
    const gridSize = 3;
    const row = Math.floor(pieceIndex / gridSize);
    const col = pieceIndex % gridSize;
    return (
      <div
        className={`${styles['puzzle-piece']} ${isRevealed ? styles['visible'] : ''}`}
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: `${gridSize * 100}%`,
          backgroundPosition: `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`,
          filter: 'none',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'filter, opacity',
        }}
      ></div>
    );
  };

  return (
    <DefaultLayout>
      {/* Wrapper "relative" per posizionare il LanguageSelector in alto a destra */}
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <LanguageSelector />
        </div>

        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          {/* Altre sezioni della pagina */}
        </section>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center mt-1">
            <Button className={styles.cardCustom} onClick={connectUser}>
              Connect
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <div className={styles.custombox}>Balance: {puzTokenBalance} usdc</div>
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
                    <div className="animate-pulse flex flex-col items-center px-4 pt-2">
                      <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                    </div>
                    <div className="animate-pulse flex justify-center items-center h-48 bg-gray-200"></div>
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
                      <small className="text-default-500">Owner: {formatUserString(nft.wallet)}</small>
                      <div className="attributes-grid mt-2">
                        {nft.attributes.map((attr, idx) => {
                          const traitLower = attr.trait_type.toLowerCase();
                          const mappedKey = attributeMapping[traitLower] || traitLower;
                          return (
                            <p key={idx} className="attribute text-xs">
                              <strong>{tCard(mappedKey)}</strong>
                              <br />
                              {attr.value}
                            </p>
                          );
                        })}
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div
                        className={styles['puzzle-container']}
                        style={{
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
                    <CardFooter className="flex justify-center items-center space-x-12 mb-5">
                      <Button className={styles.revealButton} onClick={() => revealPiece(nft.tokenId)}>
                        Reveal Random Piece
                        <img src="/revealimg.png" alt="Reveal Icon" />
                      </Button>
                    </CardFooter>
                    
                    <CardFooter className="mb-5 w-full flex flex-col items-center space-y-4">
                      <Button
                        className={styles.buyLotsButton}
                        color="primary"
                        variant="ghost"
                        onClick={() => handleCreateLotClick(nft.tokenId)}
                      >
                        Buy Lots
                        <img src="/icon.svg" alt="Icon" />
                      </Button>
                      {claimableStatus[nft.tokenId] && jollyCount > 0 && (
                        <Button
                          className={styles.buyLotsButton}
                          color="warning"
                          variant="ghost"
                          onClick={() => claimNFTWithJolly(nft.tokenId)}
                        >
                          Claim With Jolly
                        </Button>
                      )}
                      {claimableStatus[nft.tokenId] && (
                        <Button
                          className={styles.buyLotsButton}
                          color="warning"
                          variant="ghost"
                          onClick={() => claimNFT(nft.tokenId)}
                        >
                          Claim
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
          </div>
        </div>

        <style jsx>{`
          .attributes-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2px;
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
                    const isOwner = (lot.owner ?? '').toLowerCase() === user.toLowerCase();
                    return (
                      <div
                        key={lot.id}
                        className="grid grid-cols-7 gap-4 mb-2 p-2 border-gray-200 text-center items-center"
                      >
                        <div>{lot.id}</div>
                        <div>{lot.price}</div>
                        <div>
                          {lot.isRevealed
                            ? lot.pieceIds.join(', ')
                            : isOwner
                            ? `Hidden (${lot.pieceIds.join(', ')})`
                            : 'Hidden'}
                        </div>
                        <div>
                          {lot.isRevealed
                            ? lot.hasJolly
                              ? 'Yes'
                              : 'No'
                            : isOwner
                            ? `? (${lot.hasJolly ? 'Yes' : 'No'})`
                            : '?'}
                        </div>
                        <div>{formatUserString(lot.owner ?? 'N/A')}</div>
                        <div className="flex justify-center items-center">
                          {isOwner ? (
                            'Already My lot'
                          ) : (
                            <Button
                              className={styles.buyLotsButton}
                              style={{ transform: 'scale(0.6)' }}
                              onClick={() => buyLot(Number(selectedTokenId), lot.id)}
                            >
                              Buy Lot n.{lot.id}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
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
      </div>
    </DefaultLayout>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(({ serverSideTranslations }) =>
        serverSideTranslations(locale, ['card'])
      )),
    },
  };
};

export default IndexPage;

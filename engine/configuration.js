/* 
       ___  ___    _  _  ___  _____   __  __             _         _   
 _ _  |_  )|   \  | \| || __||_   _| |  \/  | __ _  _ _ | |__ ___ | |_ 
| ' \  / / | |) | | .` || _|   | |   | |\/| |/ _` || '_|| / // -_)|  _|
|_||_|/___||___/  |_|\_||_|    |_|   |_|  |_|\__,_||_|  |_\_\\___| \__|
                                                                    
Update values accordingly
xxnft is the NFT SmartContract Address
xxmarket is the NFT MarketPlace Address
xxresell is the NFT MarketResell Address
xxnftcol is the already create NFT Collection Address
*/

/*
Private Key Encryption
Replace ethraw with your private key "0xPRIVATEKEY" (Ethereum and other EVM)
Replace hhraw with your private key "0xPRIVATEKEY" (Hardhat)
*/

import SimpleCrypto from "simple-crypto-js"
const cipherKey = "#ffg3$dvcv4rtkljjkh38dfkhhjgt"
const ethraw = "0x9572d201877a3e4c2dcc03ff69d48e0df5716b99820562cc12a1060485e0fdfa";

const hhraw = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
export const simpleCrypto = new SimpleCrypto(cipherKey)
export const cipherEth = simpleCrypto.encrypt(ethraw)
export const cipherHH = simpleCrypto.encrypt(hhraw)

/*
HardHat Testnet
*/

export var hhresell = "0x9A00C26e490b5C3cec0816c1bB815d3f0F6c2a71";
export var hhnftcol = "0x5434D890Aa852ca605da4eE670F74168f1eEd3D5";
var hhrpc = "http://localhost:8545";

/*
Global Parameters
*/
export var puztoken = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";//POLYGON
export var testnftcol = "0x3673fd00be903acad2ff00b4017886dfbc52962a";//POLYGON
export var testnet = "https://polygon-mainnet.g.alchemy.com/v2/m72BjREjm49KszoeRKfqFvM5VY1Ud7Jg"

/*export var puztoken = "0x61A7ac3aE4Cc3cbb02DB57Ddb224267A629169FD";//amoy
export var testnftcol = "0xeAef63a7852Abe64aE92a7dc8Af0b001824fdd46";//amoy nuova testnet di polygon
export var testnet = "https://rpc-amoy.polygon.technology"*/

export var mainresell = "0x9A00C26e490b5C3cec0816c1bB815d3f0F6c2a71";
export var mainnftcol = "0x5434D890Aa852ca605da4eE670F74168f1eEd3D5";
export var mainnet = "https://sepolia.infura.io/v3/"
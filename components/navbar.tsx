import {
	Button,
	Kbd,
	Link,
	Input,
	Navbar as NextUINavbar,
	NavbarContent,
	NavbarMenu,
	NavbarMenuToggle,
	NavbarBrand,
	NavbarItem,
	NavbarMenuItem,
} from "@nextui-org/react";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { link as linkStyles } from "@nextui-org/theme";
import ERC20ABI from '../engine/ERC20.json'; // Import the ERC20 ABI
import { puztoken, testnftcol, testnet, cipherEth, simpleCrypto } from '../engine/configuration';

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import {
	TwitterIcon,
	GithubIcon,
	DiscordIcon,
	HeartFilledIcon,
	SearchIcon,
} from "@/components/icons";



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

export const Navbar = () => {
	const [user, setUser] = useState<string>("");
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [puztokenBalance, setPuztokenBalance] = useState<string>("0");
/*
	useEffect(() => {
	  connectUser();
	
	}, [setUser, user]);*/
/*
	useEffect(() => {
        if (window.ethereum) {
            (window.ethereum as any).on('accountsChanged', function (accounts: string[]) {
                if (accounts.length > 0) {
                    setUser(accounts[0]);
                    setIsConnected(true);
                } else {
                    // Handle the case when the user disconnects their wallet
                    setUser("");
                    setIsConnected(false);
                }
            });
        }
    }, []);
*/
	/*async function connectUser() {
		if (window.ethereum) {
		  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
		  await provider.send("eth_requestAccounts", []);
		  const signer = provider.getSigner();
		  const account = await signer.getAddress();
		  setUser(account);
		  console.log(account);
		}
	  }*/
/*
	  async function connectUser() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            try {
                await provider.send("eth_requestAccounts", []);
                const network = await provider.getNetwork();
                // Check if the connected network is Goerli
                if (network.chainId !== 5) {
                    await switchToGoerliNetwork();
                }
                const signer = provider.getSigner();
                const account = await signer.getAddress();
                setUser(account);
                setIsConnected(true);

				 // Get puztoken balance
				 const puztokenContract = new ethers.Contract(puztoken, ERC20ABI, signer);
				 const balance = await puztokenContract.balanceOf(account);
				 setPuztokenBalance(ethers.utils.formatUnits(balance, 18)); 
            } catch (error) {
                console.error("Error connecting to MetaMask", error);
            }
        } else {
            console.log("MetaMask is not installed");
        }
    }

    async function switchToGoerliNetwork() {
        try {
            await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x5' }],
            });
        } catch (switchError) {
            console.error("Could not switch to Goerli", switchError);
        }
    }

    async function disconnectUser() {
        setUser("");
        setIsConnected(false);
        // You might want to handle the disconnect logic more gracefully in a real-world app
    }

    const walletButton = isConnected ? (
        <Button onClick={disconnectUser}>
           Connected Wallet: {formatUserString(user)}
        </Button>
    ) : (
        <Button onClick={connectUser}>
            Connect Wallet
        </Button>
    );*/
	const searchInput = (
		<Input
			aria-label="Search"
			classNames={{
				inputWrapper: "bg-default-100",
				input: "text-sm",
			}}
			endContent={
				<Kbd className="hidden lg:inline-block" keys={["command"]}>
					K
				</Kbd>
			}
			labelPlacement="outside"
			placeholder="Search..."
			startContent={
				<SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
			}
			type="search"
		/>
	);

	return (
		<NextUINavbar maxWidth="xl" position="sticky">
			<NavbarContent className="basis-1/5 sm:basis-full" justify="start">
				<NavbarBrand className="gap-3 max-w-fit">
				<NextLink className="flex justify-start items-center gap-1" href="/">
						<img
							src="/LogoNFTpuzzlenew.png"
							alt="NFT Puzzle Logo"
							className="h-10 w-auto"
						/>
						<p className="font-bold text-inherit"> Puzzle</p>
					</NextLink>
				</NavbarBrand>
				<div className="hidden lg:flex gap-4 justify-start ml-2">
					{siteConfig.navItems.map((item) => (
						<NavbarItem key={item.href}>
							<NextLink
								className={clsx(
									linkStyles({ color: "foreground" }),
									"data-[active=true]:text-primary data-[active=true]:font-medium"
								)}
								color="foreground"
								href={item.href}
							>
								{item.label}
							</NextLink>
						</NavbarItem>
					))}
				</div>
			</NavbarContent>



			<NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
      
        <ThemeSwitch />
				<NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
				{searchInput}
				<div className="mx-4 mt-2 flex flex-col gap-2">
					{siteConfig.navMenuItems.map((item, index) => (
						<NavbarMenuItem key={`${item}-${index}`}>
							<Link
								color={
									index === 2
										? "primary"
										: index === siteConfig.navMenuItems.length - 1
										? "danger"
										: "foreground"
								}
								href="#"
								size="lg"
							>
								{item.label}
							</Link>
						</NavbarMenuItem>
					))}
				</div>
			</NavbarMenu>
		</NextUINavbar>
	);
};

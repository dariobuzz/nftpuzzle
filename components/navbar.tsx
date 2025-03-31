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
import { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { link as linkStyles } from "@nextui-org/theme";
import ERC20ABI from "../engine/ERC20.json"; // Import the ERC20 ABI
import { puztoken, testnftcol, testnet, cipherEth, simpleCrypto } from "../engine/configuration";

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
	if (user.length > 12) {
		const start = user.substring(0, 6);
		const end = user.substring(user.length - 6);
		return `${start}...${end}`;
	} else {
		return user;
	}
}

export const Navbar = () => {
	const [user, setUser] = useState<string>("");
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [puztokenBalance, setPuztokenBalance] = useState<string>("0");
	const router = useRouter();

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
							src="/LogoNFTpuzzleW.png"
							alt="NFT Puzzle Logo"
							className="h-20 w-auto"
						/>
					</NextLink>
				</NavbarBrand>
				<div className="hidden lg:flex gap-4 justify-start ml-2">
					{siteConfig.navItems.map((item) => {
						const isActive = router.pathname === item.href;
						return (
							<NavbarItem key={item.href}>
								<NextLink
									href={item.href}
									className={clsx(
										linkStyles({ color: "foreground" }),
										isActive && "text-orange-500 font-medium"
									)}
									color="foreground"
								>
									{item.label}
								</NextLink>
							</NavbarItem>
						);
					})}
				</div>
			</NavbarContent>

			<NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
				<NavbarMenuToggle />
			</NavbarContent>

			<NavbarMenu>
				<div className="mx-4 mt-2 flex flex-col gap-2">
					{siteConfig.navMenuItems.map((item, index) => {
						const isActive = router.pathname === item.href;
						return (
							<NavbarMenuItem key={`${item}-${index}`}>
								<NextLink
									href={item.href}
									className={clsx(
										linkStyles({ color: "foreground" }),
										isActive && "text-orange-500 font-medium"
									)}
									color="foreground"
								>
									{item.label}
								</NextLink>
							</NavbarMenuItem>
						);
					})}
				</div>
			</NavbarMenu>
		</NextUINavbar>
	);
};

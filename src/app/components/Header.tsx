// /app/components/Header.tsx
"use client";
import { Container } from "./Container";
import { NavLink } from "./NavLink";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { ConnectWallet } from "@thirdweb-dev/react";
import MobileNavigation from "./MobileNavigation";

export function Header() {
  const { theme } = useTheme();

  return (
    <header className="">
      <Container>
        <nav className="relative z-50 flex justify-between items-center p-4 md:pt-4">
          <div className="flex items-center md:gap-x-12 justify-center">
            <Link href="/">
              <div className="flex items-center">
                <Image
                  src={theme === "dark" ? "/pgc-logo-dark.png" : "/pgc-logo-light.png"}
                  alt="public goods logo image"
                  width={50}
                  height={50}
                />
              </div>
            </Link>
          </div>
          <div className="hidden md:flex md:gap-x-6 ">
            <NavLink href="https://x.com/PublicGoodsClub" target="_blank">Community</NavLink>
            <NavLink href="https://mirror.xyz/bigtrav.eth/6hD4LTjGWC8TXef4DGIxbdVSibreKLTWila-wOku0DM" target="_blank">Learn</NavLink>
            <NavLink href="/"> My NFTs</NavLink>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <div className="hidden md:block">
              <ConnectWallet  switchToActiveChain={true} />
            </div>
            <ThemeToggle />
            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}

import { useState, useEffect, useRef } from 'react';
import DefaultLayout from '@/layouts/default';
import { title, subtitle } from '@/components/primitives';

const GameRulesPage = () => {
  // Testo formattato con le regole del gioco
  const gameRules = `
  Game Rules - Art Hours NFT Puzzle
===================================================

1. Creation of the NFT Puzzle
• NFT and Pieces:
Each NFT Puzzle is represented by an ERC721 token and consists of 9 pieces. Initially, when minted by the "minter" role, all 9 pieces belong to the same user (usually the administrator).

2. Division into Lots
• What are Lots?
The owner of an NFT Puzzle can divide the puzzle into "lots." A lot is a group of pieces selected by the owner.

• Creating a Lot:

The puzzle owner decides which pieces to include in a lot and sets an initial price.
Each lot can have two special features:
Revealed or Hidden Lot: Indicates whether the content (pieces) of the lot is publicly visible or not.
Presence of a Joker: Some lots may include a "Joker," a bonus that can be used to complete the puzzle.
• Piece Exclusivity:
Once assigned to a lot, a piece cannot be associated with another lot.

3. Purchasing Lots
• Purchase Method:

Any user can purchase a lot, provided they have a sufficient balance in USDT Token (an ERC20 token).
To purchase, the user sends the payment (in USDT Token) to the seller, identified as the current owner of the lot's pieces (the first piece owner of the lot is used as a reference).
• Ownership Update:
After the purchase:

All pieces included in the lot are transferred to the buyer.
If the lot includes a Joker, this bonus is credited to the buyer.
• Price Variation:
After each purchase, the lot's price increases by 20% for the next buyer. The lot remains available for sale and can be repurchased by other users following the same mechanism.

• Purchase Restriction:
A user cannot purchase a lot if they already own all the pieces in it.

4. Claiming the Complete NFT Puzzle
• Standard Claim (without Joker):
When a user owns all 9 pieces of the puzzle, they can "claim" the complete NFT Puzzle. Upon claiming:

The NFT puzzle is transferred from the initial owner to the user.
Data related to the lots (previous divisions) are deleted, making puzzle ownership definitive.
• Claim with Joker:
If a user does not yet own all the pieces, they can complete the puzzle using accumulated "Jokers":

The number of missing pieces is calculated.
If the user has a number of Jokers equal to or greater than the missing pieces, these will be used to fill the gaps.
After using the necessary Jokers, the puzzle is "claimed," and the NFT is permanently transferred to the user.
• Claimability Check:
It is possible to verify if a puzzle is "claimable" by checking if the user already owns all the pieces or, alternatively, if they have enough Jokers to cover the missing ones.

5. Game System Overview
• Initially:
NFT puzzles are created, and all pieces belong to the creator.

• Division into Lots:
The creator can divide the puzzle into lots, assigning each lot a price, a "revelation" condition (revealed or hidden), and possibly a Joker.

• Purchasing Lots:
Users can purchase lots by paying with USDT Token. Each purchase transfers ownership of the included pieces and, if applicable, credits a Joker to the buyer. Additionally, the lot's price increases for the next buyer.

• Claiming the Complete Puzzle:
When a user owns all pieces (directly or by using Jokers), they can "claim" the complete NFT puzzle, becoming its official owner and canceling all previous lot divisions.

===================================================
This system ensures transparency and fairness in every transaction, guaranteeing that the game operates securely and equitably through the automated management of the smart contract.`;

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-8 py-8">
        <div className="text-center">
          <h1 className={title()}>Regole del Gioco</h1>
          <h4 className={subtitle({ class: 'mt-4' })}>
            Puzzle NFT 
          </h4>
        </div>
        <div className="w-full max-w-4xl">
          <textarea
            readOnly
            value={gameRules}
            className="w-full h-[600px] bg-white text-black p-4 border border-gray-300 rounded-md resize-none"
          />
        </div>
      </section>
    </DefaultLayout>
  );
};

export default GameRulesPage;

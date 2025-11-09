/**
 * Solana Service
 * Handles NFT minting and Solana blockchain interactions
 * 
 * Note: This is a simplified version that will be extended when the Anchor program is deployed.
 * For now, it provides the structure and can be used for testing the flow.
 */

import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Wallet } from '@coral-xyz/anchor';

// Configuration
const SOLANA_NETWORK = 'devnet';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
// TODO: Replace with your actual program ID after deploying Anchor program
const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

export interface PlanetNFTMetadata {
  planet_id: string;
  planet_name: string;
  planet_color?: string;
  avg_temp?: string;
  ocean_coverage?: string;
  gravity?: string;
  earned_date?: string;
}

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
  }

  /**
   * Derive Program Derived Address (PDA) for a planet NFT mint
   */
  deriveMintPDA(planetId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('planet_nft'), Buffer.from(planetId)],
      PROGRAM_ID
    );
  }

  /**
   * Get associated token account for a wallet and mint
   */
  async getAssociatedTokenAccount(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    return getAssociatedTokenAddress(mint, owner);
  }

  /**
   * Upload metadata to backend (which will handle IPFS/Arweave upload)
   * For now, returns a placeholder URI
   */
  async uploadMetadata(metadata: PlanetNFTMetadata): Promise<string> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/nfts/upload-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload metadata: ${response.statusText}`);
      }

      const data = await response.json();
      return data.uri;
    } catch (error) {
      console.warn('Metadata upload failed, using placeholder:', error);
      // Return placeholder URI for now
      return `https://placeholder.metadata/${metadata.planet_id}`;
    }
  }

  /**
   * Mint a planet NFT
   * 
   * Note: This is a placeholder implementation. When the Anchor program is ready,
   * this will call the actual program instruction.
   * 
   * For now, it simulates the minting process and returns mock data.
   */
  async mintPlanetNFT(
    wallet: Wallet,
    planetId: string,
    planetName: string,
    metadata: PlanetNFTMetadata
  ): Promise<{ tokenId: string; signature: string; metadataUri: string }> {
    console.log('🎨 Minting NFT for planet:', planetName);

    // Step 1: Upload metadata
    const metadataUri = await this.uploadMetadata(metadata);
    console.log('✅ Metadata uploaded:', metadataUri);

    // Step 2: Derive mint PDA
    const [mintPda] = this.deriveMintPDA(planetId);
    console.log('📍 Mint PDA:', mintPda.toBase58());

    // Step 3: Get associated token account
    const tokenAccount = await this.getAssociatedTokenAccount(
      mintPda,
      wallet.publicKey
    );
    console.log('💼 Token account:', tokenAccount.toBase58());

    // TODO: When Anchor program is deployed, uncomment and implement:
    /*
    try {
      // Initialize program if needed
      const program = await this.initializeProgram(wallet);
      
      // Build and send transaction
      const tx = await program.methods
        .mintPlanetNft(planetId, planetName, metadataUri)
        .accounts({
          mint: mintPda,
          tokenAccount: tokenAccount,
          owner: wallet.publicKey,
          payer: wallet.publicKey,
          mintAuthority: mintPda,
          // ... other accounts
        })
        .rpc();

      return {
        tokenId: mintPda.toBase58(),
        signature: tx,
        metadataUri,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
    */

    // For now, return mock data
    // In production, this will be replaced with actual Solana transaction
    const mockSignature = `mock_signature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.warn('⚠️ Using mock minting (Anchor program not deployed yet)');
    console.log('📝 Mock token ID:', mintPda.toBase58());
    console.log('📝 Mock signature:', mockSignature);

    return {
      tokenId: mintPda.toBase58(),
      signature: mockSignature,
      metadataUri,
    };
  }

  /**
   * Sign a message for wallet verification
   */
  async signMessage(wallet: Wallet, message: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(message);
    
    // Use wallet adapter's signMessage if available
    if ('signMessage' in wallet && typeof wallet.signMessage === 'function') {
      const signature = await wallet.signMessage(messageBytes);
      return Buffer.from(signature).toString('base64');
    }
    
    // Fallback: create a mock signature
    console.warn('⚠️ Wallet signMessage not available, using mock signature');
    return Buffer.from(`mock_signature_${Date.now()}`).toString('base64');
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<{ connected: boolean; network: string }> {
    try {
      const version = await this.connection.getVersion();
      return {
        connected: true,
        network: SOLANA_NETWORK,
      };
    } catch (error) {
      return {
        connected: false,
        network: SOLANA_NETWORK,
      };
    }
  }

  /**
   * Get balance for a wallet
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }
}

export const solanaService = new SolanaService();


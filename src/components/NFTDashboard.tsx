/**
 * NFT Dashboard Component
 * Displays earned NFTs and allows wallet connection for minting
 */

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useWalletContext, WalletMultiButton } from '../contexts/WalletContext';
import { getEarnedNFTs, getUnmintedNFTs, type PlanetNFT } from '../services/api';
import './NFTDashboard.css';

export function NFTDashboard() {
  const { user } = useAuth0();
  const { isConnected, walletAddress, isLoading, mintEarnedNFTs, error } = useWalletContext();
  const [nfts, setNfts] = useState<PlanetNFT[]>([]);
  const [unmintedCount, setUnmintedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadNFTs();
    }
  }, [user?.email, isConnected]);

  const loadNFTs = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const earned = await getEarnedNFTs(user.email);
      setNfts(earned);
      
      const unminted = await getUnmintedNFTs(user.email);
      setUnmintedCount(unminted.length);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMintAll = async () => {
    await mintEarnedNFTs();
    // Reload NFTs after minting
    setTimeout(() => {
      loadNFTs();
    }, 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNFTs();
      if (isConnected) {
        await mintEarnedNFTs();
        // Reload again after minting attempt
        setTimeout(() => {
          loadNFTs();
        }, 1000);
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="nft-dashboard">
        <div className="nft-loading">Loading NFTs...</div>
      </div>
    );
  }

  return (
    <div className="nft-dashboard">
      <div className="nft-header">
        <div className="header-content">
          <h1 className="nft-title">Planet Collection</h1>
          <p className="nft-subtitle">{nfts.length} {nfts.length === 1 ? 'NFT' : 'NFTs'}</p>
        </div>
        <div className="nft-wallet-section">
          {isConnected && walletAddress && (
            <div className="wallet-badge">
              <span className="wallet-dot"></span>
              <span className="wallet-address">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Refresh and check for new NFTs"
          >
            {refreshing ? (
              <>
                <span className="spinner-small"></span>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh</span>
              </>
            )}
          </button>
          <WalletMultiButton />
        </div>
      </div>

      {error && (
        <div className="nft-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {unmintedCount > 0 && (
        <div className="nft-unminted-banner">
          <div className="unminted-content">
            <div className="unminted-icon">⏳</div>
            <div className="unminted-text">
              <strong>{unmintedCount} unminted NFT{unmintedCount !== 1 ? 's' : ''}</strong>
              <span>Connect wallet to mint to Solana</span>
            </div>
          </div>
          {isConnected ? (
            <button 
              className="mint-all-button" 
              onClick={handleMintAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Minting...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Mint All</span>
                </>
              )}
            </button>
          ) : (
            <div className="connect-hint">Connect wallet above</div>
          )}
        </div>
      )}

      {nfts.length === 0 ? (
        <div className="nft-empty">
          <div className="empty-illustration">
            <div className="empty-icon">🌌</div>
            <div className="empty-stars">
              <span>✨</span>
              <span>⭐</span>
              <span>✨</span>
            </div>
          </div>
          <h3>No NFTs yet</h3>
          <p>Win a game to earn your first planet NFT!</p>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <div key={nft.id} className={`nft-tile ${nft.minted ? 'minted' : 'unminted'}`}>
              <div className="nft-tile-content">
                <div className="nft-visual">
                  <div className="planet-icon">🪐</div>
                  {!nft.minted && <div className="pending-overlay">⏳</div>}
                </div>
                
                <div className="nft-info">
                  <h3 className="nft-planet-name">{nft.planet_name}</h3>
                  <div className="nft-meta">
                    <span className="nft-date">
                      {new Date(nft.earned_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    {nft.minted ? (
                      <span className="nft-badge minted-badge">
                        <span className="badge-dot"></span>
                        Minted
                      </span>
                    ) : (
                      <span className="nft-badge unminted-badge">
                        <span className="badge-dot"></span>
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {nft.minted && nft.token_id && (
                  <a
                    href={`https://solscan.io/token/${nft.token_id}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nft-action-button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Solscan
                    <span>→</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


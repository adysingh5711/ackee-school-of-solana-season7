"use client"

import { useMemo } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { PublicKey } from '@solana/web3.js'
import { SpotifyProgram } from '@/lib/spotify-program'

export interface UserProfile {
    authority: PublicKey
    username: string
    displayName: string
    bio: string
    profileImage: string
    followersCount: number
    followingCount: number
    createdAt: number
}

export interface UserStats {
    user: PublicKey
    tracksCreated: number
    playlistsCreated: number
    totalLikesReceived: number
    totalPlays: number
    lastActive: number
}

export interface Track {
    title: string
    artist: string
    album: string
    genre: string
    duration: number
    audioUrl: string
    coverImage: string
    likesCount: number
    playsCount: number
    createdBy: PublicKey
    createdAt: number
}

export interface Playlist {
    authority: PublicKey
    name: string
    description: string
    isPublic: boolean
    tracksCount: number
    likesCount: number
    playsCount: number
    isCollaborative: boolean
    createdAt: number
    updatedAt: number
}

// Compatibility wrapper to adapt wallet-ui to wallet-adapter interface
function createWalletAdapterCompatibility(walletUi: { account?: { address: string } | null }) {
    return {
        publicKey: walletUi.account?.address ? new PublicKey(walletUi.account.address) : null,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        signTransaction: async (_transaction: unknown) => {
            // This would need to be implemented with wallet-ui's signing method
            throw new Error('Transaction signing not yet implemented for wallet-ui')
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        signAllTransactions: async (_transactions: unknown[]) => {
            throw new Error('Transaction signing not yet implemented for wallet-ui')
        },
        connected: !!walletUi.account,
    }
}

export function useSpotifyProgramWalletUi() {
    const walletUi = useWalletUi()

    const walletCompat = useMemo(() =>
        createWalletAdapterCompatibility(walletUi),
        [walletUi]
    )

    const spotifyProgram = useMemo(() => {
        if (!walletCompat.publicKey) return null
        // For now, we'll return a mock program since transaction signing needs to be implemented
        return null // new SpotifyProgram(walletUi.client, walletCompat)
    }, [walletCompat])

    return {
        program: spotifyProgram,
        connected: walletCompat.connected,
        publicKey: walletCompat.publicKey,
        account: walletUi.account,

        // Mock methods for now - these would need proper implementation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        createUserProfile: async (_username: string, _displayName: string, _bio: string, _profileImage: string) => {
            throw new Error('Not yet implemented - need to integrate with wallet-ui transaction signing')
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updateUserProfile: async (_displayName?: string, _bio?: string, _profileImage?: string) => {
            throw new Error('Not yet implemented - need to integrate with wallet-ui transaction signing')
        },
        getUserProfile: async (_userPubkey: PublicKey): Promise<UserProfile | null> => {
            // Mock data for now
            return {
                authority: _userPubkey,
                username: 'demo_user',
                displayName: 'Demo User',
                bio: 'This is a demo profile',
                profileImage: '',
                followersCount: 0,
                followingCount: 0,
                createdAt: Date.now() / 1000,
            }
        },
        getUserStats: async (_userPubkey: PublicKey): Promise<UserStats | null> => {
            return {
                user: _userPubkey,
                tracksCreated: 0,
                playlistsCreated: 0,
                totalLikesReceived: 0,
                totalPlays: 0,
                lastActive: Date.now() / 1000,
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getUserTracks: async (_userPubkey: PublicKey): Promise<Track[]> => {
            return []
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getUserPlaylists: async (_userPubkey: PublicKey): Promise<Playlist[]> => {
            return []
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        createTrack: async (_title: string, _artist: string, _album: string, _genre: string, _duration: number, _audioUrl: string, _coverImage: string) => {
            throw new Error('Not yet implemented - need to integrate with wallet-ui transaction signing')
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        playTrack: async (_trackPubkey: PublicKey, _creatorPubkey: PublicKey, _durationPlayed: number) => {
            throw new Error('Not yet implemented - need to integrate with wallet-ui transaction signing')
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        createPlaylist: async (_name: string, _description: string, _isPublic: boolean, _isCollaborative: boolean) => {
            throw new Error('Not yet implemented - need to integrate with wallet-ui transaction signing')
        },

        // Utility
        getPDA: SpotifyProgram.getPDA,
    }
}

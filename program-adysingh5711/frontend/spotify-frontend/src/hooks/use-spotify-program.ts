"use client"

import { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
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

export function useSpotifyProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const spotifyProgram = useMemo(() => {
    if (!wallet.publicKey) return null
    return new SpotifyProgram(connection, wallet)
  }, [connection, wallet])

  return {
    program: spotifyProgram,
    connected: !!spotifyProgram && !!wallet.publicKey,
    publicKey: wallet.publicKey,
    
    // User methods
    createUserProfile: spotifyProgram?.createUserProfile.bind(spotifyProgram),
    updateUserProfile: spotifyProgram?.updateUserProfile.bind(spotifyProgram),
    getUserProfile: spotifyProgram?.fetchUserProfile.bind(spotifyProgram),
    getUserStats: spotifyProgram?.fetchUserStats.bind(spotifyProgram),
    getUserTracks: spotifyProgram?.fetchUserTracks.bind(spotifyProgram),
    getUserPlaylists: spotifyProgram?.fetchUserPlaylists.bind(spotifyProgram),
    
    // Track methods
    createTrack: spotifyProgram?.createTrack.bind(spotifyProgram),
    playTrack: spotifyProgram?.playTrack.bind(spotifyProgram),
    
    // Playlist methods
    createPlaylist: spotifyProgram?.createPlaylist.bind(spotifyProgram),
    
    // Utility
    getPDA: SpotifyProgram.getPDA,
  }
}

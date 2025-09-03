import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'

// Program ID from Anchor.toml
export const SPOTIFY_PROGRAM_ID = new PublicKey('2ufGdkX3kG72BbcWXPo1jUqAxiYTPmbe6yBQV6LTgbse')

// Type definitions
interface UserProfile {
  authority: string
  username: string
  displayName: string
  bio: string
  profileImage: string
  followersCount: number
  followingCount: number
  createdAt: number
}

interface UserStats {
  user: string
  tracksCreated: number
  playlistsCreated: number
  totalLikesReceived: number
  totalPlays: number
  lastActive: number
}

interface Track {
  authority: string
  title: string
  artist: string
  album: string
  genre: string
  duration: number
  audioUrl: string
  coverImage: string
  likesCount: number
  playsCount: number
  createdAt: number
  createdBy: string
}

interface Playlist {
  authority: string
  name: string
  description: string
  isPublic: boolean
  isCollaborative: boolean
  tracksCount: number
  likesCount: number
  playsCount: number
  createdAt: number
  updatedAt: number
}

// Instruction discriminators (first 8 bytes of instruction data)
const INSTRUCTION_DISCRIMINATORS = {
  CREATE_USER_PROFILE: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]), // Replace with actual discriminator
  UPDATE_USER_PROFILE: Buffer.from([1, 1, 2, 3, 4, 5, 6, 7]),
  CREATE_TRACK: Buffer.from([2, 1, 2, 3, 4, 5, 6, 7]),
  CREATE_PLAYLIST: Buffer.from([3, 1, 2, 3, 4, 5, 6, 7]),
  ADD_TRACK_TO_PLAYLIST: Buffer.from([4, 1, 2, 3, 4, 5, 6, 7]),
  PLAY_TRACK: Buffer.from([5, 1, 2, 3, 4, 5, 6, 7]),
}

export class SpotifyProgram {
  constructor(
    private connection: Connection,
    private wallet: WalletContextState,
    private programId: PublicKey = SPOTIFY_PROGRAM_ID
  ) { }

  // Helper to derive PDAs
  public static getPDA(seeds: (string | Buffer | Uint8Array | PublicKey)[], programId: PublicKey = SPOTIFY_PROGRAM_ID) {
    const seedBuffers = seeds.map(seed => {
      if (typeof seed === 'string') return Buffer.from(seed, 'utf-8')
      if (seed instanceof PublicKey) return seed.toBuffer()
      return Buffer.from(seed)
    })

    return PublicKey.findProgramAddressSync(seedBuffers, programId)
  }

  // Serialize string for Anchor
  private serializeString(str: string): Buffer {
    const buffer = Buffer.alloc(4 + str.length)
    buffer.writeUInt32LE(str.length, 0)
    buffer.write(str, 4)
    return buffer
  }

  // Serialize u64 for Anchor
  private serializeU64(num: number): Buffer {
    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64LE(BigInt(num), 0)
    return buffer
  }

  // Serialize boolean for Anchor
  private serializeBool(bool: boolean): Buffer {
    return Buffer.from([bool ? 1 : 0])
  }

  // Create user profile instruction
  async createUserProfile(
    username: string,
    displayName: string,
    bio: string,
    profileImage: string
  ): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    const [userProfilePDA] = SpotifyProgram.getPDA(['user_profile', this.wallet.publicKey])
    const [userStatsPDA] = SpotifyProgram.getPDA(['user_stats', this.wallet.publicKey])

    // Serialize instruction data
    const instructionData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.CREATE_USER_PROFILE,
      this.serializeString(username),
      this.serializeString(displayName),
      this.serializeString(bio),
      this.serializeString(profileImage)
    ])

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userProfilePDA, isSigner: false, isWritable: true },
        { pubkey: userStatsPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: instructionData,
    })

    return this.sendTransaction([instruction])
  }

  // Update user profile instruction
  async updateUserProfile(
    displayName?: string,
    bio?: string,
    profileImage?: string
  ): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    const [userProfilePDA] = SpotifyProgram.getPDA(['user_profile', this.wallet.publicKey])
    const [userStatsPDA] = SpotifyProgram.getPDA(['user_stats', this.wallet.publicKey])

    // Serialize optional fields
    const serializeOptionalString = (str?: string) => {
      if (str === undefined) return Buffer.from([0]) // None variant
      return Buffer.concat([Buffer.from([1]), this.serializeString(str)]) // Some variant
    }

    const instructionData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.UPDATE_USER_PROFILE,
      serializeOptionalString(displayName),
      serializeOptionalString(bio),
      serializeOptionalString(profileImage)
    ])

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userProfilePDA, isSigner: false, isWritable: true },
        { pubkey: userStatsPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data: instructionData,
    })

    return this.sendTransaction([instruction])
  }

  // Create track instruction
  async createTrack(
    title: string,
    artist: string,
    album: string,
    genre: string,
    duration: number,
    audioUrl: string,
    coverImage: string
  ): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    const [trackPDA] = SpotifyProgram.getPDA(['track', this.wallet.publicKey, title, artist])
    const [userStatsPDA] = SpotifyProgram.getPDA(['user_stats', this.wallet.publicKey])

    const instructionData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.CREATE_TRACK,
      this.serializeString(title),
      this.serializeString(artist),
      this.serializeString(album),
      this.serializeString(genre),
      this.serializeU64(duration),
      this.serializeString(audioUrl),
      this.serializeString(coverImage)
    ])

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: trackPDA, isSigner: false, isWritable: true },
        { pubkey: userStatsPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: instructionData,
    })

    return this.sendTransaction([instruction])
  }

  // Create playlist instruction
  async createPlaylist(
    name: string,
    description: string,
    isPublic: boolean,
    isCollaborative: boolean
  ): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    const [playlistPDA] = SpotifyProgram.getPDA(['playlist', this.wallet.publicKey, name])
    const [userStatsPDA] = SpotifyProgram.getPDA(['user_stats', this.wallet.publicKey])

    const instructionData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.CREATE_PLAYLIST,
      this.serializeString(name),
      this.serializeString(description),
      this.serializeBool(isPublic),
      this.serializeBool(isCollaborative)
    ])

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: playlistPDA, isSigner: false, isWritable: true },
        { pubkey: userStatsPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: instructionData,
    })

    return this.sendTransaction([instruction])
  }

  // Play track instruction
  async playTrack(trackPubkey: PublicKey, creatorPubkey: PublicKey, durationPlayed: number): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    const [trackPlayPDA] = SpotifyProgram.getPDA(['track_play', trackPubkey, this.wallet.publicKey])
    const [userStatsPDA] = SpotifyProgram.getPDA(['user_stats', this.wallet.publicKey])
    const [creatorStatsPDA] = SpotifyProgram.getPDA(['user_stats', creatorPubkey])

    const instructionData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.PLAY_TRACK,
      this.serializeU64(durationPlayed)
    ])

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: trackPubkey, isSigner: false, isWritable: true },
        { pubkey: trackPlayPDA, isSigner: false, isWritable: true },
        { pubkey: userStatsPDA, isSigner: false, isWritable: true },
        { pubkey: creatorStatsPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: instructionData,
    })

    return this.sendTransaction([instruction])
  }

  // Helper method to send transaction
  private async sendTransaction(instructions: TransactionInstruction[]): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    const transaction = new Transaction().add(...instructions)
    const { blockhash } = await this.connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = this.wallet.publicKey

    const signedTransaction = await this.wallet.signTransaction(transaction)
    const signature = await this.connection.sendRawTransaction(signedTransaction.serialize())

    await this.connection.confirmTransaction(signature, 'confirmed')
    return signature
  }

  // Fetch user profile
  async fetchUserProfile(userPubkey: PublicKey): Promise<UserProfile | null> {
    try {
      const [userProfilePDA] = SpotifyProgram.getPDA(['user_profile', userPubkey])
      const accountInfo = await this.connection.getAccountInfo(userProfilePDA)

      if (!accountInfo) return null

      // Deserialize account data (you'd implement proper deserialization here)
      // For now, returning mock data structure
      return {
        authority: userPubkey.toBase58(),
        username: 'mock_user',
        displayName: 'Mock User',
        bio: 'Mock bio',
        profileImage: '',
        followersCount: 0,
        followingCount: 0,
        createdAt: Math.floor(Date.now() / 1000),
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Fetch user stats
  async fetchUserStats(userPubkey: PublicKey): Promise<UserStats | null> {
    try {
      const [userStatsPDA] = SpotifyProgram.getPDA(['user_stats', userPubkey])
      const accountInfo = await this.connection.getAccountInfo(userStatsPDA)

      if (!accountInfo) return null

      // Deserialize account data
      return {
        user: userPubkey.toBase58(),
        tracksCreated: 0,
        playlistsCreated: 0,
        totalLikesReceived: 0,
        totalPlays: 0,
        lastActive: Math.floor(Date.now() / 1000),
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return null
    }
  }

  // Fetch all tracks by user
  async fetchUserTracks(userPubkey: PublicKey): Promise<Track[]> {
    try {
      // In a real implementation, you'd query all track accounts created by this user
      // This would involve using getProgramAccounts with proper filters
      await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: userPubkey.toBase58(),
            },
          },
        ],
      })

      // Parse and return tracks (mock implementation)
      return []
    } catch (error) {
      console.error('Error fetching user tracks:', error)
      return []
    }
  }

  // Fetch all playlists by user
  async fetchUserPlaylists(userPubkey: PublicKey): Promise<Playlist[]> {
    try {
      // Similar to fetchUserTracks, but for playlists
      await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: userPubkey.toBase58(),
            },
          },
        ],
      })

      // Parse and return playlists (mock implementation)
      return []
    } catch (error) {
      console.error('Error fetching user playlists:', error)
      return []
    }
  }
}

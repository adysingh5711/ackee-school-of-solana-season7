"use client"

import * as React from "react"
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm, UserProfileDisplay } from "./user-profile-form"
import { TrackForm, TrackCard } from "./track-form"
import { PlaylistForm, PlaylistCard } from "./playlist-form"
import { SocialTabs } from "./social-components"
import { useSpotifyProgram } from "@/hooks/use-spotify-program"

// Import types from spotify-program
type UserProfile = {
    authority: string
    username: string
    displayName: string
    bio: string
    profileImage: string
    followersCount: number
    followingCount: number
    createdAt: number
}

type UserStats = {
    user: string
    tracksCreated: number
    playlistsCreated: number
    totalLikesReceived: number
    totalPlays: number
    lastActive: number
}

type Track = {
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

type Playlist = {
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

export function SpotifyDashboard() {
    const { connected, publicKey } = useWallet()
    const {
        connected: programConnected,
        getUserProfile,
        getUserStats,
        getUserTracks,
        getUserPlaylists,
        createUserProfile,
        createTrack,
        createPlaylist
    } = useSpotifyProgram()

    const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null)
    const [userStats, setUserStats] = React.useState<UserStats | null>(null)
    const [userTracks, setUserTracks] = React.useState<Track[]>([])
    const [userPlaylists, setUserPlaylists] = React.useState<Playlist[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState("overview")

    const loadUserData = React.useCallback(async () => {
        if (!publicKey) return

        setIsLoading(true)
        try {
            const [profile, stats, tracks, playlists] = await Promise.all([
                getUserProfile?.(publicKey),
                getUserStats?.(publicKey),
                getUserTracks?.(publicKey),
                getUserPlaylists?.(publicKey)
            ])

            setUserProfile(profile || null)
            setUserStats(stats || null)
            setUserTracks(tracks || [])
            setUserPlaylists(playlists || [])
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [publicKey, getUserProfile, getUserStats, getUserTracks, getUserPlaylists])

    // Load user data when wallet connects
    React.useEffect(() => {
        if (programConnected && publicKey) {
            loadUserData()
        }
    }, [programConnected, publicKey, loadUserData])

    interface UserProfileData {
        username: string
        displayName: string
        bio: string
        profileImage?: string
    }

    const handleCreateProfile = async (data: UserProfileData) => {
        setIsLoading(true)
        try {
            await createUserProfile?.(data.username, data.displayName, data.bio, data.profileImage || '')
            await loadUserData()
        } catch (error) {
            console.error('Error creating profile:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    interface TrackData {
        title: string
        artist: string
        album: string
        genre: string
        duration: number
        audioUrl: string
        coverImage?: string
    }

    const handleCreateTrack = async (data: TrackData) => {
        setIsLoading(true)
        try {
            await createTrack?.(
                data.title,
                data.artist,
                data.album,
                data.genre,
                data.duration,
                data.audioUrl,
                data.coverImage || ''
            )
            await loadUserData()
        } catch (error) {
            console.error('Error creating track:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    interface PlaylistData {
        name: string
        description: string
        isPublic: boolean
        isCollaborative: boolean
    }

    const handleCreatePlaylist = async (data: PlaylistData) => {
        setIsLoading(true)
        try {
            await createPlaylist?.(data.name, data.description, data.isPublic, data.isCollaborative)
            await loadUserData()
        } catch (error) {
            console.error('Error creating playlist:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>Welcome to Spotify dApp</CardTitle>
                        <CardDescription>
                            Connect your Solana wallet to start using the decentralized music platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <WalletMultiButton />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Create Your Profile</CardTitle>
                        <CardDescription>
                            Set up your profile to start sharing music on the Spotify dApp
                        </CardDescription>
                    </CardHeader>
                </Card>
                <UserProfileForm onSubmit={handleCreateProfile} isLoading={isLoading} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Spotify dApp</h1>
                    <p className="text-muted-foreground">
                        Decentralized music platform on Solana
                    </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected
                </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="tracks">Tracks</TabsTrigger>
                    <TabsTrigger value="playlists">Playlists</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="discover">Discover</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tracks</CardTitle>
                                <span className="text-2xl">🎵</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats?.tracksCreated || 0}</div>
                                <p className="text-xs text-muted-foreground">tracks created</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Playlists</CardTitle>
                                <span className="text-2xl">📝</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats?.playlistsCreated || 0}</div>
                                <p className="text-xs text-muted-foreground">playlists created</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Likes</CardTitle>
                                <span className="text-2xl">❤️</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats?.totalLikesReceived || 0}</div>
                                <p className="text-xs text-muted-foreground">likes received</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Plays</CardTitle>
                                <span className="text-2xl">▶️</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats?.totalPlays || 0}</div>
                                <p className="text-xs text-muted-foreground">total plays</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Tracks</CardTitle>
                                <CardDescription>Your latest uploads</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userTracks.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No tracks yet</p>
                                        <Button className="mt-4" onClick={() => setActiveTab("tracks")}>
                                            Upload Your First Track
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userTracks.slice(0, 3).map((track, index) => (
                                            <TrackCard
                                                key={index}
                                                track={track}
                                                showArtist={false}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Playlists</CardTitle>
                                <CardDescription>Your latest playlists</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userPlaylists.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No playlists yet</p>
                                        <Button className="mt-4" onClick={() => setActiveTab("playlists")}>
                                            Create Your First Playlist
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userPlaylists.slice(0, 3).map((playlist, index) => (
                                            <PlaylistCard
                                                key={index}
                                                playlist={playlist}
                                                isOwner={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="profile" className="space-y-6">
                    {userProfile && (
                        <UserProfileDisplay
                            profile={userProfile}
                            stats={userStats || undefined}
                            isOwnProfile={true}
                        />
                    )}
                </TabsContent>

                <TabsContent value="tracks" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Your Tracks</h2>
                            <p className="text-muted-foreground">Manage your uploaded tracks</p>
                        </div>
                        <Button onClick={() => setActiveTab("upload-track")}>
                            Upload Track
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {userTracks.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-muted-foreground mb-4">You haven&apos;t uploaded any tracks yet</p>
                                    <TrackForm onSubmit={handleCreateTrack} isLoading={isLoading} />
                                </CardContent>
                            </Card>
                        ) : (
                            userTracks.map((track, index) => (
                                <TrackCard
                                    key={index}
                                    track={track}
                                    showArtist={false}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="playlists" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Your Playlists</h2>
                            <p className="text-muted-foreground">Manage your playlists</p>
                        </div>
                        <Button onClick={() => setActiveTab("create-playlist")}>
                            Create Playlist
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {userPlaylists.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-muted-foreground mb-4">You haven&apos;t created any playlists yet</p>
                                    <PlaylistForm onSubmit={handleCreatePlaylist} isLoading={isLoading} />
                                </CardContent>
                            </Card>
                        ) : (
                            userPlaylists.map((playlist, index) => (
                                <PlaylistCard
                                    key={index}
                                    playlist={playlist}
                                    isOwner={true}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-6">
                    <SocialTabs
                        followers={[]} // You'd fetch these from the blockchain
                        following={[]} // You'd fetch these from the blockchain
                        activities={[]} // You'd fetch these from the blockchain
                        onUserClick={(user) => console.log('User clicked:', user)}
                        onFollowToggle={(user) => console.log('Follow toggle:', user)}
                        isLoading={isLoading}
                    />
                </TabsContent>

                <TabsContent value="discover" className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Discover Music</h2>
                        <p className="text-muted-foreground">Explore tracks and playlists from the community</p>
                    </div>

                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">Discovery features coming soon!</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Browse tracks, follow artists, and discover new music from the community.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

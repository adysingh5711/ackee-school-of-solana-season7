"use client"

import * as React from "react"
import { useWalletUi } from '@wallet-ui/react'
import { WalletButton } from '@/components/solana/solana-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm, UserProfileDisplay } from "./user-profile-form"
import { TrackForm, TrackCard } from "./track-form"
import { PlaylistForm, PlaylistCard } from "./playlist-form"
import { SocialTabs } from "./social-components"
import { SimplePlayerProvider } from "./simple-audio-player"
import { useSpotifyProgramWalletUi, UserProfile, UserStats, Track, Playlist } from "@/hooks/use-spotify-program-wallet-ui"

// Type adapters to convert PublicKey-based types to string-based types for components
const adaptTrackForComponent = (track: Track) => ({
    ...track,
    createdBy: track.createdBy.toString()
})

const adaptPlaylistForComponent = (playlist: Playlist) => ({
    ...playlist,
    authority: playlist.authority.toString()
})

const adaptUserStatsForComponent = (stats: UserStats | null) => {
    if (!stats) return undefined
    return {
        tracksCreated: stats.tracksCreated,
        playlistsCreated: stats.playlistsCreated,
        totalLikesReceived: stats.totalLikesReceived,
        totalPlays: stats.totalPlays
    }
}

interface SpotifyDashboardProps {
    className?: string
}

export function SpotifyDashboardWalletUi({ }: SpotifyDashboardProps) {
    const { account } = useWalletUi()
    const {
        connected,
        publicKey,
        getUserProfile,
        getUserStats,
        getUserTracks,
        getUserPlaylists,
        createUserProfile,
        createTrack,
        createPlaylist
    } = useSpotifyProgramWalletUi()

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
                getUserProfile(publicKey),
                getUserStats(publicKey),
                getUserTracks(publicKey),
                getUserPlaylists(publicKey)
            ])

            setUserProfile(profile)
            setUserStats(stats)
            setUserTracks(tracks)
            setUserPlaylists(playlists)
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [publicKey, getUserProfile, getUserStats, getUserTracks, getUserPlaylists])

    // Load user data when wallet connects
    React.useEffect(() => {
        if (connected && publicKey) {
            loadUserData()
        }
    }, [connected, publicKey, loadUserData])



    const handleCreateProfile = async (data: {
        username: string
        displayName: string
        bio: string
        profileImage?: string
    }) => {
        setIsLoading(true)
        try {
            await createUserProfile(data.username, data.displayName, data.bio, data.profileImage || '')
            await loadUserData()
        } catch (error) {
            console.error('Error creating profile:', error)
            // For demo purposes, create a mock profile
            setUserProfile({
                authority: publicKey!,
                username: data.username,
                displayName: data.displayName,
                bio: data.bio,
                profileImage: data.profileImage || '',
                followersCount: 0,
                followingCount: 0,
                createdAt: Date.now() / 1000,
            })
            setUserStats({
                user: publicKey!,
                tracksCreated: 0,
                playlistsCreated: 0,
                totalLikesReceived: 0,
                totalPlays: 0,
                lastActive: Date.now() / 1000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateTrack = async (data: {
        title: string
        artist: string
        album: string
        genre: string
        duration: number
        audioUrl: string
        coverImage?: string
    }) => {
        setIsLoading(true)
        try {
            await createTrack(
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
            // For demo purposes, add to mock tracks
            const newTrack: Track = {
                title: data.title,
                artist: data.artist,
                album: data.album,
                genre: data.genre,
                duration: data.duration,
                audioUrl: data.audioUrl,
                coverImage: data.coverImage || '',
                likesCount: 0,
                playsCount: 0,
                createdBy: publicKey!,
                createdAt: Date.now() / 1000,
            }
            setUserTracks(prev => [...prev, newTrack])
            if (userStats) {
                setUserStats(prev => prev ? { ...prev, tracksCreated: prev.tracksCreated + 1 } : null)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreatePlaylist = async (data: {
        name: string
        description: string
        isPublic: boolean
        isCollaborative: boolean
    }) => {
        setIsLoading(true)
        try {
            await createPlaylist(data.name, data.description, data.isPublic, data.isCollaborative)
            await loadUserData()
        } catch (error) {
            console.error('Error creating playlist:', error)
            // For demo purposes, add to mock playlists
            const newPlaylist: Playlist = {
                authority: publicKey!,
                name: data.name,
                description: data.description,
                isPublic: data.isPublic,
                tracksCount: 0,
                likesCount: 0,
                playsCount: 0,
                isCollaborative: data.isCollaborative,
                createdAt: Date.now() / 1000,
                updatedAt: Date.now() / 1000,
            }
            setUserPlaylists(prev => [...prev, newPlaylist])
            if (userStats) {
                setUserStats(prev => prev ? { ...prev, playlistsCreated: prev.playlistsCreated + 1 } : null)
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">🎵 Spotify dApp</CardTitle>
                        <CardDescription>
                            Connect your Solana wallet to start using the decentralized music platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <WalletButton />
                        <div className="text-sm text-muted-foreground text-center">
                            <p>Features:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Upload and stream music</li>
                                <li>Create playlists</li>
                                <li>Follow artists</li>
                                <li>On-chain analytics</li>
                            </ul>
                        </div>
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
                        <CardTitle className="text-2xl">🎵 Welcome to Spotify dApp</CardTitle>
                        <CardDescription>
                            Set up your profile to start sharing music on the decentralized platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Badge variant="outline" className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Wallet Connected: {account?.address.slice(0, 8)}...
                        </Badge>
                    </CardContent>
                </Card>
                <UserProfileForm onSubmit={handleCreateProfile} isLoading={isLoading} />
            </div>
        )
    }

    return (
        <SimplePlayerProvider>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">🎵 Spotify dApp</h1>
                        <p className="text-muted-foreground">
                            Decentralized music platform on Solana
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Connected
                        </Badge>
                        <WalletButton />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="tracks">Tracks</TabsTrigger>
                        <TabsTrigger value="playlists">Playlists</TabsTrigger>
                        <TabsTrigger value="social">Social</TabsTrigger>
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
                                            {userTracks.length === 0 && (
                                                <div className="p-4 border border-dashed rounded-lg">
                                                    <p className="text-sm text-muted-foreground mb-2">Try the demo track:</p>
                                                    <TrackCard
                                                        track={{
                                                            title: "Demo Song",
                                                            artist: "Demo Artist",
                                                            album: "Demo Album",
                                                            genre: "Electronic",
                                                            duration: 180,
                                                            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                                                            coverImage: "",
                                                            likesCount: 42,
                                                            playsCount: 128,
                                                            createdBy: "demo",
                                                            createdAt: Date.now() / 1000
                                                        }}
                                                        showArtist={false}
                                                    />
                                                </div>
                                            )}
                                            {userTracks.slice(0, 3).map((track, index) => (
                                                <TrackCard
                                                    key={index}
                                                    track={adaptTrackForComponent(track)}
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
                                                    playlist={adaptPlaylistForComponent(playlist)}
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
                                profile={{
                                    username: userProfile.username,
                                    displayName: userProfile.displayName,
                                    bio: userProfile.bio,
                                    profileImage: userProfile.profileImage,
                                    followersCount: userProfile.followersCount,
                                    followingCount: userProfile.followingCount,
                                    createdAt: userProfile.createdAt
                                }}
                                stats={adaptUserStatsForComponent(userStats)}
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
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TrackForm onSubmit={handleCreateTrack} isLoading={isLoading} />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Tracks ({userTracks.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {userTracks.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">Upload your first track using the form</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userTracks.map((track, index) => (
                                                <TrackCard
                                                    key={index}
                                                    track={adaptTrackForComponent(track)}
                                                    showArtist={false}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="playlists" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Your Playlists</h2>
                                <p className="text-muted-foreground">Manage your playlists</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PlaylistForm onSubmit={handleCreatePlaylist} isLoading={isLoading} />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Playlists ({userPlaylists.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {userPlaylists.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">Create your first playlist using the form</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userPlaylists.map((playlist, index) => (
                                                <PlaylistCard
                                                    key={index}
                                                    playlist={adaptPlaylistForComponent(playlist)}
                                                    isOwner={true}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-6">
                        <SocialTabs
                            followers={[]}
                            following={[]}
                            activities={[]}
                            onUserClick={(user) => console.log('User clicked:', user)}
                            onFollowToggle={(user) => console.log('Follow toggle:', user)}
                            isLoading={isLoading}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </SimplePlayerProvider>
    )
}

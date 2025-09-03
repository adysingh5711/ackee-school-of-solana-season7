"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSpotifyProgram } from "@/hooks/use-spotify-program"

interface Track {
    title: string
    artist: string
    album: string
    genre: string
    duration: number
    audioUrl: string
    coverImage: string
    likesCount: number
    playsCount: number
    createdBy: string
    createdAt: number
    publicKey?: string
}

interface AudioPlayerProps {
    track: Track | null
    onTrackEnd?: () => void
    onPlayStart?: () => void
    onError?: (error: string) => void
}

export function AudioPlayer({ track, onTrackEnd, onPlayStart, onError }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [currentTime, setCurrentTime] = React.useState(0)
    const [duration, setDuration] = React.useState(0)
    const [volume, setVolume] = React.useState(1)
    const [isLoading, setIsLoading] = React.useState(false)
    const [playStartTime, setPlayStartTime] = React.useState<number | null>(null)

    const audioRef = React.useRef<HTMLAudioElement>(null)
    const { playTrack } = useSpotifyProgram()

    // Format time for display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Handle play/pause
    const handlePlayPause = async () => {
        if (!audioRef.current || !track) return

        try {
            if (isPlaying) {
                audioRef.current.pause()
                setIsPlaying(false)

                // Record play duration on blockchain when pausing
                if (playStartTime && playTrack) {
                    const durationPlayed = Math.floor((Date.now() - playStartTime) / 1000)
                    if (durationPlayed > 0) {
                        await recordPlayOnChain(durationPlayed)
                    }
                }
                setPlayStartTime(null)
            } else {
                await audioRef.current.play()
                setIsPlaying(true)
                setPlayStartTime(Date.now())
                onPlayStart?.()
            }
        } catch (error) {
            console.error('Audio playback error:', error)
            onError?.(`Failed to play audio: ${error}`)
            setIsPlaying(false)
        }
    }

    // Record play on blockchain
    const recordPlayOnChain = async (durationPlayed: number) => {
        if (!track?.publicKey || !track?.createdBy || !playTrack) return

        try {
            setIsLoading(true)
            await playTrack(track.publicKey, track.createdBy, durationPlayed)
        } catch (error) {
            console.error('Failed to record play on blockchain:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle time updates
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    // Handle metadata loaded
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    // Handle track ended
    const handleEnded = async () => {
        setIsPlaying(false)
        setCurrentTime(0)

        // Record full play duration on blockchain
        if (playStartTime && playTrack && track) {
            const durationPlayed = Math.floor((Date.now() - playStartTime) / 1000)
            await recordPlayOnChain(durationPlayed)
        }
        setPlayStartTime(null)

        onTrackEnd?.()
    }

    // Handle seek
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const newTime = (clickX / rect.width) * duration

        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    // Handle volume change
    const handleVolumeChange = (newVolume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = newVolume
            setVolume(newVolume)
        }
    }

    // Reset player when track changes
    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
            setCurrentTime(0)
            setPlayStartTime(null)
        }
    }, [track?.audioUrl])

    if (!track) {
        return (
            <Card className="w-full">
                <CardContent className="p-4 text-center text-muted-foreground">
                    No track selected
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardContent className="p-4">
                <audio
                    ref={audioRef}
                    src={track.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    onError={(e) => onError?.(`Audio error: ${e.currentTarget.error?.message}`)}
                    preload="metadata"
                />

                <div className="flex items-center gap-4">
                    {/* Album Cover */}
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        {track.coverImage ? (
                            <img
                                src={track.coverImage}
                                alt={`${track.title} cover`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-muted-foreground text-xs">♪</div>
                        )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        {track.album && (
                            <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            {track.genre && (
                                <Badge variant="secondary" className="text-xs">
                                    {track.genre}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            size="lg"
                            variant={isPlaying ? "secondary" : "default"}
                            onClick={handlePlayPause}
                            disabled={isLoading}
                            className="w-12 h-12 rounded-full"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : isPlaying ? (
                                "⏸️"
                            ) : (
                                "▶️"
                            )}
                        </Button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs">🔊</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-16 h-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <div
                            className="flex-1 h-2 bg-muted rounded-full cursor-pointer"
                            onClick={handleSeek}
                        >
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                            />
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Track Stats */}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{track.playsCount} plays • {track.likesCount} likes</span>
                    {isLoading && <span>Recording play...</span>}
                </div>
            </CardContent>
        </Card>
    )
}

// Global player context for managing current track across the app
interface PlayerContextType {
    currentTrack: Track | null
    isPlaying: boolean
    playTrack: (track: Track) => void
    pauseTrack: () => void
    queue: Track[]
    addToQueue: (track: Track) => void
    clearQueue: () => void
}

const PlayerContext = React.createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = React.useState<Track | null>(null)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [queue, setQueue] = React.useState<Track[]>([])

    const playTrack = (track: Track) => {
        setCurrentTrack(track)
        setIsPlaying(true)
    }

    const pauseTrack = () => {
        setIsPlaying(false)
    }

    const addToQueue = (track: Track) => {
        setQueue(prev => [...prev, track])
    }

    const clearQueue = () => {
        setQueue([])
    }

    const handleTrackEnd = () => {
        // Play next track in queue
        if (queue.length > 0) {
            const nextTrack = queue[0]
            setQueue(prev => prev.slice(1))
            playTrack(nextTrack)
        } else {
            setIsPlaying(false)
            setCurrentTrack(null)
        }
    }

    return (
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            playTrack,
            pauseTrack,
            queue,
            addToQueue,
            clearQueue
        }}>
            {children}
            {/* Global Player - Always visible at bottom */}
            {currentTrack && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
                    <AudioPlayer
                        track={currentTrack}
                        onTrackEnd={handleTrackEnd}
                    />
                </div>
            )}
        </PlayerContext.Provider>
    )
}

export const usePlayer = () => {
    const context = React.useContext(PlayerContext)
    if (!context) {
        throw new Error('usePlayer must be used within PlayerProvider')
    }
    return context
}

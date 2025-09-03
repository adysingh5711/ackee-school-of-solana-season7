"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"

const trackFormSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(128, "Title must be 128 characters or less"),
    artist: z.string()
        .min(1, "Artist is required")
        .max(64, "Artist name must be 64 characters or less"),
    album: z.string()
        .max(64, "Album name must be 64 characters or less"),
    genre: z.string()
        .max(32, "Genre must be 32 characters or less"),
    duration: z.number()
        .min(1, "Duration must be at least 1 second")
        .max(7200, "Duration cannot exceed 2 hours"),
    audioUrl: z.string()
        .min(1, "Audio URL is required")
        .max(256, "Audio URL must be 256 characters or less")
        .url("Must be a valid URL"),
    coverImage: z.string()
        .max(256, "Cover image URL must be 256 characters or less")
        .url("Must be a valid URL")
        .optional()
        .or(z.literal(""))
})

type TrackFormData = z.infer<typeof trackFormSchema>

interface TrackFormProps {
    onSubmit: (data: TrackFormData) => Promise<void>
    defaultValues?: Partial<TrackFormData>
    isLoading?: boolean
}

export function TrackForm({
    onSubmit,
    defaultValues,
    isLoading = false
}: TrackFormProps) {
    const form = useForm<TrackFormData>({
        resolver: zodResolver(trackFormSchema),
        defaultValues: {
            title: defaultValues?.title || "",
            artist: defaultValues?.artist || "",
            album: defaultValues?.album || "",
            genre: defaultValues?.genre || "",
            duration: defaultValues?.duration || 0,
            audioUrl: defaultValues?.audioUrl || "",
            coverImage: defaultValues?.coverImage || "",
        },
    })

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const watchedValues = form.watch()

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        {watchedValues.coverImage ? (
                            <img
                                src={watchedValues.coverImage}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-muted-foreground text-xs text-center">
                                No Cover
                            </div>
                        )}
                    </div>
                    <div>
                        <CardTitle>Upload Track</CardTitle>
                        <CardDescription>
                            Share your music with the Spotify dApp community
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Track Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Song Title"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="artist"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Artist</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Artist Name"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="album"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Album</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Album Name (optional)"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="genre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Genre</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Pop, Rock, Hip-Hop"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (seconds)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="180"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Duration in seconds {field.value > 0 && `(${formatDuration(field.value)})`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="audioUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Audio File URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/your-track.mp3"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Direct link to your audio file (MP3, WAV, etc.)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="coverImage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cover Image URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/cover.jpg (optional)"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        URL to your track's cover art. Leave empty for default.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    "Upload Track"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

interface Track {
    title: string
    artist: string
    album: string
    genre: string
    duration: number
    audioUrl: string
    coverImage?: string
    likesCount: number
    playsCount: number
    createdBy: string
    createdAt: number
}

interface TrackCardProps {
    track: Track
    onPlay?: () => void
    onLike?: () => void
    onUnlike?: () => void
    isLiked?: boolean
    isPlaying?: boolean
    isLoading?: boolean
    showArtist?: boolean
}

export function TrackCard({
    track,
    onPlay,
    onLike,
    onUnlike,
    isLiked = false,
    isPlaying = false,
    isLoading = false,
    showArtist = true
}: TrackCardProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Card className="w-full">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
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

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        {showArtist && (
                            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        )}
                        {track.album && (
                            <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            {track.genre && (
                                <Badge variant="secondary" className="text-xs">
                                    {track.genre}
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                                {formatDuration(track.duration)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-muted-foreground">
                            <div>{track.playsCount} plays</div>
                            <div>{track.likesCount} likes</div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Button
                                size="sm"
                                variant={isPlaying ? "secondary" : "outline"}
                                onClick={onPlay}
                                disabled={isLoading}
                            >
                                {isPlaying ? "⏸️" : "▶️"}
                            </Button>

                            <Button
                                size="sm"
                                variant={isLiked ? "default" : "outline"}
                                onClick={isLiked ? onUnlike : onLike}
                                disabled={isLoading}
                            >
                                {isLiked ? "❤️" : "🤍"}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

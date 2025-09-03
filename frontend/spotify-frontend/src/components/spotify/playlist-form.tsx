"use client"

import * as React from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

const playlistFormSchema = z.object({
    name: z.string()
        .min(1, "Playlist name is required")
        .max(64, "Playlist name must be 64 characters or less"),
    description: z.string()
        .max(256, "Description must be 256 characters or less"),
    isPublic: z.boolean(),
    isCollaborative: z.boolean(),
})

type PlaylistFormData = z.infer<typeof playlistFormSchema>

interface PlaylistFormProps {
    onSubmit: (data: PlaylistFormData) => Promise<void>
    defaultValues?: Partial<PlaylistFormData>
    isLoading?: boolean
    isEdit?: boolean
}

export function PlaylistForm({
    onSubmit,
    defaultValues,
    isLoading = false,
    isEdit = false
}: PlaylistFormProps) {
    const form = useForm<PlaylistFormData>({
        resolver: zodResolver(playlistFormSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            description: defaultValues?.description || "",
            isPublic: defaultValues?.isPublic ?? true,
            isCollaborative: defaultValues?.isCollaborative ?? false,
        },
    })

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isEdit ? "Edit Playlist" : "Create Playlist"}</CardTitle>
                <CardDescription>
                    {isEdit
                        ? "Update your playlist details"
                        : "Create a new playlist to organize your favorite tracks"
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Playlist Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="My Awesome Playlist"
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your playlist..."
                                            className="resize-none"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional description ({field.value?.length || 0}/256)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="isPublic"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Public Playlist</FormLabel>
                                            <FormDescription>
                                                Allow other users to discover and view this playlist
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isCollaborative"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Collaborative Playlist</FormLabel>
                                            <FormDescription>
                                                Allow other users to add tracks to this playlist
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    isEdit ? "Update Playlist" : "Create Playlist"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

interface Playlist {
    name: string
    description: string
    isPublic: boolean
    isCollaborative: boolean
    tracksCount: number
    likesCount: number
    playsCount: number
    authority: string
    createdAt: number
    updatedAt: number
}

interface PlaylistCardProps {
    playlist: Playlist
    onPlay?: () => void
    onLike?: () => void
    onUnlike?: () => void
    onEdit?: () => void
    onDelete?: () => void
    onView?: () => void
    isLiked?: boolean
    isOwner?: boolean
    isLoading?: boolean
}

export function PlaylistCard({
    playlist,
    onPlay,
    onLike,
    onUnlike,
    onEdit,
    onDelete,
    onView,
    isLiked = false,
    isOwner = false,
    isLoading = false
}: PlaylistCardProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="cursor-pointer hover:underline" onClick={onView}>
                            {playlist.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {playlist.description || "No description"}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={playlist.isPublic ? "default" : "secondary"}>
                                {playlist.isPublic ? "Public" : "Private"}
                            </Badge>
                            {playlist.isCollaborative && (
                                <Badge variant="outline">Collaborative</Badge>
                            )}
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={onEdit}>
                                Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={onDelete}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{playlist.tracksCount} tracks</span>
                        <span>{playlist.playsCount} plays</span>
                        <span>{playlist.likesCount} likes</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onPlay}
                            disabled={isLoading || playlist.tracksCount === 0}
                        >
                            ▶️ Play
                        </Button>

                        {!isOwner && (
                            <Button
                                size="sm"
                                variant={isLiked ? "default" : "outline"}
                                onClick={isLiked ? onUnlike : onLike}
                                disabled={isLoading}
                            >
                                {isLiked ? "❤️" : "🤍"}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                    Created {new Date(playlist.createdAt * 1000).toLocaleDateString()}
                    {playlist.updatedAt !== playlist.createdAt && (
                        <span> • Updated {new Date(playlist.updatedAt * 1000).toLocaleDateString()}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

interface PlaylistTrack {
    track: {
        title: string
        artist: string
        album: string
        genre: string
        duration: number
        coverImage?: string
        likesCount: number
        playsCount: number
    }
    addedBy: string
    addedAt: number
    position: number
}

interface PlaylistViewProps {
    playlist: Playlist
    tracks: PlaylistTrack[]
    onPlayTrack?: (trackIndex: number) => void
    onRemoveTrack?: (trackIndex: number) => void
    onAddTrack?: () => void
    onLikeTrack?: (trackIndex: number) => void
    isOwner?: boolean
    canEdit?: boolean
    isLoading?: boolean
    currentTrackIndex?: number
}

export function PlaylistView({
    playlist,
    tracks,
    onPlayTrack,
    onRemoveTrack,
    onAddTrack,
    onLikeTrack,
    isOwner = false,
    canEdit = false,
    isLoading = false,
    currentTrackIndex
}: PlaylistViewProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const totalDuration = tracks.reduce((acc, { track }) => acc + track.duration, 0)

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">{playlist.name}</CardTitle>
                            <CardDescription className="mt-2">
                                {playlist.description || "No description"}
                            </CardDescription>
                            <div className="flex items-center gap-2 mt-3">
                                <Badge variant={playlist.isPublic ? "default" : "secondary"}>
                                    {playlist.isPublic ? "Public" : "Private"}
                                </Badge>
                                {playlist.isCollaborative && (
                                    <Badge variant="outline">Collaborative</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>{tracks.length} tracks</span>
                                <span>{formatDuration(totalDuration)} total</span>
                                <span>{playlist.playsCount} plays</span>
                            </div>
                        </div>

                        {(isOwner || canEdit) && (
                            <Button onClick={onAddTrack} disabled={isLoading}>
                                Add Track
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-2">
                {tracks.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">This playlist is empty</p>
                            {(isOwner || canEdit) && (
                                <Button className="mt-4" onClick={onAddTrack}>
                                    Add Your First Track
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    tracks.map(({ track, addedAt, position }, index) => (
                        <Card key={position} className={currentTrackIndex === index ? "ring-2 ring-primary" : ""}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 text-center text-sm text-muted-foreground">
                                        {position + 1}
                                    </div>

                                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {track.coverImage ? (
                                            <Image
                                                src={track.coverImage}
                                                alt={`${track.title} cover`}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-muted-foreground text-xs">♪</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{track.title}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                                        {track.album && (
                                            <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {track.genre && (
                                            <Badge variant="secondary" className="text-xs">
                                                {track.genre}
                                            </Badge>
                                        )}
                                        <span>{formatDuration(track.duration)}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant={currentTrackIndex === index ? "secondary" : "outline"}
                                            onClick={() => onPlayTrack?.(index)}
                                            disabled={isLoading}
                                        >
                                            {currentTrackIndex === index ? "⏸️" : "▶️"}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onLikeTrack?.(index)}
                                            disabled={isLoading}
                                        >
                                            🤍
                                        </Button>

                                        {(isOwner || canEdit) && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onRemoveTrack?.(index)}
                                                disabled={isLoading}
                                            >
                                                ✕
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2 text-xs text-muted-foreground">
                                    Added {new Date(addedAt * 1000).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

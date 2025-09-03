"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const userProfileSchema = z.object({
    username: z.string()
        .min(1, "Username is required")
        .max(32, "Username must be 32 characters or less")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    displayName: z.string()
        .min(1, "Display name is required")
        .max(64, "Display name must be 64 characters or less"),
    bio: z.string()
        .max(256, "Bio must be 256 characters or less"),
    profileImage: z.string()
        .max(256, "Profile image URL must be 256 characters or less")
        .url("Must be a valid URL")
        .optional()
        .or(z.literal(""))
})

type UserProfileFormData = z.infer<typeof userProfileSchema>

interface UserProfileFormProps {
    onSubmit: (data: UserProfileFormData) => Promise<void>
    defaultValues?: Partial<UserProfileFormData>
    isLoading?: boolean
    isEdit?: boolean
}

export function UserProfileForm({
    onSubmit,
    defaultValues,
    isLoading = false,
    isEdit = false
}: UserProfileFormProps) {
    const form = useForm<UserProfileFormData>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            username: defaultValues?.username || "",
            displayName: defaultValues?.displayName || "",
            bio: defaultValues?.bio || "",
            profileImage: defaultValues?.profileImage || "",
        },
    })

    const watchedValues = form.watch()

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={watchedValues.profileImage} alt={watchedValues.displayName} />
                        <AvatarFallback className="text-lg">
                            {watchedValues.displayName?.charAt(0)?.toUpperCase() ||
                                watchedValues.username?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>
                            {isEdit ? "Edit Profile" : "Create Profile"}
                        </CardTitle>
                        <CardDescription>
                            {isEdit
                                ? "Update your profile information on the Spotify dApp"
                                : "Set up your profile on the Spotify dApp"
                            }
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="your_username"
                                            {...field}
                                            disabled={isEdit || isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Your unique username. {isEdit && "This cannot be changed."}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your Display Name"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The name that will be shown to other users.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about yourself..."
                                            className="resize-none"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A short description about yourself ({field.value?.length || 0}/256).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="profileImage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Image URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/your-image.jpg"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        URL to your profile image. Leave empty for default avatar.
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
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    isEdit ? "Update Profile" : "Create Profile"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

interface UserProfileDisplayProps {
    profile: {
        username: string
        displayName: string
        bio: string
        profileImage?: string
        followersCount: number
        followingCount: number
        createdAt: number
    }
    stats?: {
        tracksCreated: number
        playlistsCreated: number
        totalLikesReceived: number
        totalPlays: number
    }
    isOwnProfile?: boolean
    onEdit?: () => void
    onFollow?: () => void
    onUnfollow?: () => void
    isFollowing?: boolean
    isLoading?: boolean
}

export function UserProfileDisplay({
    profile,
    stats,
    isOwnProfile = false,
    onEdit,
    onFollow,
    onUnfollow,
    isFollowing = false,
    isLoading = false
}: UserProfileDisplayProps) {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile.profileImage} alt={profile.displayName} />
                            <AvatarFallback className="text-2xl">
                                {profile.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
                            <CardDescription className="text-lg">@{profile.username}</CardDescription>
                            <div className="flex gap-4 mt-2">
                                <Badge variant="outline">
                                    {profile.followersCount} followers
                                </Badge>
                                <Badge variant="outline">
                                    {profile.followingCount} following
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isOwnProfile ? (
                            <Button onClick={onEdit} variant="outline">
                                Edit Profile
                            </Button>
                        ) : (
                            <Button
                                onClick={isFollowing ? onUnfollow : onFollow}
                                variant={isFollowing ? "outline" : "default"}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                ) : null}
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {profile.bio && (
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.tracksCreated}</div>
                            <div className="text-sm text-muted-foreground">Tracks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.playlistsCreated}</div>
                            <div className="text-sm text-muted-foreground">Playlists</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.totalLikesReceived}</div>
                            <div className="text-sm text-muted-foreground">Likes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.totalPlays}</div>
                            <div className="text-sm text-muted-foreground">Plays</div>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-xs text-muted-foreground">
                    Joined {new Date(profile.createdAt * 1000).toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    )
}

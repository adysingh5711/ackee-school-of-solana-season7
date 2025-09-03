"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  publicKey: string
  username: string
  displayName: string
  bio: string
  profileImage?: string
  followersCount: number
  followingCount: number
  isFollowing?: boolean
}

interface SocialFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
  onLoadMore?: () => void
}

interface ActivityItem {
  id: string
  type: 'track_upload' | 'playlist_create' | 'track_like' | 'user_follow'
  user: User
  target?: {
    name: string
    type: 'track' | 'playlist' | 'user'
  }
  createdAt: number
}

export function SocialFeed({ activities, isLoading = false, onLoadMore }: SocialFeedProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'track_upload': return '🎵'
      case 'playlist_create': return '📝'
      case 'track_like': return '❤️'
      case 'user_follow': return '👥'
      default: return '📱'
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'track_upload':
        return `uploaded a new track "${activity.target?.name}"`
      case 'playlist_create':
        return `created a new playlist "${activity.target?.name}"`
      case 'track_like':
        return `liked "${activity.target?.name}"`
      case 'user_follow':
        return `started following ${activity.target?.name}`
      default:
        return 'had some activity'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Activity Feed</h2>
        <Badge variant="outline">
          {activities.length} activities
        </Badge>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No activities yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Follow some users to see their activities here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user.profileImage} />
                    <AvatarFallback>
                      {activity.user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user.displayName}</span>
                        {' '}
                        <span className="text-muted-foreground">
                          {getActivityText(activity)}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.createdAt * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activities.length > 0 && onLoadMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}

interface UserSearchProps {
  onUserSelect?: (user: User) => void
  isLoading?: boolean
}

export function UserSearch({ onUserSelect, isLoading = false }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<User[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Mock search - in real implementation, this would query the blockchain
      const mockResults: User[] = [
        {
          publicKey: 'mock1',
          username: 'artist1',
          displayName: 'Amazing Artist',
          bio: 'Creating beautiful music',
          followersCount: 1250,
          followingCount: 180,
          isFollowing: false
        },
        {
          publicKey: 'mock2',
          username: 'musician2',
          displayName: 'Cool Musician',
          bio: 'Electronic music producer',
          followersCount: 890,
          followingCount: 320,
          isFollowing: true
        }
      ]
      
      setSearchResults(mockResults.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <Card key={user.publicKey} className="cursor-pointer hover:bg-accent/50" 
                  onClick={() => onUserSelect?.(user)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold">{user.displayName}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{user.followersCount} followers</span>
                        <span>{user.followingCount} following</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={user.isFollowing ? "default" : "outline"}>
                    {user.isFollowing ? "Following" : "Follow"}
                  </Badge>
                </div>
                
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No users found for "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface FollowersListProps {
  users: User[]
  type: 'followers' | 'following'
  onUserClick?: (user: User) => void
  onFollowToggle?: (user: User) => void
  isLoading?: boolean
}

export function FollowersList({ 
  users, 
  type, 
  onUserClick, 
  onFollowToggle, 
  isLoading = false 
}: FollowersListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{type}</h3>
        <Badge variant="outline">
          {users.length} {type}
        </Badge>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No {type} yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.publicKey}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => onUserClick?.(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{user.displayName}</h4>
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{user.followersCount} followers</span>
                        <span>{user.followingCount} following</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={user.isFollowing ? "outline" : "default"}
                    onClick={(e) => {
                      e.stopPropagation()
                      onFollowToggle?.(user)
                    }}
                    disabled={isLoading}
                  >
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

interface SocialTabsProps {
  currentUser: User
  followers: User[]
  following: User[]
  activities: ActivityItem[]
  onUserClick?: (user: User) => void
  onFollowToggle?: (user: User) => void
  isLoading?: boolean
}

export function SocialTabs({
  currentUser,
  followers,
  following,
  activities,
  onUserClick,
  onFollowToggle,
  isLoading = false
}: SocialTabsProps) {
  return (
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="feed">Feed</TabsTrigger>
        <TabsTrigger value="discover">Discover</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>

      <TabsContent value="feed" className="mt-6">
        <SocialFeed activities={activities} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="discover" className="mt-6">
        <UserSearch onUserSelect={onUserClick} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="followers" className="mt-6">
        <FollowersList
          users={followers}
          type="followers"
          onUserClick={onUserClick}
          onFollowToggle={onFollowToggle}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="following" className="mt-6">
        <FollowersList
          users={following}
          type="following"
          onUserClick={onUserClick}
          onFollowToggle={onFollowToggle}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  )
}

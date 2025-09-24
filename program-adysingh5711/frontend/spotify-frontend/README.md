# Spotify dApp Frontend

A decentralized music platform built on Solana blockchain using Next.js, TypeScript, and shadcn/ui components.

## Features

### 🎵 Core Features
- **User Profiles**: Create and manage user profiles on-chain
- **Track Management**: Upload and manage music tracks
- **Playlist Creation**: Create and manage playlists with collaboration features
- **Social Features**: Follow users, like tracks, and view activity feeds
- **Discovery**: Search and explore music from the community

### 🔧 Technical Features
- **Solana Integration**: Full blockchain integration with custom program
- **Wallet Connection**: Support for all Solana wallets
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Form Validation**: Zod schema validation
- **Responsive Design**: Mobile-first responsive design

## Architecture

### Components Structure
```
src/components/
├── spotify/
│   ├── spotify-dashboard.tsx     # Main dashboard component
│   ├── user-profile-form.tsx     # User profile management
│   ├── track-form.tsx            # Track upload and display
│   ├── playlist-form.tsx         # Playlist management
│   └── social-components.tsx     # Social features
├── ui/                           # shadcn/ui components
└── ...
```

### Hooks and Utils
```
src/
├── hooks/
│   └── use-spotify-program.ts    # Main Solana program hook
├── lib/
│   └── spotify-program.ts        # Program interaction class
└── ...
```

## Smart Contract Integration

The frontend integrates with a Solana program deployed at:
`cMq3jX2jiQJTCMJPAAj6BT48WqCiJhT2yQE9BzSRr2X`

### Supported Instructions
- **create_user_profile**: Create user profile and stats accounts
- **update_user_profile**: Update user profile information
- **create_track**: Upload new music tracks
- **create_playlist**: Create new playlists
- **play_track**: Record track plays for analytics

### Account Types
- **UserProfile**: User information and metadata
- **UserStats**: User activity statistics
- **Track**: Music track metadata and URLs
- **Playlist**: Playlist information and settings
- **TrackPlay**: Play history and analytics

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" button
- Select your preferred Solana wallet
- Approve the connection

### 2. Create Profile
- Fill in your username, display name, bio, and profile image URL
- Submit the form to create your on-chain profile
- Wait for transaction confirmation

### 3. Upload Tracks
- Navigate to the "Tracks" tab
- Fill in track information (title, artist, genre, etc.)
- Provide audio file URL and cover image URL
- Submit to create the track on-chain

### 4. Create Playlists
- Navigate to the "Playlists" tab
- Enter playlist name and description
- Choose visibility (public/private) and collaboration settings
- Submit to create the playlist on-chain

### 5. Social Features
- Navigate to the "Social" tab
- View activity feed from followed users
- Search and discover new users
- Manage your followers and following lists

## Development

### Component Development
All components are built using:
- **shadcn/ui**: Modern, accessible UI components
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **TypeScript**: Type safety

### Blockchain Integration
The app uses a custom `SpotifyProgram` class that:
- Handles all Solana program interactions
- Manages transaction serialization
- Provides type-safe method signatures
- Handles PDA derivation automatically

### Form Validation
All forms use Zod schemas that match the on-chain program constraints:
- Username: 1-32 characters, alphanumeric + underscore
- Display name: 1-64 characters
- Bio: 0-256 characters
- URLs: Valid URL format, max 256 characters

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm run deploy
```

Or use the Vercel CLI:
```bash
vercel deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for all new files
- Follow the existing component patterns
- Use shadcn/ui components when possible
- Ensure proper error handling for blockchain interactions

## Troubleshooting

### Common Issues

**Wallet Connection Issues**
- Ensure your wallet is on the correct network (devnet/mainnet)
- Try refreshing the page and reconnecting
- Check browser console for errors

**Transaction Failures**
- Ensure you have sufficient SOL for transaction fees
- Check that all required accounts exist
- Verify program is deployed and accessible

**Form Validation Errors**
- Check that all required fields are filled
- Ensure URLs are valid and accessible
- Verify character limits are respected

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki
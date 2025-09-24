import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SpotifyDapp } from "../target/types/spotify_dapp";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("spotify_dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.spotifyDapp as Program<SpotifyDapp>;

  // Test user keypairs
  const userKeypair = Keypair.generate();
  const secondUserKeypair = Keypair.generate();

  before(async () => {
    // Airdrop SOL to test users
    const airdropTx1 = await provider.connection.requestAirdrop(
      userKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx1);

    const airdropTx2 = await provider.connection.requestAirdrop(
      secondUserKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx2);
  });

  describe("User Profile Tests", () => {
    it("Should create a user profile successfully", async () => {
      const username = "testuser";
      const displayName = "Test User";
      const bio = "This is a test bio";
      const profileImage = "https://example.com/image.jpg";

      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), userKeypair.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createUserProfile(username, displayName, bio, profileImage)
        .accounts({
          userProfile: userProfilePda,
          authority: userKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userKeypair])
        .rpc();

      // Fetch and verify the created account
      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      expect(userProfile.authority.toString()).to.equal(userKeypair.publicKey.toString());
      expect(userProfile.username).to.equal(username);
      expect(userProfile.displayName).to.equal(displayName);
      expect(userProfile.bio).to.equal(bio);
      expect(userProfile.profileImage).to.equal(profileImage);
      expect(userProfile.followersCount.toNumber()).to.equal(0);
      expect(userProfile.followingCount.toNumber()).to.equal(0);
      expect(userProfile.createdAt.toNumber()).to.be.greaterThan(0);
    });

    it("Should fail to create user profile with empty username", async () => {
      const username = "";
      const displayName = "Test User";
      const bio = "This is a test bio";
      const profileImage = "https://example.com/image.jpg";

      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), secondUserKeypair.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .createUserProfile(username, displayName, bio, profileImage)
          .accounts({
            userProfile: userProfilePda,
            authority: secondUserKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([secondUserKeypair])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.error.errorMessage).to.include("Username cannot be empty");
      }
    });
  });

  describe("Playlist Tests", () => {
    it("Should create a playlist successfully", async () => {
      const playlistName = "My Test Playlist";
      const description = "This is a test playlist";
      const isPublic = true;

      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), userKeypair.publicKey.toBuffer(), Buffer.from(playlistName)],
        program.programId
      );

      await program.methods
        .createPlaylist(playlistName, description, isPublic)
        .accounts({
          playlist: playlistPda,
          authority: userKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userKeypair])
        .rpc();

      // Fetch and verify the created playlist
      const playlist = await program.account.playlist.fetch(playlistPda);
      expect(playlist.authority.toString()).to.equal(userKeypair.publicKey.toString());
      expect(playlist.name).to.equal(playlistName);
      expect(playlist.description).to.equal(description);
      expect(playlist.isPublic).to.equal(isPublic);
      expect(playlist.tracksCount.toNumber()).to.equal(0);
      expect(playlist.likesCount.toNumber()).to.equal(0);
      expect(playlist.createdAt.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("Track Tests", () => {
    let trackPda: PublicKey;

    it("Should create a track successfully", async () => {
      const title = "Test Song";
      const artist = "Test Artist";
      const album = "Test Album";
      const duration = 180; // 3 minutes
      const audioUrl = "https://example.com/audio.mp3";
      const coverImage = "https://example.com/cover.jpg";

      [trackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
        program.programId
      );

      await program.methods
        .createTrack(title, artist, album, new anchor.BN(duration), audioUrl, coverImage)
        .accounts({
          track: trackPda,
          authority: userKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userKeypair])
        .rpc();

      // Fetch and verify the created track
      const track = await program.account.track.fetch(trackPda);
      expect(track.title).to.equal(title);
      expect(track.artist).to.equal(artist);
      expect(track.album).to.equal(album);
      expect(track.duration.toNumber()).to.equal(duration);
      expect(track.audioUrl).to.equal(audioUrl);
      expect(track.coverImage).to.equal(coverImage);
      expect(track.likesCount.toNumber()).to.equal(0);
      expect(track.createdAt.toNumber()).to.be.greaterThan(0);
    });

    it("Should add track to playlist successfully", async () => {
      const playlistName = "My Test Playlist";

      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), userKeypair.publicKey.toBuffer(), Buffer.from(playlistName)],
        program.programId
      );

      const [playlistTrackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist_track"), playlistPda.toBuffer(), trackPda.toBuffer()],
        program.programId
      );

      await program.methods
        .addTrackToPlaylist()
        .accounts({
          playlist: playlistPda,
          playlistTrack: playlistTrackPda,
          track: trackPda,
          authority: userKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userKeypair])
        .rpc();

      // Fetch and verify the playlist track
      const playlistTrack = await program.account.playlistTrack.fetch(playlistTrackPda);
      expect(playlistTrack.playlist.toString()).to.equal(playlistPda.toString());
      expect(playlistTrack.track.toString()).to.equal(trackPda.toString());
      expect(playlistTrack.position.toNumber()).to.equal(0);
      expect(playlistTrack.addedAt.toNumber()).to.be.greaterThan(0);

      // Verify playlist tracks count is incremented
      const playlist = await program.account.playlist.fetch(playlistPda);
      expect(playlist.tracksCount.toNumber()).to.equal(1);
    });
  });

  describe("Phase 2: Like/Unlike Tests", () => {
    it("Should like a track successfully", async () => {
      const title = "Test Song";
      const artist = "Test Artist";

      const [trackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
        program.programId
      );

      const [trackLikePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track_like"), userKeypair.publicKey.toBuffer(), trackPda.toBuffer()],
        program.programId
      );

      await program.methods
        .likeTrack()
        .accounts({
          track: trackPda,
          trackLike: trackLikePda,
          user: userKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userKeypair])
        .rpc();

      // Verify the like was created
      const trackLike = await program.account.trackLike.fetch(trackLikePda);
      expect(trackLike.user.toString()).to.equal(userKeypair.publicKey.toString());
      expect(trackLike.track.toString()).to.equal(trackPda.toString());
      expect(trackLike.createdAt.toNumber()).to.be.greaterThan(0);

      // Verify track likes count increased
      const track = await program.account.track.fetch(trackPda);
      expect(track.likesCount.toNumber()).to.equal(1);
    });

    it("Should unlike a track successfully", async () => {
      const title = "Test Song";
      const artist = "Test Artist";

      const [trackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
        program.programId
      );

      const [trackLikePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track_like"), userKeypair.publicKey.toBuffer(), trackPda.toBuffer()],
        program.programId
      );

      await program.methods
        .unlikeTrack()
        .accounts({
          track: trackPda,
          trackLike: trackLikePda,
          user: userKeypair.publicKey,
        })
        .signers([userKeypair])
        .rpc();

      // Verify track likes count decreased
      const track = await program.account.track.fetch(trackPda);
      expect(track.likesCount.toNumber()).to.equal(0);
    });

    it("Should like a playlist successfully", async () => {
      const playlistName = "My Test Playlist";

      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), userKeypair.publicKey.toBuffer(), Buffer.from(playlistName)],
        program.programId
      );

      const [playlistLikePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist_like"), userKeypair.publicKey.toBuffer(), playlistPda.toBuffer()],
        program.programId
      );

      await program.methods
        .likePlaylist()
        .accounts({
          playlist: playlistPda,
          playlistLike: playlistLikePda,
          user: userKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userKeypair])
        .rpc();

      // Verify the like was created
      const playlistLike = await program.account.playlistLike.fetch(playlistLikePda);
      expect(playlistLike.user.toString()).to.equal(userKeypair.publicKey.toString());
      expect(playlistLike.playlist.toString()).to.equal(playlistPda.toString());

      // Verify playlist likes count increased
      const playlist = await program.account.playlist.fetch(playlistPda);
      expect(playlist.likesCount.toNumber()).to.equal(1);
    });
  });

  describe("Phase 2: User Following Tests", () => {
    it("Should create second user profile for following tests", async () => {
      const username = "seconduser";
      const displayName = "Second User";
      const bio = "Second test user";
      const profileImage = "https://example.com/second.jpg";

      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), secondUserKeypair.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createUserProfile(username, displayName, bio, profileImage)
        .accounts({
          userProfile: userProfilePda,
          authority: secondUserKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([secondUserKeypair])
        .rpc();

      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      expect(userProfile.username).to.equal(username);
    });

    it("Should follow a user successfully", async () => {
      const [followerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), userKeypair.publicKey.toBuffer()],
        program.programId
      );

      const [followingProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), secondUserKeypair.publicKey.toBuffer()],
        program.programId
      );

      const [userFollowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_follow"), userKeypair.publicKey.toBuffer(), followingProfilePda.toBuffer()],
        program.programId
      );

      await program.methods
        .followUser()
        .accounts({
          followerProfile: followerProfilePda,
          followingProfile: followingProfilePda,
          userFollow: userFollowPda,
          follower: userKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userKeypair])
        .rpc();

      // Verify the follow relationship was created
      const userFollow = await program.account.userFollow.fetch(userFollowPda);
      expect(userFollow.follower.toString()).to.equal(followerProfilePda.toString());
      expect(userFollow.following.toString()).to.equal(followingProfilePda.toString());

      // Verify follower counts updated
      const followerProfile = await program.account.userProfile.fetch(followerProfilePda);
      const followingProfile = await program.account.userProfile.fetch(followingProfilePda);

      expect(followerProfile.followingCount.toNumber()).to.equal(1);
      expect(followingProfile.followersCount.toNumber()).to.equal(1);
    });

    it("Should unfollow a user successfully", async () => {
      const [followerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), userKeypair.publicKey.toBuffer()],
        program.programId
      );

      const [followingProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), secondUserKeypair.publicKey.toBuffer()],
        program.programId
      );

      const [userFollowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_follow"), userKeypair.publicKey.toBuffer(), followingProfilePda.toBuffer()],
        program.programId
      );

      await program.methods
        .unfollowUser()
        .accounts({
          followerProfile: followerProfilePda,
          followingProfile: followingProfilePda,
          userFollow: userFollowPda,
          follower: userKeypair.publicKey,
        })
        .signers([userKeypair])
        .rpc();

      // Verify follower counts decreased
      const followerProfile = await program.account.userProfile.fetch(followerProfilePda);
      const followingProfile = await program.account.userProfile.fetch(followingProfilePda);

      expect(followerProfile.followingCount.toNumber()).to.equal(0);
      expect(followingProfile.followersCount.toNumber()).to.equal(0);
    });
  });

  describe("Phase 2: Playlist Management Tests", () => {
    it("Should update playlist successfully", async () => {
      const playlistName = "My Test Playlist";
      const newDescription = "Updated playlist description";

      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), userKeypair.publicKey.toBuffer(), Buffer.from(playlistName)],
        program.programId
      );

      await program.methods
        .updatePlaylist(null, newDescription, false)
        .accounts({
          playlist: playlistPda,
          authority: userKeypair.publicKey,
        })
        .signers([userKeypair])
        .rpc();

      // Verify playlist was updated
      const playlist = await program.account.playlist.fetch(playlistPda);
      expect(playlist.description).to.equal(newDescription);
      expect(playlist.isPublic).to.equal(false);
    });

    it("Should remove track from playlist successfully", async () => {
      const playlistName = "My Test Playlist";
      const title = "Test Song";
      const artist = "Test Artist";

      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), userKeypair.publicKey.toBuffer(), Buffer.from(playlistName)],
        program.programId
      );

      const [trackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
        program.programId
      );

      const [playlistTrackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist_track"), playlistPda.toBuffer(), trackPda.toBuffer()],
        program.programId
      );

      await program.methods
        .removeTrackFromPlaylist()
        .accounts({
          playlist: playlistPda,
          playlistTrack: playlistTrackPda,
          track: trackPda,
          authority: userKeypair.publicKey,
        })
        .signers([userKeypair])
        .rpc();

      // Verify playlist tracks count decreased
      const playlist = await program.account.playlist.fetch(playlistPda);
      expect(playlist.tracksCount.toNumber()).to.equal(0);
    });
  });

  describe("Phase 3: Enhanced Features Tests", () => {
    describe("Analytics and Insights", () => {
      it("Should generate user insights successfully", async () => {
        const [userInsightsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_insights"), userKeypair.publicKey.toBuffer()],
          program.programId
        );

        const [userStatsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_stats"), userKeypair.publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .generateUserInsights()
          .accounts({
            userInsights: userInsightsPda,
            userStats: userStatsPda,
            user: userKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([userKeypair])
          .rpc();

        // Verify insights were generated
        const userInsights = await program.account.userInsights.fetch(userInsightsPda);
        expect(userInsights.user.toString()).to.equal(userKeypair.publicKey.toString());
        expect(userInsights.generatedAt.toNumber()).to.be.greaterThan(0);
      });

      it("Should create recommendation successfully", async () => {
        const title = "Test Song";
        const artist = "Test Artist";

        const [trackPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
          program.programId
        );

        const recommendationType = 1; // Track recommendation
        const score = 0.85;
        const reason = "Based on your listening history";

        const [recommendationPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("recommendation"),
            userKeypair.publicKey.toBuffer(),
            trackPda.toBuffer(),
            Buffer.from([recommendationType])
          ],
          program.programId
        );

        await program.methods
          .createRecommendation(recommendationType, trackPda, score, reason)
          .accounts({
            recommendation: recommendationPda,
            user: userKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([userKeypair])
          .rpc();

        // Verify recommendation was created
        const recommendation = await program.account.recommendation.fetch(recommendationPda);
        expect(recommendation.user.toString()).to.equal(userKeypair.publicKey.toString());
        expect(recommendation.recommendationType).to.equal(recommendationType);
        expect(recommendation.target.toString()).to.equal(trackPda.toString());
        expect(recommendation.score).to.be.closeTo(score, 0.01);
        expect(recommendation.reason).to.equal(reason);
        expect(recommendation.isViewed).to.equal(false);
      });
    });

    describe("Search Functionality", () => {
      it("Should create search index successfully", async () => {
        const searchTerm = "test song";
        const targetType = 1; // Track type
        const title = "Test Song";
        const artist = "Test Artist";

        const [trackPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
          program.programId
        );

        const [searchIndexPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("search_index"),
            Buffer.from(searchTerm.toLowerCase()),
            Buffer.from([targetType])
          ],
          program.programId
        );

        await program.methods
          .createSearchIndex(searchTerm, targetType, trackPda)
          .accounts({
            searchIndex: searchIndexPda,
            authority: userKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([userKeypair])
          .rpc();

        // Verify search index was created
        const searchIndex = await program.account.searchIndex.fetch(searchIndexPda);
        expect(searchIndex.searchTerm).to.equal(searchTerm.toLowerCase());
        expect(searchIndex.targetType).to.equal(targetType);
        expect(searchIndex.targetPubkey.toString()).to.equal(trackPda.toString());
        expect(searchIndex.createdAt.toNumber()).to.be.greaterThan(0);
      });
    });

    describe("Enhanced Track Features", () => {
      it("Should play track and record analytics", async () => {
        const title = "Test Song";
        const artist = "Test Artist";
        const durationPlayed = 120; // 2 minutes

        const [trackPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
          program.programId
        );

        const [userStatsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_stats"), userKeypair.publicKey.toBuffer()],
          program.programId
        );

        const [creatorStatsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_stats"), userKeypair.publicKey.toBuffer()], // Same user for test
          program.programId
        );

        // Create a unique track play PDA with timestamp
        const timestamp = Date.now();
        const [trackPlayPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("track_play"),
            trackPda.toBuffer(),
            userKeypair.publicKey.toBuffer(),
            Buffer.from(timestamp.toString())
          ],
          program.programId
        );

        await program.methods
          .playTrack(new anchor.BN(durationPlayed))
          .accounts({
            track: trackPda,
            trackPlay: trackPlayPda,
            userStats: userStatsPda,
            creatorStats: creatorStatsPda,
            user: userKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([userKeypair])
          .rpc();

        // Verify track play was recorded
        const trackPlay = await program.account.trackPlay.fetch(trackPlayPda);
        expect(trackPlay.track.toString()).to.equal(trackPda.toString());
        expect(trackPlay.user.toString()).to.equal(userKeypair.publicKey.toString());
        expect(trackPlay.durationPlayed.toNumber()).to.equal(durationPlayed);

        // Verify track play count increased
        const track = await program.account.track.fetch(trackPda);
        expect(track.playsCount.toNumber()).to.equal(1);
      });

      it("Should create enhanced track with genre", async () => {
        const title = "Enhanced Track";
        const artist = "Enhanced Artist";
        const album = "Enhanced Album";
        const genre = "Electronic";
        const duration = 240;
        const audioUrl = "https://example.com/enhanced.mp3";
        const coverImage = "https://example.com/enhanced-cover.jpg";

        const [trackPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
          program.programId
        );

        const [userStatsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_stats"), userKeypair.publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .createTrack(title, artist, album, genre, new anchor.BN(duration), audioUrl, coverImage)
          .accounts({
            track: trackPda,
            userStats: userStatsPda,
            authority: userKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([userKeypair])
          .rpc();

        // Verify enhanced track was created
        const track = await program.account.track.fetch(trackPda);
        expect(track.title).to.equal(title);
        expect(track.artist).to.equal(artist);
        expect(track.genre).to.equal(genre);
        expect(track.createdBy.toString()).to.equal(userKeypair.publicKey.toString());
      });
    });

    describe("Collaborative Playlists", () => {
      it("Should create collaborative playlist", async () => {
        const playlistName = "Collaborative Playlist";
        const description = "A playlist for collaboration";
        const isPublic = true;
        const isCollaborative = true;

        const [playlistPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("playlist"), userKeypair.publicKey.toBuffer(), Buffer.from(playlistName)],
          program.programId
        );

        const [userStatsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_stats"), userKeypair.publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .createPlaylist(playlistName, description, isPublic, isCollaborative)
          .accounts({
            playlist: playlistPda,
            userStats: userStatsPda,
            authority: userKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([userKeypair])
          .rpc();

        // Verify collaborative playlist was created
        const playlist = await program.account.playlist.fetch(playlistPda);
        expect(playlist.name).to.equal(playlistName);
        expect(playlist.isCollaborative).to.equal(true);
        expect(playlist.isPublic).to.equal(true);
      });

      it("Should add collaborator to playlist", async () => {
        const playlistName = "Collaborative Playlist";
        const permissions = 7; // All permissions

        const [playlistPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("playlist"), userKeypair.publicKey.toBuffer(), Buffer.from(playlistName)],
          program.programId
        );

        const [playlistCollaboratorPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("playlist_collaborator"),
            playlistPda.toBuffer(),
            secondUserKeypair.publicKey.toBuffer()
          ],
          program.programId
        );

        await program.methods
          .addCollaborator(permissions)
          .accounts({
            playlist: playlistPda,
            playlistCollaborator: playlistCollaboratorPda,
            collaborator: secondUserKeypair.publicKey,
            authority: userKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([userKeypair])
          .rpc();

        // Verify collaborator was added
        const collaborator = await program.account.playlistCollaborator.fetch(playlistCollaboratorPda);
        expect(collaborator.playlist.toString()).to.equal(playlistPda.toString());
        expect(collaborator.user.toString()).to.equal(secondUserKeypair.publicKey.toString());
        expect(collaborator.permissions).to.equal(permissions);
      });
    });

    describe("Enhanced Social Features", () => {
      it("Should create activity feed when liking track", async () => {
        const title = "Enhanced Track";
        const artist = "Enhanced Artist";

        const [trackPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("track"), Buffer.from(title), Buffer.from(artist)],
          program.programId
        );

        const [trackLikePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("track_like"), secondUserKeypair.publicKey.toBuffer(), trackPda.toBuffer()],
          program.programId
        );

        const [userStatsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_stats"), secondUserKeypair.publicKey.toBuffer()],
          program.programId
        );

        const [creatorStatsPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_stats"), userKeypair.publicKey.toBuffer()],
          program.programId
        );

        // Create activity feed PDA with timestamp
        const timestamp = Date.now();
        const [activityFeedPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("activity_feed"),
            secondUserKeypair.publicKey.toBuffer(),
            Buffer.from(timestamp.toString())
          ],
          program.programId
        );

        await program.methods
          .likeTrack()
          .accounts({
            track: trackPda,
            trackLike: trackLikePda,
            userStats: userStatsPda,
            creatorStats: creatorStatsPda,
            activityFeed: activityFeedPda,
            user: secondUserKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([secondUserKeypair])
          .rpc();

        // Verify activity feed was created
        const activityFeed = await program.account.activityFeed.fetch(activityFeedPda);
        expect(activityFeed.user.toString()).to.equal(secondUserKeypair.publicKey.toString());
        expect(activityFeed.activityType).to.equal(1); // ACTIVITY_TRACK_LIKED
        expect(activityFeed.target.toString()).to.equal(trackPda.toString());
      });
    });
  });
});

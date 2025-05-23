'use client';
import { useEffect, useState } from 'react';
import { Button, Card, Spin, Typography, message, Divider, Layout, Avatar, Switch } from 'antd';
import queryString from 'query-string';
import axios from 'axios';
import { LogoutOutlined, BulbOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

export default function SpotifyHomePage() {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [spotifyPlayer, setSpotifyPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedTracks, setSelectedTracks] = useState([]);

  const fetchAndShowPlaylistTracks = async (playlist) => {
    try {
      const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSelectedPlaylist(playlist);
      setSelectedTracks(res.data.items);
    } catch (error) {
      console.error('Failed to load playlist tracks:', error);
      message.error('Failed to load playlist tracks.');
    }
  };


  const playTrack = async (track, index = 0) => {
    if (!deviceId) {
      message.warning('Spotify Player not ready');
      return;
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        { uris: [track.uri] },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setNowPlaying(track);
      setCurrentIndex(index);
    } catch (err) {
      console.error('Play error:', err);
      message.error('Playback failed. Spotify Premium required.');
    }
  };


  const pauseTrack = async () => {
    if (!deviceId) return;
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (err) {
      console.error('Pause error:', err);
    }
  };

  const nextTrack = () => {
    const next = (currentIndex + 1) % likedTracks.length;
    playTrack(likedTracks[next].track, next);
  };

  const prevTrack = () => {
    const prev = (currentIndex - 1 + likedTracks.length) % likedTracks.length;
    playTrack(likedTracks[prev].track, prev);
  };

  const toggleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * likedTracks.length);
    playTrack(likedTracks[randomIndex].track, randomIndex);
  };


  const handleVolumeChange = (value) => {
    setVolume(value);
    if (spotifyPlayer) {
      spotifyPlayer.setVolume(value).catch((err) =>
        console.error('Volume error:', err)
      );
    }
  };


  useEffect(() => {
    const { access_token } = queryString.parse(window.location.search);
    if (access_token) {
      setAccessToken(access_token);
      window.history.replaceState(null, '', '/');
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchSpotifyData(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Spotify Clone Player',
        getOAuthToken: cb => cb(accessToken),
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Player is ready:', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', () => console.log('Device not ready'));
      player.connect();

      setSpotifyPlayer(player);
    };
  }, [accessToken]);


  const fetchSpotifyData = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, playlistsRes, tracksRes] = await Promise.all([
        axios.get('https://api.spotify.com/v1/me', { headers }),
        axios.get('https://api.spotify.com/v1/me/playlists', { headers }),
        axios.get('https://api.spotify.com/v1/me/tracks?limit=10', { headers }),
      ]);
      setUserProfile(profileRes.data);
      setUserPlaylists(playlistsRes.data.items);
      setLikedTracks(tracksRes.data.items);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load Spotify data. Please try again.');
      message.error('Spotify API request failed.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithSpotify = () => {
    const queryParams = queryString.stringify({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      scope: 'user-read-private user-read-email playlist-read-private user-library-read user-modify-playback-state streaming',
    });
    window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
  };

  const logout = () => {
    setAccessToken(null);
    setUserProfile(null);
    setUserPlaylists([]);
    setLikedTracks([]);
    message.success('Logged out successfully');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const msToMinutes = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  return (
    <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#141414' : '#fff' }}>
      <Header style={{ background: '#1db954', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>Spotify</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Switch
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
            onChange={toggleTheme}
            checked={isDarkMode}
          />
          {userProfile && (
            <>
              <span>{userProfile.product}</span>
              <Button icon={<LogoutOutlined />} onClick={logout}></Button>
            </>
          )}
        </div>
      </Header>

      <Content style={{ padding: '2rem' }}>

        {!accessToken && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '6rem',
              padding: '2rem',
              backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify Icon"
              style={{ width: 80, marginBottom: 24 }}
            />


            <h2 style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 20 }}>
              Connect to Spotify
            </h2>

            <Button
              type="primary"
              size="large"
              onClick={loginWithSpotify}
              style={{
                backgroundColor: '#1DB954',
                border: 'none',
                fontWeight: 'bold',
                padding: '10px 30px',
                borderRadius: 50,
              }}
            >
              Login with Spotify
            </Button>
          </div>
        )}


        {loading && <Spin size="large" style={{ marginTop: '2rem' }} />}
        {!loading && error && <p style={{ color: 'red' }}>{error}</p>}



        {accessToken && (<Divider orientation="left">Your Playlists</Divider>)}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 16,
            paddingBottom: 10,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onWheel={(e) => {
            const container = e.currentTarget;
            if (e.deltaY !== 0) {
              container.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }}
        >
          {userPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              style={{ minWidth: '180px', maxWidth: '220px', flex: '0 0 auto' }}
              onClick={() => fetchAndShowPlaylistTracks(playlist)} // ⬅️ Click loads tracks
            >
              <Card
                hoverable
                cover={
                  <img
                    alt={playlist.name}
                    src={playlist.images[0]?.url}
                    style={{ height: 200, width: '100%', objectFit: 'cover' }}
                  />
                }
                style={{
                  background: isDarkMode ? '#1e1e1e' : '#fff',
                  color: isDarkMode ? '#fff' : '#000',
                }}
              >
                <Card.Meta
                  title={playlist.name}
                  description={`By ${playlist.owner.display_name}`}
                />
              </Card>
            </div>
          ))}
        </div>

        {selectedTracks.map((item, index) => {
          const track = item.track;
          return (
            <div
              key={track.id}
              onClick={() => playTrack(track, index)}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 1fr 150px 40px 60px 40px',
                alignItems: 'center',
                padding: '10px',
                margin: '8px 0',
                borderRadius: 8,
                backgroundColor: nowPlaying?.id === track.id ? '#282828' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s ease-in-out',
              }}
            >
              <div style={{ fontSize: 14 }}>{index + 1}</div>

              {/* Track image + name + artists */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={track.album.images[0]?.url}
                  alt={track.name}
                  style={{ width: 48, height: 48, borderRadius: 4 }}
                />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{track.name}</div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>
                    {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
              </div>

              {/* Album */}
              <div style={{ fontSize: 13, color: '#ccc' }}>{track.album.name}</div>

              {/* Date Added */}
              <div style={{ fontSize: 13, color: '#ccc' }}>
                {new Date(item.added_at).toLocaleDateString()}
              </div>

              {/* Saved (mock icon) */}
              <div style={{ textAlign: 'center' }}>✅</div>

              {/* Duration */}
              <div style={{ fontSize: 13 }}>{msToMinutes(track.duration_ms)}</div>

              {/* More options (⋮) */}
              <div style={{ textAlign: 'right', fontSize: 20, color: '#999' }}>⋮</div>
            </div>
          );
        })}


        {accessToken && (<Divider orientation="left">Liked Songs</Divider>)}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 16,
          paddingBottom: 10,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE & Edge
        }}
          onWheel={(e) => {
            // Optional: smoother scroll on wheel (for desktop)
            const container = e.currentTarget;
            if (e.deltaY !== 0) {
              container.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }}>
          {likedTracks.map((item, index) => {
            const track = item.track;
            return (
              <div key={index} style={{ minWidth: 220, flex: '0 0 auto' }}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={track.name}
                      src={track.album.images[0]?.url}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                  style={{
                    background: isDarkMode ? '#1e1e1e' : '#fff',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                  actions={[
                    <Button type="link" onClick={() => playTrack(track)}>Play</Button>
                  ]}
                >
                  <Card.Meta
                    title={track.name}
                    description={track.artists.map((artist) => artist.name).join(', ')}
                  />
                </Card>
              </div>
            );
          })}
        </div>


        {nowPlaying && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70px',
              backgroundColor: '#000',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
              zIndex: 1000,
            }}
          >
            {/* Left: Album Art + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar shape="square" size={50} src={nowPlaying?.album?.images?.[0]?.url} />
              <div>
                <div style={{ fontWeight: 500 }}>{nowPlaying?.name || 'Track Name'}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>
                  {nowPlaying?.artists?.map((a) => a.name).join(', ') || 'Artist Name'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Button shape="circle" icon="🔀" onClick={toggleShuffle} />
              <Button shape="circle" icon="⏮" onClick={prevTrack} />
              <Button
                shape="circle"
                icon={isPlaying ? '⏸' : '▶️'}
                onClick={() => {
                  if (isPlaying) {
                    pauseTrack();
                    setIsPlaying(false);
                  } else {
                    if (!nowPlaying && likedTracks.length > 0) {
                      playTrack(likedTracks[0].track, 0);
                    } else {
                      playTrack(nowPlaying, currentIndex);
                    }
                    setIsPlaying(true);
                  }
                }}
              />

              <Button shape="circle" icon="⏭" onClick={nextTrack} />
            </div>


            {/* Right: Volume Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span role="img" aria-label="volume">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                style={{
                  width: 100,
                  accentColor: '#1db954',
                  cursor: 'pointer',
                }}
                aria-label="Volume control"
              />
            </div>
          </div>
        )}

      </Content>

      <Footer style={{ textAlign: 'center', background: isDarkMode ? '#141414' : '#f0f2f5', color: isDarkMode ? '#fff' : '#000' }}>
        Spotify Clone ©2025 | Built with ❤️ using Next.js & Ant Design
      </Footer>
    </Layout>
  );
}



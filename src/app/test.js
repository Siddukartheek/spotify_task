// 'use client';
// import { useEffect, useState } from 'react';
// import { Button, Card, Spin, Row, Col, Typography, message, Divider, Layout, Avatar, Switch } from 'antd';
// import queryString from 'query-string';
// import axios from 'axios';
// import { LogoutOutlined, BulbOutlined } from '@ant-design/icons';

// const { Title } = Typography;
// const { Header, Content, Footer } = Layout;

// export default function SpotifyHomePage() {
//   const [accessToken, setAccessToken] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [userProfile, setUserProfile] = useState(null);
//   const [userPlaylists, setUserPlaylists] = useState([]);
//   const [likedTracks, setLikedTracks] = useState([]);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [spotifyPlayer, setSpotifyPlayer] = useState(null);
//   const [deviceId, setDeviceId] = useState(null);

//   useEffect(() => {
//     const { access_token } = queryString.parse(window.location.search);
//     if (access_token) {
//       setAccessToken(access_token);
//       window.history.replaceState(null, '', '/');
//     }
//   }, []);

//   useEffect(() => {
//     if (accessToken) {
//       fetchSpotifyData(accessToken);
//     }
//   }, [accessToken]);

//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://sdk.scdn.co/spotify-player.js';
//     script.async = true;
//     document.body.appendChild(script);
//   }, []);

//   useEffect(() => {
//     if (accessToken && window.Spotify) {
//       const player = new window.Spotify.Player({
//         name: 'Spotify Clone Player',
//         getOAuthToken: cb => cb(accessToken),
//         volume: 0.5,
//       });

//       player.addListener('ready', ({ device_id }) => {
//         console.log('Player is ready:', device_id);
//         setDeviceId(device_id);
//       });

//       player.addListener('not_ready', () => console.log('Device not ready'));
//       player.connect();

//       setSpotifyPlayer(player);
//     }
//   }, [accessToken]);

//   const fetchSpotifyData = async (token) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const headers = { Authorization: `Bearer ${token}` };
//       const [profileRes, playlistsRes, tracksRes] = await Promise.all([
//         axios.get('https://api.spotify.com/v1/me', { headers }),
//         axios.get('https://api.spotify.com/v1/me/playlists', { headers }),
//         axios.get('https://api.spotify.com/v1/me/tracks?limit=10', { headers }),
//       ]);
//       setUserProfile(profileRes.data);
//       setUserPlaylists(playlistsRes.data.items);
//       setLikedTracks(tracksRes.data.items);
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load Spotify data. Please try again.');
//       message.error('Spotify API request failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loginWithSpotify = () => {
//     const queryParams = queryString.stringify({
//       client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
//       response_type: 'code',
//       redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
//       scope: 'user-read-private user-read-email playlist-read-private user-library-read user-modify-playback-state streaming',
//     });
//     window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
//   };

//   const logout = () => {
//     setAccessToken(null);
//     setUserProfile(null);
//     setUserPlaylists([]);
//     setLikedTracks([]);
//     message.success('Logged out successfully');
//   };

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   const playTrack = async (uri) => {
//     message.info('Playback requires Spotify Premium.');
//   };

//   const pauseTrack = async () => {
//     message.info('Playback requires Spotify Premium.');
//   };

//   return (
//     <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#141414' : '#fff' }}>
//       <Header style={{ background: '#1db954', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
//         <Title level={3} style={{ color: 'white', margin: 0 }}>Spotify</Title>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//           <Switch
//             checkedChildren={<BulbOutlined />}
//             unCheckedChildren={<BulbOutlined />}
//             onChange={toggleTheme}
//             checked={isDarkMode}
//           />
//           {userProfile && (
//             <>
//               <span>{userProfile.display_name}</span>
//               {userProfile.images[0] && <Avatar src={userProfile.images[0].url} />}
//               <Button icon={<LogoutOutlined />} onClick={logout}>Logout</Button>
//             </>
//           )}
//         </div>
//       </Header>

//       <Content style={{ padding: '2rem' }}>
//         {!accessToken && (
//           <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
//             <Button type="primary" size="large" onClick={loginWithSpotify}>
//               Login with Spotify
//             </Button>
//           </div>
//         )}

//         {loading && <Spin size="large" style={{ marginTop: '2rem' }} />}
//         {!loading && error && <p style={{ color: 'red' }}>{error}</p>}

//         {/* {userPlaylists.length > 0 && (
//           <>
//             <Divider orientation="left">Your Playlists</Divider>
//             <Row gutter={[24, 24]}>
//               {userPlaylists.map((playlist) => (
//                 <Col xs={24} sm={12} md={8} lg={6} key={playlist.id}>
//                   <Card
//                     hoverable
//                     cover={<img alt={playlist.name} src={playlist.images[0]?.url} style={{ height: 200, objectFit: 'cover' }} />}
//                     style={{ background: isDarkMode ? '#1e1e1e' : '#fff', color: isDarkMode ? '#fff' : '#000' }}
//                   >
//                     <Card.Meta
//                       title={playlist.name}
//                       description={`By ${playlist.owner.display_name}`}
//                     />
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           </>
//         )} */}
//         <Divider orientation="left">Your Playlists</Divider>
//         <div
//           style={{
//             display: 'flex',
//             overflowX: 'auto',
//             gap: 16,
//             paddingBottom: 10,
//             WebkitOverflowScrolling: 'touch',
//             scrollbarWidth: 'none', // Firefox
//             msOverflowStyle: 'none', // IE & Edge
//           }}
//           onWheel={(e) => {
//             // Optional: smoother scroll on wheel (for desktop)
//             const container = e.currentTarget;
//             if (e.deltaY !== 0) {
//               container.scrollLeft += e.deltaY;
//               e.preventDefault();
//             }
//           }}
//         >
//           {userPlaylists.map((playlist) => (
//             <div
//               key={playlist.id}
//               style={{
//                 minWidth: '180px',
//                 maxWidth: '220px',
//                 flex: '0 0 auto',
//               }}
//             >
//               <Card
//                 hoverable
//                 cover={
//                   <img
//                     alt={playlist.name}
//                     src={playlist.images[0]?.url}
//                     style={{ height: 200, width: '100%', objectFit: 'cover' }}
//                   />
//                 }
//                 style={{
//                   background: isDarkMode ? '#1e1e1e' : '#fff',
//                   color: isDarkMode ? '#fff' : '#000',
//                 }}
//               >
//                 <Card.Meta
//                   title={playlist.name}
//                   description={`By ${playlist.owner.display_name}`}
//                 />
//               </Card>
//             </div>
//           ))}
//         </div>



//         {/* {likedTracks.length > 0 && (
//           <>
//             <Divider orientation="left">Liked Songs</Divider>
//             <Row gutter={[24, 24]}>
//               {likedTracks.map((item, index) => {
//                 const track = item.track;
//                 return (
//                   <Col xs={24} sm={12} md={8} lg={6} key={index}>
//                     <Card
//                       hoverable
//                       cover={<img alt={track.name} src={track.album.images[0]?.url} style={{ height: 200, objectFit: 'cover' }} />}
//                       style={{ background: isDarkMode ? '#1e1e1e' : '#fff', color: isDarkMode ? '#fff' : '#000' }}
//                       actions={[
//                         <Button type="link" onClick={() => playTrack(track.uri)}>Play</Button>,
//                         <Button type="link" onClick={pauseTrack}>Pause</Button>
//                       ]}
//                     >
//                       <Card.Meta
//                         title={track.name}
//                         description={track.artists.map((artist) => artist.name).join(', ')}
//                       />
//                     </Card>
//                   </Col>
//                 );
//               })}
//             </Row>
//           </>
//         )} */}
//         <Divider orientation="left">Liked Songs</Divider>
//         <div style={{
//           display: 'flex',
//           overflowX: 'auto',
//           gap: 16,
//           paddingBottom: 10,
//           WebkitOverflowScrolling: 'touch',
//           scrollbarWidth: 'none', // Firefox
//           msOverflowStyle: 'none', // IE & Edge
//         }}
//           onWheel={(e) => {
//             // Optional: smoother scroll on wheel (for desktop)
//             const container = e.currentTarget;
//             if (e.deltaY !== 0) {
//               container.scrollLeft += e.deltaY;
//               e.preventDefault();
//             }
//           }}>
//           {likedTracks.map((item, index) => {
//             const track = item.track;
//             return (
//               <div key={index} style={{ minWidth: 220, flex: '0 0 auto' }}>
//                 <Card
//                   hoverable
//                   cover={
//                     <img
//                       alt={track.name}
//                       src={track.album.images[0]?.url}
//                       style={{ height: 200, objectFit: 'cover' }}
//                     />
//                   }
//                   style={{
//                     background: isDarkMode ? '#1e1e1e' : '#fff',
//                     color: isDarkMode ? '#fff' : '#000',
//                   }}
//                   actions={[
//                     <Button type="link" onClick={() => playTrack(track.uri)}>Play</Button>,
//                     <Button type="link" onClick={pauseTrack}>Pause</Button>,
//                   ]}
//                 >
//                   <Card.Meta
//                     title={track.name}
//                     description={track.artists.map((artist) => artist.name).join(', ')}
//                   />
//                 </Card>
//               </div>
//             );
//           })}
//         </div>

//       </Content>

//       <Footer style={{ textAlign: 'center', background: isDarkMode ? '#141414' : '#f0f2f5', color: isDarkMode ? '#fff' : '#000' }}>
//         Spotify Clone ©2025 | Built with ❤️ using Next.js & Ant Design
//       </Footer>
//     </Layout>
//   );
// }


{/* <Divider orientation="left">Your Playlists</Divider>
        <div
          style={{
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
          }}
        >
          {userPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              style={{
                minWidth: '180px',
                maxWidth: '220px',
                flex: '0 0 auto',
              }}
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
        </div> */}
{/* <Divider orientation="left">Your Playlists</Divider>
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
              style={{
                minWidth: '220px',
                maxWidth: '240px',
                flex: '0 0 auto',
                background: isDarkMode ? '#1e1e1e' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
              }}
              onClick={() => fetchPlaylistTracks(playlist.id)}
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
                bordered={false}
                style={{ background: 'transparent' }}
              >
                <Card.Meta
                  title={playlist.name}
                  description={`By ${playlist.owner.display_name}`}
                />
              </Card>

              {expandedPlaylistId === playlist.id && (
                <div style={{ padding: '0 1rem 1rem' }}>
                  {expandedPlaylistTracks.map((item, index) => {
                    const track = item.track;
                    return (
                      <div key={track.id} style={{ marginTop: 8 }}>
                        <div style={{ fontWeight: 500 }}>{track.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>
                          {track.artists.map(a => a.name).join(', ')}
                        </div>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => playTrack(track, index)}
                        >
                          ▶ Play
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div> */}
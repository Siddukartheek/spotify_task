export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    const credentials = Buffer.from(
        `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
        }),
    });

    const data = await response.json();

    const redirectUrl = `${process.env.NEXT_PUBLIC_API}/?access_token=${data.access_token}`;
    return Response.redirect(redirectUrl, 302);
}

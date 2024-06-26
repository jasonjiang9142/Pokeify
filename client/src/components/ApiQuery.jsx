import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import Cards from './Cards';
import { getPokemontoArtist, expressport } from '../utilities/global';



export default function ApiQuery() {
    const [query, setQuery] = useState('')
    const [artist, setArtist] = useState('')
    const [accessToken, setAccessToken] = useState('')
    const [albums, setAlbums] = useState([])
    const [image2, setImage] = useState('')

    const handleChange = (e) => {
        setQuery(e.target.value)
    }

    const getSpotifyAccessToken = async () => {
        const response = await fetch(`${expressport}/api/getSpotifyAccessToken`, {
            method: 'POST',
        });
        const data = await response.json();
        setAccessToken(data.access_token);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const stuff = await getPokemontoArtist(query.toLowerCase().replace(/\s/g, ''))
            const getArtist = stuff[0]
            const getImage = stuff[1]
            setImage(getImage)
            setArtist(getArtist)
            search()
        } catch (e) {
            console.error(e)
        }
    }

    async function getArtistInfo(artist) {
        const searchParameters = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer your_access_token_here'
            }
        };

        const response = await fetch('https://api.spotify.com/v1/search?q=' + artist + '&type=artist', searchParameters);
        const data = await response.json();

        if (data.artists.items.length > 0) {
            const artistData = data.artists.items[0];
            const artistInfo = {
                id: artistData.id,
                name: artistData.name,
                link: artistData.external_urls.spotify,
                genres: artistData.genres
            };
            return artistInfo;
        } else {
            throw new Error('Artist not found');
        }
    }

    async function search() {
        var searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "authorization": "Bearer " + accessToken

            }
        }

        var ArtistID = await fetch('https://api.spotify.com/v1/search?q=' + artist + '&type=artist', searchParameters)
            .then(res => res.json())
            .then(data => { return data.artists.items[0].id })

        console.log(ArtistID)

        var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + ArtistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters)
            .then(res => res.json())
            .then(
                data => {
                    console.log(data)
                    setAlbums(data.items);

                }
            )

    }


    useEffect(() => {
        getSpotifyAccessToken()
        console.log(accessToken)
    }, [])

    useEffect(() => {
        console.log(accessToken)
    }, [accessToken])


    return (
        <div>
            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                onChange={handleChange}
                className="flex justify-center mb-5"
            >
                <TextField id="standard-basic" label="Pokemon Name" className="bg-white" />
                <Button type="submit" variant="contained" >Submit</Button>
            </Box>
            {artist && <h1 className="text-3xl text-center italic">We turned {query.toUpperCase()} into ...</h1>}
            {artist && <div class=" flex items-center justify-center"> <img src={image2} /> </div>}

            <div class="p-4 mx-auto text-center border">
                <div className="grid grid-cols-3 gap-4">
                    {albums.map((album, index) => (
                        <Cards key={index} name={album.name} url={album.images[0].url} link={album.external_urls.spotify} releaseDate={album.release_date} />
                    ))}
                </div>
            </div>

        </div>
    )
}
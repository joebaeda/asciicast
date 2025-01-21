import { asciiCastAbi, asciiCastAddress } from '@/lib/contract';
import { ImageResponse } from 'next/og';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'edge';

// Helper to decode Base64 tokenURI and extract the image URL
const extractImageUrl = (base64Uri: string): string => {
  try {
    const json = JSON.parse(atob(base64Uri.split(',')[1])); // Decode Base64 and parse JSON
    return json.image || ''; // Return the image URL from the decoded JSON
  } catch (error) {
    console.error('Error decoding Base64 tokenURI:', error);
    return '';
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('tokenId');

  // Load the custom font
  const comicSansData = await fetch(new URL('../../fonts/Comic-Sans-MS.ttf', import.meta.url)).then(
    (res) => res.arrayBuffer()
  );

  if (!tokenId) {
    return new ImageResponse(
      (
        <div style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#f1f1f1',
          backgroundSize: '30px 30px',
          background: 'radial-gradient(#e8e1b0 10%, transparent 10%)',
        }}>

          {/* Default Image left */}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >

            <div
              style={{
                position: 'absolute',
                left: '20%',
                top: '50%',
                transform: 'translate(-20%, -50%)',
                width: '402px',
                height: '420px',
                borderWidth: 10,
                borderColor: '#e8e1b0',
                borderRadius: '5%',
                backgroundColor: '#d1c997',
                backgroundImage: `url('${process.env.NEXT_PUBLIC_BASE_URL}/splash.svg')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Title Right */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              right: '20%',
              top: '50%',
              transform: 'translate(20%, -50%)',
              width: '402px',
              height: '392px',
              fontSize: 92,
              fontWeight: '700px',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'Comic Sans MS',
              color: '#24231d',
              background: 'radial-gradient(#452654 26%, transparent 10%)',
            }}
          >
            <p style={{ margin: 0 }}>Scratch</p>
            <p style={{ margin: 0, color: '#f1f1f1' }}>of</p>
            <p style={{ margin: 0 }}>Art</p>
          </div>


        </div>
      ),
      {
        width: 1200,
        height: 600,
        fonts: [
          {
            name: 'Comic Sans MS',
            data: comicSansData,
            style: 'normal',
          },
        ],
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  try {
    const tokenURI: string = await publicClient.readContract({
      address: asciiCastAddress as `0x${string}`,
      abi: asciiCastAbi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    const imageUrl = extractImageUrl(tokenURI);

    if (!imageUrl) {
      throw new Error('Image URL not found in tokenURI');
    }

    const formattedUrl = imageUrl.startsWith('ipfs://')
      ? `https://gateway.pinata.cloud/ipfs/${imageUrl.slice(7)}`
      : imageUrl;

    const scratchImage = new ImageResponse(
      (
        <div style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#f1f1f1',
          backgroundSize: '30px 30px',
          background: 'radial-gradient(#e8e1b0 10%, transparent 10%)',
        }}>

          {/* NFT Image left */}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >

            <div
              style={{
                position: 'absolute',
                left: '20%',
                top: '50%',
                transform: 'translate(-20%, -50%)',
                width: '402px',
                height: '420px',
                borderWidth: 10,
                borderColor: '#e8e1b0',
                borderRadius: '5%',
                backgroundColor: '#d1c997',
                backgroundImage: `url(${formattedUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Title Right */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              right: '20%',
              top: '50%',
              transform: 'translate(20%, -50%)',
              width: '402px',
              height: '392px',
              fontSize: 92,
              fontWeight: '700px',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'Comic Sans MS',
              color: '#24231d',
              background: 'radial-gradient(#452654 26%, transparent 10%)',
            }}
          >
            <p style={{ margin: 0 }}>Scratch</p>
            <p style={{ margin: 0, color: '#f1f1f1' }}>of</p>
            <p style={{ margin: 0 }}>Art</p>
          </div>


        </div>
      ),
      {
        width: 1200,
        height: 600,
        fonts: [
          {
            name: 'Comic Sans MS',
            data: comicSansData,
            style: 'normal',
          },
        ],
      }
    );

    const headers = new Headers(scratchImage.headers);
    headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=59"
    );

    return new Response(scratchImage.body, {
      headers,
      status: scratchImage.status,
      statusText: scratchImage.statusText,
    });

  } catch (error) {
    console.error('Error fetching tokenURI or generating image:', error);

    return new ImageResponse(
      (
        <div style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#f1f1f1',
          backgroundSize: '30px 30px',
          background: 'radial-gradient(#e8e1b0 10%, transparent 10%)',
        }}>

          {/* Default Image left */}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >

            <div
              style={{
                position: 'absolute',
                left: '20%',
                top: '50%',
                transform: 'translate(-20%, -50%)',
                width: '402px',
                height: '420px',
                borderWidth: 10,
                borderColor: '#e8e1b0',
                borderRadius: '5%',
                backgroundColor: '#d1c997',
                backgroundImage: `url('https://scratchnism.vercel.app/scratch-not-found.svg')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Title Right */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              right: '20%',
              top: '50%',
              transform: 'translate(20%, -50%)',
              width: '402px',
              height: '392px',
              fontSize: 92,
              fontWeight: '700px',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'Comic Sans MS',
              color: '#24231d',
            }}
          >
            <p style={{ margin: 0 }}>Scratch</p>
            <p style={{ margin: 20, color: '#750c08', fontSize: 102, textDecoration: 'underline' }}>Not</p>
            <p style={{ margin: 0 }}>Found</p>
          </div>


        </div>
      ),
      {
        width: 1200,
        height: 600,
        fonts: [
          {
            name: 'Comic Sans MS',
            data: comicSansData,
            style: 'normal',
          },
        ],
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}


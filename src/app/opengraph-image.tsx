import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const alt = 'Celestial Lights';
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#05070f',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow background */}
        <div
          style={{
            position: 'absolute',
            width: '900px',
            height: '500px',
            background: 'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(246, 190, 106, 0.15), transparent 65%)',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Main Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#f4f1ea',
              fontFamily: 'Georgia, serif',
              letterSpacing: '-2px',
            }}
          >
            Celestial Lights
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '40px',
              color: '#f7d08a',
              fontFamily: 'Georgia, serif',
            }}
          >
            Premium Designer Lighting
          </div>

          {/* Decorative glyph */}
          <div
            style={{
              fontSize: '32px',
              color: '#f7d08a',
              marginTop: '10px',
            }}
          >
            ✦
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

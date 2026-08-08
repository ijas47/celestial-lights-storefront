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
          justifyContent: 'flex-end',
          background: '#F2F1EF',
          padding: '72px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: '20px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#767676',
            marginBottom: '28px',
          }}
        >
          Celestial Lights
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '96px',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 0.98,
            textTransform: 'uppercase',
            color: '#000000',
          }}
        >
          <span>Extraordinary</span>
          <span>Objects</span>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: '28px',
            fontSize: '26px',
            color: '#767676',
          }}
        >
          Designer lighting, shipped across India
        </div>
      </div>
    ),
    { ...size }
  );
}

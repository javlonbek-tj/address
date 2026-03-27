import Link from 'next/link';

function NotFoundIllustration() {
  return (
    <svg
      width='280'
      height='240'
      viewBox='0 0 280 240'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
    >
      {/* Map background */}
      <rect x='20' y='40' width='240' height='170' rx='12' fill='#f1f5f9' />
      <rect
        x='20'
        y='40'
        width='240'
        height='170'
        rx='12'
        stroke='#e2e8f0'
        strokeWidth='1.5'
      />

      {/* Grid lines */}
      <line x1='20' y1='90' x2='260' y2='90' stroke='#e2e8f0' strokeWidth='1' />
      <line
        x1='20'
        y1='140'
        x2='260'
        y2='140'
        stroke='#e2e8f0'
        strokeWidth='1'
      />
      <line
        x1='20'
        y1='165'
        x2='260'
        y2='165'
        stroke='#e2e8f0'
        strokeWidth='1'
      />
      <line x1='80' y1='40' x2='80' y2='210' stroke='#e2e8f0' strokeWidth='1' />
      <line
        x1='140'
        y1='40'
        x2='140'
        y2='210'
        stroke='#e2e8f0'
        strokeWidth='1'
      />
      <line
        x1='200'
        y1='40'
        x2='200'
        y2='210'
        stroke='#e2e8f0'
        strokeWidth='1'
      />

      {/* Road horizontal */}
      <rect x='20' y='128' width='240' height='14' fill='#cbd5e1' rx='1' />
      <line
        x1='50'
        y1='135'
        x2='70'
        y2='135'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />
      <line
        x1='100'
        y1='135'
        x2='120'
        y2='135'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />
      <line
        x1='150'
        y1='135'
        x2='170'
        y2='135'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />
      <line
        x1='200'
        y1='135'
        x2='220'
        y2='135'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />

      {/* Road vertical */}
      <rect x='107' y='40' width='14' height='170' fill='#cbd5e1' rx='1' />
      <line
        x1='114'
        y1='60'
        x2='114'
        y2='75'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />
      <line
        x1='114'
        y1='95'
        x2='114'
        y2='110'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />
      <line
        x1='114'
        y1='155'
        x2='114'
        y2='170'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />
      <line
        x1='114'
        y1='185'
        x2='114'
        y2='200'
        stroke='white'
        strokeWidth='2'
        strokeDasharray='8 6'
      />

      {/* Building blocks */}
      <rect
        x='30'
        y='50'
        width='30'
        height='30'
        rx='3'
        fill='#bfdbfe'
        stroke='#93c5fd'
        strokeWidth='1'
      />
      <rect x='38' y='58' width='7' height='8' rx='1' fill='#60a5fa' />
      <rect x='47' y='58' width='7' height='8' rx='1' fill='#60a5fa' />
      <rect x='38' y='70' width='7' height='8' rx='1' fill='#60a5fa' />

      <rect
        x='155'
        y='50'
        width='36'
        height='24'
        rx='3'
        fill='#bbf7d0'
        stroke='#86efac'
        strokeWidth='1'
      />
      <rect x='163' y='57' width='6' height='7' rx='1' fill='#4ade80' />
      <rect x='173' y='57' width='6' height='7' rx='1' fill='#4ade80' />

      <rect
        x='30'
        y='150'
        width='24'
        height='24'
        rx='3'
        fill='#fde68a'
        stroke='#fcd34d'
        strokeWidth='1'
      />
      <rect x='36' y='157' width='5' height='6' rx='1' fill='#f59e0b' />
      <rect x='44' y='157' width='5' height='6' rx='1' fill='#f59e0b' />

      <rect
        x='155'
        y='150'
        width='36'
        height='36'
        rx='3'
        fill='#e9d5ff'
        stroke='#c4b5fd'
        strokeWidth='1'
      />
      <rect x='163' y='158' width='6' height='8' rx='1' fill='#a78bfa' />
      <rect x='173' y='158' width='6' height='8' rx='1' fill='#a78bfa' />
      <rect x='163' y='170' width='6' height='8' rx='1' fill='#a78bfa' />
      <rect x='173' y='170' width='6' height='8' rx='1' fill='#a78bfa' />

      {/* Dashed search circle — "lost location" */}
      <circle
        cx='185'
        cy='85'
        r='28'
        stroke='#f97316'
        strokeWidth='2'
        strokeDasharray='5 4'
        fill='#fff7ed'
        fillOpacity='0.6'
      />

      {/* Question mark inside circle */}
      <text
        x='185'
        y='92'
        textAnchor='middle'
        fontSize='22'
        fontWeight='700'
        fill='#f97316'
        fontFamily='system-ui'
      >
        ?
      </text>

      {/* Lost map pin */}
      <g transform='translate(154, 48)'>
        {/* Pin shadow */}
        <ellipse
          cx='16'
          cy='42'
          rx='7'
          ry='3'
          fill='#94a3b8'
          fillOpacity='0.3'
        />
        {/* Pin body */}
        <path
          d='M16 2C10.477 2 6 6.477 6 12c0 7 10 26 10 26S26 19 26 12c0-5.523-4.477-10-10-10z'
          fill='#7c3aed'
        />
        {/* Pin inner circle -->*/}
        <circle cx='16' cy='12' r='5' fill='white' fillOpacity='0.9' />
        {/* X mark on pin */}
        <line
          x1='13'
          y1='9'
          x2='19'
          y2='15'
          stroke='#7c3aed'
          strokeWidth='2'
          strokeLinecap='round'
        />
        <line
          x1='19'
          y1='9'
          x2='13'
          y2='15'
          stroke='#7c3aed'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </g>

      {/* 404 label */}
      <rect x='52' y='18' width='176' height='32' rx='8' fill='#7c3aed' />
      <text
        x='140'
        y='39'
        textAnchor='middle'
        fontSize='18'
        fontWeight='800'
        fill='white'
        fontFamily='system-ui'
        letterSpacing='2'
      >
        404
      </text>
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center'>
      <NotFoundIllustration />

      <h1 className='mt-6 text-2xl font-bold text-gray-800'>
        Sahifa topilmadi
      </h1>

      <p className='mt-2 text-sm text-gray-500'>
        Siz qidirgan sahifa mavjud emas.
      </p>

      <Link
        href='/'
        className='mt-8 inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors duration-200'
      >
        Bosh sahifaga qaytish
      </Link>
    </main>
  );
}

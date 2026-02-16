import { HeaderActions } from './HeaderActions';

export function Header() {
  return (
    <header
      className={
        'flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-all duration-300'
      }
    >
      <h1 className='text-lg font-semibold'>Ochiq Xarita</h1>
      <HeaderActions />
    </header>
  );
}

interface Props {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TabButton({ active, onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

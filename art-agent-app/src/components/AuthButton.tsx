'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="w-24 h-9 bg-gray-200 rounded-md animate-pulse" />;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? 'Avatar'}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="hidden sm:inline text-sm font-medium text-gray-700">
          {session.user?.name}
        </span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('azure-ad')}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
    >
      Entrar
    </button>
  );
}
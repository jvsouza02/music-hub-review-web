'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const linkClassName =
    'flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted';

  return (
    <div className="relative md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <Menu aria-hidden="true" className="size-5" />
        )}
      </button>

      <nav
        id="mobile-navigation"
        aria-label="Navegação mobile"
        className={`absolute top-full right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background p-3 shadow-popover ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="space-y-1">
          <Link href="/" onClick={closeMenu} className={linkClassName}>
            Início
          </Link>

          <Link href="/explore" onClick={closeMenu} className={linkClassName}>
            Explorar
          </Link>

          <Link href="/explore#track-search" onClick={closeMenu} className={linkClassName}>
            <Search aria-hidden="true" className="size-4" />
            Buscar faixas
          </Link>

          <Link href="/#como-funciona" onClick={closeMenu} className={linkClassName}>
            Como funciona
          </Link>

          <Link href="/#sobre" onClick={closeMenu} className={linkClassName}>
            Sobre
          </Link>
        </div>
      </nav>
    </div>
  );
}

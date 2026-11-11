'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';

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
        className={`absolute top-full right-0 left-0 z-50 mt-3 rounded-2xl border border-border bg-background p-4 shadow-popover ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="space-y-2">
          <div className="relative mb-4">
            <label htmlFor="mobile-search" className="sr-only">
              Buscar álbuns, artistas e faixas
            </label>

            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <input
              id="mobile-search"
              type="search"
              placeholder="Busca em breve"
              disabled
              aria-describedby="mobile-search-status"
              className="h-11 w-full rounded-xl border border-border bg-muted/50 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />

            <span id="mobile-search-status" className="sr-only">
              A busca ainda não está disponível.
            </span>
          </div>

          <Link
            href="/"
            onClick={closeMenu}
            className="block rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Início
          </Link>

          <Link
            href="/#como-funciona"
            onClick={closeMenu}
            className="block rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Como funciona
          </Link>

          <Link
            href="/#sobre"
            onClick={closeMenu}
            className="block rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Sobre
          </Link>
        </div>
      </nav>
    </div>
  );
}

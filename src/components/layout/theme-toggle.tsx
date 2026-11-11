"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  const label = !mounted
    ? "Carregando preferência de tema"
    : isDark
      ? "Ativar tema claro"
      : "Ativar tema escuro";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10 rounded-full"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={label}
      title={label}
    >
      {!mounted ? (
        <Monitor aria-hidden="true" />
      ) : isDark ? (
        <Sun aria-hidden="true" />
      ) : (
        <Moon aria-hidden="true" />
      )}
    </Button>
  );
}
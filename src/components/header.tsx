import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
      <h1 className="text-2xl font-bold text-primary">FluiMap</h1>
      <div className="flex items-center gap-4">
        <UserButton />
        <ModeToggle />
      </div>
    </header>
  );
}

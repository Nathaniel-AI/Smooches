import { Link } from "wouter";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent p-4">
      <div className="container mx-auto flex items-center gap-2">
        <Link href="/">
          <a className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="SMOOCHES" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              SMOOCHES
            </span>
          </a>
        </Link>
      </div>
    </header>
  );
}

import { Outlet } from "react-router-dom";
import { Scissors } from "lucide-react";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-dark text-brand-gold p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center gap-2">
          <Scissors size={24} />
          <h1 className="text-xl font-bold tracking-wider uppercase">HairAgenda</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-brand-dark p-4 text-center text-brand-muted text-sm mt-auto">
        &copy; {new Date().getFullYear()} HairAgenda. Estilo e Praticidade.
      </footer>
    </div>
  );
}

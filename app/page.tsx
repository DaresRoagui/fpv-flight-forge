import { RecommenderV4 } from "@/app/components/RecommenderV4";
import { LocaleSwitcher } from "@/app/components/LocaleSwitcher";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-zinc-900">FPV Flight Forge</span>
          <LocaleSwitcher />
        </div>
      </header>
      <RecommenderV4 />
    </main>
  );
}

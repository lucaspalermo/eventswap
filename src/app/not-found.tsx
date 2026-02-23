import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo size="lg" className="mb-8" />
      <h1 className="text-display-lg text-neutral-950 mb-4">404</h1>
      <p className="text-body-xl text-neutral-500 mb-8 max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 text-label-md text-white shadow-sm transition-all duration-200 hover:bg-primary-600 hover:shadow-primary-glow"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

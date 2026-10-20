/**
 * SkipLink — Link de acessibilidade "Pular para o conteúdo principal".
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute top-[-100px] left-6 z-[9999] rounded-pill bg-brand-blue px-5 py-3 font-semibold text-ink-inverse transition-[top] duration-200 ease-nix focus:top-4"
    >
      Pular para o conteúdo principal
    </a>
  );
}

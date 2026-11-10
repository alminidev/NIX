/**
 * Acessibilidade do menu mobile.
 * Fechado, o menu fica inert: os links saem da ordem do Tab e do leitor de tela,
 * mas o elemento continua no DOM para a animação de abrir e fechar.
 */
export function mobileNavA11y(open: boolean) {
  return { inert: !open, "aria-hidden": !open } as const;
}

/** Escape fecha o menu e devolve o foco ao botão que o abriu. */
export function shouldCloseMobileNav(key: string, open: boolean) {
  return open && key === "Escape";
}

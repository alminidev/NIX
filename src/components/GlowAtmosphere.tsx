/**
 * GlowAtmosphere — Efeito esfumaçado de iluminação ambiente do Hero Stage.
 * aria-hidden="true" — puramente decorativo.
 */
export default function GlowAtmosphere() {
  const glow =
    "pointer-events-none absolute rounded-full mix-blend-screen blur-[75px] transform-gpu motion-reduce:animate-none! max-[640px]:blur-[50px]";
  const glowBlue =
    "bg-[radial-gradient(circle,rgba(23,107,255,0.88)_0%,rgba(23,107,255,0.48)_35%,rgba(13,87,219,0.22)_60%,transparent_75%)]";
  const glowAccent =
    "bg-[radial-gradient(circle,rgba(13,87,219,0.82)_0%,rgba(23,107,255,0.42)_40%,rgba(13,87,219,0.16)_65%,transparent_75%)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className={`${glow} ${glowBlue} -top-[120px] left-1/2 h-[620px] w-[960px] animate-glow-pulse opacity-[0.88] max-[640px]:-top-10 max-[640px]:h-[320px] max-[640px]:w-[440px]`}
      />
      <div
        className={`${glow} ${glowAccent} -right-[5%] -bottom-10 h-[560px] w-[780px] animate-glow-drift opacity-80 max-[640px]:right-[-15%] max-[640px]:bottom-0 max-[640px]:h-[280px] max-[640px]:w-[340px]`}
      />
      <div
        className={`${glow} ${glowBlue} top-[30%] -left-[10%] h-[520px] w-[700px] animate-glow-drift-reverse opacity-75 max-[640px]:top-[40%] max-[640px]:-left-[15%] max-[640px]:h-[260px] max-[640px]:w-[320px]`}
      />
    </div>
  );
}

import type { IShopSettings, TSettingsNotice } from "@/types/admin-settings";
import ProductionTimeForm from "@/views/AdminSettingsView/components/ProductionTimeForm";
import ShippingProviderForm from "@/views/AdminSettingsView/components/ShippingProviderForm";

interface IAdminSettingsViewProps {
  settings: IShopSettings;
  notice: TSettingsNotice | null;
}

export function AdminSettingsView({
  settings,
  notice,
}: IAdminSettingsViewProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <header>
        <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
          Loja
        </p>
        <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
          Configurações
        </h1>
        <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
          O texto do tempo de produção aparece no card quando o produto tem um
          prazo em dias. O frete usa o provedor escolhido abaixo.
        </p>
      </header>

      {notice === "saved" ? (
        <p
          className="rounded-input border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-4 py-3 text-sm text-brand-blue-hover"
          role="status"
        >
          Configurações atualizadas.
        </p>
      ) : null}

      {settings.shippingSettingsReady ? null : (
        <p
          className="rounded-input border border-[#f0c7c7] bg-[#fff1f1] px-4 py-3 text-sm text-[#9b1c1c]"
          role="alert"
        >
          Não foi possível ler o provedor salvo. A cotação de entrega fica
          indisponível até a leitura voltar. A retirada no local continua
          disponível.
        </p>
      )}

      <ProductionTimeForm settings={settings} />
      <ShippingProviderForm settings={settings} />
    </div>
  );
}

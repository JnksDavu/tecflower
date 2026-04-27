import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';

export const ConfigurationsPage = () => {
  return (
    <div className="px-4 py-6">
      <PageHeader 
        title="Configurações do sistema"
        titleColor="text-[#7B5CE6]"
      />

      <div className="mt-4 max-w-[720px]">
        <Panel title="Dados basicos" description="Placeholder inicial para a tela de configuracoes.">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome da loja" defaultValue="TecFlower" />
            <Input label="Email operacional" defaultValue="caixa@tecflower.com" />
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="min-w-[160px]">Salvar ajustes</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

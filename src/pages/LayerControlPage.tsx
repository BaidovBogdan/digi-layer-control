import styled from 'styled-components';

import { LayerList } from '../components/LayerList';
import { LayerSummary } from '../components/LayerSummary';
import { MapPreview } from '../components/MapPreview';
import { useLayerSelector } from '../features/layers/store';
import { useLayerCatalogController } from '../features/layers/useLayerCatalogController';
import { useLayerController } from '../features/layers/useLayerController';

export function LayerControlPage() {
  const catalog = useLayerSelector((state) => state.catalog);
  const { retry: retryCatalog } = useLayerCatalogController();
  const { setEnabled, setOpacity, retry } = useLayerController();

  return (
    <PageShell>
      <TopBar>
        <Brand>
          <BrandMark aria-hidden="true">D</BrandMark>
          <BrandText>
            <BrandName>DiGi</BrandName>
            <BrandCaption>Система геоданных</BrandCaption>
          </BrandText>
        </Brand>
        <EnvironmentBadge>
          <EnvironmentDot />
          локальный прототип
        </EnvironmentBadge>
      </TopBar>

      <MainContent>
        <Intro>
          <Heading>Управление слоями</Heading>
          <Description>
            Включайте источники данных и настраивайте их отображение на карте.
          </Description>
        </Intro>

        <Workspace>
          <MapPreview />

          <LayerPanel aria-label="Настройки картографических слоёв">
            <PanelHeader>
              <div>
                <PanelTitle>Слои данных</PanelTitle>
                <PanelDescription>
                  {catalog.status === 'success'
                    ? formatSourceCount(catalog.definitions.length)
                    : catalog.status === 'loading'
                      ? 'Загружаем каталог…'
                      : 'Каталог недоступен'}
                </PanelDescription>
              </div>
            </PanelHeader>
            <LayerSummary />
            {catalog.status === 'loading' ? (
              <CatalogMessage role="status">Получаем доступные слои…</CatalogMessage>
            ) : catalog.status === 'error' ? (
              <CatalogError role="alert">
                <span>{catalog.error ?? 'Не удалось загрузить каталог'}</span>
                <RetryCatalogButton type="button" onClick={retryCatalog}>
                  Повторить загрузку
                </RetryCatalogButton>
              </CatalogError>
            ) : catalog.definitions.length === 0 ? (
              <CatalogMessage role="status">Каталог не содержит слоёв</CatalogMessage>
            ) : (
              <LayerList
                definitions={catalog.definitions}
                onEnabledChange={setEnabled}
                onOpacityChange={setOpacity}
                onRetry={retry}
              />
            )}
          </LayerPanel>
        </Workspace>

        <FooterNote>
          Запросы выполняются независимо. При быстром переключении устаревший ответ не меняет
          состояние слоя.
        </FooterNote>
      </MainContent>
    </PageShell>
  );
}

const formatSourceCount = (count: number): string => {
  const remainder10 = count % 10;
  const remainder100 = count % 100;
  const word =
    remainder10 === 1 && remainder100 !== 11
      ? 'источник'
      : remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 12 || remainder100 > 14)
        ? 'источника'
        : 'источников';
  return `${count} ${word} данных`;
};

const PageShell = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 84% 0%, rgba(210, 223, 210, 0.52), transparent 39rem), #f4f6f2;
`;

const TopBar = styled.header`
  display: flex;
  width: min(1256px, calc(100% - 56px));
  min-height: 74px;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  border-bottom: 1px solid #e4e9e1;

  @media (max-width: 600px) {
    width: calc(100% - 36px);
    min-height: 66px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BrandMark = styled.div`
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border-radius: 9px;
  background: #294a3a;
  color: #fff;
  font-size: 14px;
  font-weight: 780;
  letter-spacing: -0.05em;
`;

const BrandText = styled.div`
  display: grid;
  gap: 1px;
`;

const BrandName = styled.span`
  color: #294237;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const BrandCaption = styled.span`
  color: #647168;
  font-size: 9px;
  font-weight: 570;
  letter-spacing: 0.015em;
`;

const EnvironmentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid #e1e8df;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #6e7b71;
  font-size: 10px;
  font-weight: 650;
`;

const EnvironmentDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #68a57b;
`;

const MainContent = styled.main`
  width: min(1256px, calc(100% - 56px));
  margin: 0 auto;
  padding: 34px 0 52px;

  @media (max-width: 600px) {
    width: calc(100% - 36px);
    padding-top: 27px;
  }
`;

const Intro = styled.section`
  margin: 0 0 24px;
`;

const Heading = styled.h1`
  margin: 0;
  color: #263d32;
  font-size: clamp(28px, 3.6vw, 42px);
  font-weight: 720;
  letter-spacing: -0.055em;
  line-height: 1.08;
`;

const Description = styled.p`
  margin: 9px 0 0;
  color: #65746a;
  font-size: 14px;
  line-height: 1.5;
`;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(340px, 0.88fr);
  align-items: stretch;
  gap: 20px;

  @media (max-width: 980px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const LayerPanel = styled.section`
  min-width: 0;
  padding: 20px;
  border: 1px solid #e1e7df;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(37, 57, 46, 0.045);
`;

const PanelHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 1px 13px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: #2b4034;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.025em;
`;

const PanelDescription = styled.p`
  margin: 4px 0 0;
  color: #647168;
  font-size: 11px;
`;

const CatalogMessage = styled.p`
  margin: 13px 0 0;
  padding: 22px 12px;
  border: 1px dashed #d8e1d7;
  border-radius: 10px;
  color: #68766c;
  font-size: 12px;
  text-align: center;
`;

const CatalogError = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 13px;
  padding: 14px;
  border: 1px solid #f1d6cc;
  border-radius: 10px;
  background: #fff8f5;
  color: #925443;
  font-size: 12px;
  line-height: 1.45;
`;

const RetryCatalogButton = styled.button`
  justify-self: start;
  padding: 8px 11px;
  border: 1px solid #c7836d;
  border-radius: 8px;
  background: #fff;
  color: #874a38;
  font-size: 11px;
  font-weight: 700;

  &:focus-visible {
    outline: 3px solid #f0c7b9;
    outline-offset: 2px;
  }
`;

const FooterNote = styled.p`
  max-width: 700px;
  margin: 18px 2px 0;
  color: #647168;
  font-size: 11px;
  line-height: 1.5;
`;

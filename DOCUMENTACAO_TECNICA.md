# Documentação técnica — HOP Front-end

## 1. Visão geral

O HOP é uma aplicação React de página única. `src/main.jsx` inicializa o React, importa Bootstrap e os estilos, e envolve a aplicação com `ThemeProvider`. `src/App.jsx` lê o fragmento da URL (`window.location.hash`) e escolhe Home, Control, Operator ou Client.

Os dois módulos são apresentações diferentes da mesma operação. A fonte compartilhada fica em `src/data/operationStore.js`; páginas obtêm um snapshot estável por `useOperationState` e gravam alterações pelas funções do store. Assim, o chamado inserido no Control é o mesmo objeto atribuído e concluído no Operator.

## 2. Estrutura real

```text
public/assets/profiles/
├── operators/          # fotos públicas dos técnicos
├── leadership/         # fotos públicas das lideranças
└── clients/            # fotos públicas dos responsáveis
src/
├── App.jsx
├── main.jsx
├── assets/logos/
│   ├── hop-logo.png
│   ├── hop-control-logo.png
│   ├── hop-operator-logo.png
│   ├── hop-client-logo.png
│   └── hop-operator-shift-logo.png  # opcional; versão clara para a tela de turno
├── components/
│   ├── control/         # shell, mapa, detalhes e reatribuição do Control
│   ├── operator/        # shell, fila, rota, diagnóstico e modelo 2D
│   └── componentes compartilhados (sidebar, retorno à Home, logo, mapa, badge, tema, métricas e feedback)
├── context/
│   └── ThemeContext.jsx
├── data/
│   ├── mockData.js
│   ├── operationStore.js
│   ├── operatorData.js e controlData.js
│   └── cityMapData.js
├── hooks/
│   ├── useOperationState.js
│   └── useDialogFocus.js
├── pages/
│   ├── HomePage.jsx, ControlPage.jsx e OperatorPage.jsx
│   ├── control/         # visões internas do Control
│   └── operator/        # visões internas do Operator
├── styles/
│   ├── tokens.css          # tokens claros/escuros, inclusive do mapa
│   ├── global.css          # base, tipografia, formulários e acessibilidade
│   ├── components.css      # cards, badges, shells e cabeçalhos compartilhados
│   ├── control.css, operator.css e client.css
│   └── map.css             # desenho e interação visual do mapa
└── utils/
    ├── priorityScore.js
    ├── dispatchRecommendation.js
    ├── operatorWorkflow.js
    └── presentation.js
```

## 3. Arquivos importantes

| Arquivo | Responsabilidade | Alterar quando |
| --- | --- | --- |
| `src/main.jsx` | Inicialização, providers e CSS global | adicionar provider ou folha global |
| `src/App.jsx` | Seleção do módulo pela hash | adicionar módulo/rota raiz |
| `src/data/operationStore.js` | estado único, status, persistência e reset | mudar o contrato compartilhado |
| `src/hooks/useOperationState.js` | assinatura React do store | alterar a estratégia de leitura |
| `src/data/mockData.js` | técnicos, clientes, elevadores e ocorrências base | manter dados demonstrativos |
| `src/utils/priorityScore.js` | pontuação e classificação | revisar pesos de prioridade |
| `src/utils/dispatchRecommendation.js` | recomendação de técnico | revisar despacho demonstrativo |
| `src/components/CityMap.jsx` | mapa, interação e marcadores | alterar comportamento do mapa |
| `src/components/ModuleSidebar.jsx` | estrutura lateral comum aos três módulos | alterar logo, perfil ou comportamento base dos menus |
| `src/components/ProfileAvatar.jsx` | foto pública com fallback para iniciais | alterar renderização, acessibilidade ou tamanhos dos avatares |
| `src/components/DemoHomeLink.jsx` | retorno acessível ao painel demonstrativo | alterar a ação global de retorno |
| `src/data/cityMapData.js` | coordenadas e rota fictícia | mover pontos na cidade |
| `src/context/ThemeContext.jsx` | tema, sistema e persistência | alterar estratégia de tema |
| `src/styles/tokens.css` | design tokens claros/escuros | alterar identidade visual |
| `src/styles/components.css` | estruturas visuais compartilhadas | alterar cards, badges, shells ou cabeçalhos comuns |

## 4. Rotas reais

O projeto usa hash routing nativo; não há React Router. `App.jsx` escolhe o módulo e cada página raiz interpreta seus caminhos internos.

### Gerais

- `#/` — seleção das experiências;
- `#/control` — HOP Control;
- `#/operator` — HOP Operator.

### Control

- `#/control/occurrences`, `/technicians`, `/elevators`, `/analytics`.

### Operator

- `#/operator/occurrences`, `/history`, `/profile`;
- `#/operator/occurrence/:id` — detalhe;
- `#/operator/service/:id` — rota, diagnóstico e atendimento.

### Client

- `#/client/elevators`, `/calls`, `/profile`;
- `#/client/support/:elevatorId` — fluxo curto de suporte;
- `#/client/call/:id` — acompanhamento.

Para criar uma página interna, crie o componente, importe-o na página raiz do módulo, acrescente a condição de rota e inclua o link no shell correspondente.

## 5. Componentes e layouts

- `HopLogo` centraliza as logos oficiais, aceita `variant`, `size` e `className` e resolve a logo especial opcional do turno.
- `ThemeToggle`, `StatusBadge`, `MetricCard` e `FeedbackMessage` são compartilháveis.
- `ModuleSidebar` contém a estrutura visual compartilhada; `ControlShell` e `OperatorShell` configuram itens, perfil e cabeçalho de cada módulo.
- `DemoHomeLink` mantém o retorno ao painel demonstrativo acessível nos três cabeçalhos.
- `ControlOperationsMap` monta marcadores a partir dos dados do Control e entrega-os ao `CityMap`.
- `RouteMap` usa o mesmo `CityMap` e as mesmas coordenadas no atendimento do Operator.
- `Elevator2DModel` expõe máquina de tração, polias, cintas/cabos, governador, quadro, trilhos, contrapeso, cabine, operador/portas, sensores, fins de curso, amortecedores e poço.
- `OperatorShiftClosed` apresenta logo, estado encerrado e início de turno quando a operação de João Carlos está encerrada.
- `ClientSupportFlow` controla as quatro etapas do formulário do cliente.
- `useDialogFocus` posiciona o foco, mantém Tab no diálogo, fecha com Escape e devolve o foco ao elemento anterior.

Ao criar um componente, mantenha uma responsabilidade clara, receba dados por props, use HTML semântico e estilize com tokens. Estado que interessa apenas ao componente fica local; ocorrências compartilhadas sempre passam pelo store.

## 6. Estado compartilhado e estabilidade

`operationStore.js` mantém um cache de snapshot e uma representação JSON. `useOperationState` usa `useSyncExternalStore`, que exige que o snapshot permaneça referencialmente estável enquanto nada mudou. Essa combinação evita cascatas de renderização e eventos repetidos.

Uma gravação:

1. lê o snapshot atual;
2. ignora a operação se ocorrências e turno não mudaram;
3. atualiza o cache antes do armazenamento;
4. grava uma vez no `localStorage`;
5. dispara `hop-operation-updated` uma vez.

A assinatura também escuta `storage`, permitindo sincronização entre abas. Ambos os listeners possuem cleanup. Efeitos temporizados, eventos de teclado, preferência do sistema e animação do mapa também removem seus recursos ao desmontar.

## 7. localStorage

| Chave | Conteúdo |
| --- | --- |
| `hop-shared-operation-v1` | versão, horário, estado do turno do Operator e lista única de ocorrências |
| `hop-theme` | `light` ou `dark` |

O estado é lido na inicialização do hook e gravado apenas por `addOperationOccurrence`, `updateOperationOccurrence`, `writeOperationState` ou `resetOperationState`. Não edite o JSON manualmente durante a aplicação aberta.

“Restaurar dados de demonstração”, na Home, chama `resetOperationState`, recria os mocks e remove chaves antigas das versões anteriores. A preferência de tema é preservada. Se dados antigos causarem incompatibilidade, use esse botão ou remova apenas `hop-shared-operation-v1` nas ferramentas do navegador e recarregue.

## 8. Mock data

`src/data/mockData.js` contém as coleções `technicians`, `clients`, `elevators` e `occurrences`, além de buscas por ID. Os arquivos `clientData.js`, `operatorData.js` e `controlData.js` enriquecem esses registros para a apresentação de cada módulo. Diagnósticos, ETA e histórico rápido do Operator ficam em `operatorData.js`. Coordenadas ficam em `cityMapData.js`.

### Adicionar técnico

1. Adicione um objeto em `technicians` com ID único, nome, status, especialidade, região, distância e atendimento atual.
2. Acrescente uma posição para o mesmo ID em `technicianCityPositions`.
3. Se o técnico for atribuído a um mock, use esse mesmo ID em `technicianId`.

João Carlos é `TEC-010`. Seu perfil de Operator é derivado em `operatorData.js`; ali ficam ID de funcionário, turno, especialidades e localização demonstrativa. Nome, região, especialidade, status inicial e distância vêm do registro `TEC-010` em `mockData.js`.

### Adicionar cliente

Adicione o estabelecimento em `clients` com ID único, nome, tipo, região/endereço e dados já usados pelo objeto existente. Depois inclua o ID em `establishmentCityPositions`. Para torná-lo o cliente demonstrativo principal, altere `clientUser.clientId` em `clientData.js`.

### Adicionar elevador

Adicione em `elevators` um ID, identificação, `clientId` existente, modelo demonstrativo, endereço, status e última manutenção. Para personalização no Client, acrescente a apresentação em `elevatorPresentation`, dentro de `clientData.js`.

### Adicionar ocorrência

Adicione em `occurrences` um ID e referências válidas de elevador/cliente/técnico, horário ISO, descrição, gravidade inicial, status e passageiros presos. Metadados de diagnóstico/rota podem ser colocados em `operatorOccurrenceMetadata`. No uso da aplicação, prefira `addOperationOccurrence`; ela preserva a fonte única e notifica todos os módulos.

## 9. Prioridade

`calculatePriority`, em `priorityScore.js`, começa em 5 pontos e considera passageiros presos, risco à vida, hospital/instalação crítica, elevador parado ou falha parcial, tempo aberto e reincidência. O resultado é limitado a 0–100 e inclui motivos legíveis.

Classificação: 0–29 baixa, 30–54 atenção, 55–79 alta e 80–100 crítica. Alterar um peso afeta ordenação no Operator, fila/indicadores do Control; portanto mantenha os limites coerentes com os tokens de gravidade.

## 10. Despacho e status

`recommendTechnician` filtra apenas disponíveis e ordena por uma pontuação demonstrativa: menor distância, especialidade aderente e bônus de região. Resgate recebe maior peso quando há passageiro preso. Para o cenário principal, João Carlos é coerentemente recomendado.

Status internos, centralizados em `OPERATION_STATUS`, preservam compatibilidade com registros antigos. O fluxo visual atual é:

`Técnico atribuído` → `Em deslocamento` → `Em manutenção` → `Resolvido`.

`operatorWorkflow.js` define três ações: **Aceitar ocorrência** aceita e inicia o deslocamento; **Cheguei ao local** encerra a rota e inicia manutenção/diagnóstico completo; **Finalizar atendimento** resolve, grava conclusão, duração, diagnóstico/solução e retorna ao início. `Aceito` e `No local` continuam reconhecidos apenas para dados legados, sem exigir cliques separados.

### Turno do Operator

`operatorShiftActive`, no mesmo estado de `operationStore.js`, é alterado por `updateOperatorShift` e persistido em `hop-shared-operation-v1`. `OperatorPage.jsx` oculta shell e conteúdo operacional quando o turno é encerrado e renderiza `OperatorShiftClosed.jsx`; iniciar o turno restaura a interface sem resetar ocorrências ou histórico. O Control interpreta João Carlos como indisponível enquanto o turno estiver encerrado.

Na tela encerrada, `HopLogo` procura automaticamente `src/assets/logos/hop-operator-shift-logo.png`, destinada ao contraste em fundo claro. Enquanto esse arquivo opcional não existir, usa `hop-operator-logo.png` como fallback sem quebrar o build.

## 11. Mapa e cidade fictícia

O mapa não usa Leaflet ou API externa. `CityMap.jsx` desenha Nova Aurora com HTML/CSS e um plano cartesiano local de 1000 × 700. Suporta arrastar com mouse/dedo, pinch, roda do mouse, teclas, botões +/−, recentralização, filtros e popup acessível. O listener nativo de `wheel` é não passivo e bloqueia propagação somente dentro do viewport; `touch-action`/`overscroll-behavior` isolam pan e pinch sem bloquear o scroll fora do mapa.

`cityMapData.js` relaciona IDs reais às coordenadas. Para mover um técnico ou estabelecimento, altere `{ x, y }` no mapa correspondente. Ocorrências recebem um pequeno deslocamento ao redor do estabelecimento. `buildCityRoute(start, end)` produz uma linha demonstrativa com dois pontos intermediários. Control e Operator usam exatamente essa base.

Para novo tipo de marcador, monte o objeto com `id`, `layer`, `x`, `y`, `label`, `symbol`, `detail` e `status`/`severity`, e entregue-o ao `CityMap`. Mantenha o fallback textual quando dados de rota estiverem ausentes.

## 12. Modelo 2D e diagnóstico

`Elevator2DModel.jsx` recebe componentes suspeitos e gravidade, destaca as áreas relacionadas por contorno, indicador e texto, e mostra somente dados operacionais do item selecionado. O mapeamento entre falha e componente provável fica em `operatorData.js`.

Durante o deslocamento, `OperatorServicePage.jsx` organiza a área principal em um grid 2 × 2 a partir de 992 px: rota e diagnóstico preliminar na primeira linha; informações técnicas e modelo 2D na segunda. Abaixo desse breakpoint, os quatro blocos são empilhados nessa ordem. Ao clicar em **Cheguei ao local**, o mapa é removido, o diagnóstico técnico completo ocupa toda a primeira linha e informações técnicas/modelo dividem a segunda, sem reservar a antiga área da rota. Use termos “possível”, “provável” e “preliminar”; códigos `MVP-*` são demonstrativos.

## 13. Logos e Home

Os quatro PNGs oficiais ficam em `src/assets/logos`. Mantendo os mesmos nomes, eles podem ser substituídos sem alterar imports. A pasta também pode receber `hop-operator-shift-logo.png`, versão opcional com “OPERATOR” azul para a tela de turno encerrado; sua presença é detectada automaticamente e a logo normal é o fallback. Não aplique filtros, recortes, fundos ou distorção; o CSS usa `object-fit: contain` sobre fundo transparente. Cada logo lateral é link para o início do próprio módulo; a Home mostra somente `hop-logo.png`.

`HomePage.jsx` contém a logo principal, os três cards, links e reset. Os estilos ficam principalmente em `components.css`.

### Fotos de perfil / ProfileAvatar

`ProfileAvatar.jsx` é o único componente responsável por fotos de pessoas. Ele recebe nome, caminho, categoria e tamanho (`sm`, `md` ou `lg`), mantém as iniciais como fallback e oculta a imagem quando o arquivo público não carrega. As fotos ficam em `public/assets/profiles/operators`, `leadership` ou `clients`; não existem imports estáticos, portanto arquivos ausentes não quebram o build.

`profileAvatar.js` normaliza nomes, remove acentos e gera caminhos PNG como `/assets/profiles/operators/joao-carlos.png`. Técnicos recebem `avatar` em `mockData.js`; responsáveis de clientes recebem `contactAvatar`; Fernanda e Mariana usam o mesmo helper em seus arquivos de apresentação. Consulte `GUIA_FOTOS_PERFIL.md` para a lista completa de nomes e caminhos.

## 14. Design system e tema

`tokens.css` define cores, espaços, raios, sombras e superfícies do mapa. Marca: `#252D7A`, `#3F5BD8`, `#F8FAFC`, `#D8DEE8`, `#1E293B`. Gravidade: `#2EC4B6`, `#EAB308`, `#F59E0B`, `#DC2626`. Cores de gravidade são semânticas; não são decoração da marca. Para alterar espaçamento, ajuste a escala curta `--space-1` a `--space-7`; componentes não devem criar outra escala paralela.

O seletor `[data-theme="dark"]` sobrescreve somente tokens, inclusive os `--map-*`, sem duplicar folhas de componentes. `ThemeContext` usa o valor salvo; sem valor manual, respeita `prefers-color-scheme` e acompanha a mudança do sistema. Para adaptar um componente, use variáveis como `--color-background`, `--color-surface`, `--color-text`, `--color-border` e seus equivalentes semânticos; não escreva cores de tema diretamente no componente.

`global.css` guarda a base transversal. `components.css` concentra as estruturas realmente compartilhadas: `.app-card`, `.section-heading`, badges, métricas e shells laterais. `control.css`, `operator.css` e `client.css` devem conter apenas diferenças de cada experiência; `map.css` contém exclusivamente a representação da cidade. Antes de criar uma regra nova, verifique se uma classe compartilhada ou utilidade do Bootstrap já resolve o caso.

## Boas práticas para manter o projeto limpo

- reutilize componente, `.app-card`, shell ou token antes de criar uma variante;
- não adicione HEX fora de `tokens.css` quando a cor fizer parte do tema;
- reutilize os breakpoints existentes antes de abrir outra media query;
- mantenha status em `operationStore.js` e prioridade em `priorityScore.js`;
- preserve inline apenas valores realmente dinâmicos, como coordenadas e barras;
- remova imports, regras e arquivos antigos ao substituir uma implementação.

## 15. Responsividade e acessibilidade

O CSS é mobile-first. Nos três módulos, a navegação lateral vira drawer em telas menores e fica fixa a partir de 768px. No Operator, mapa/diagnóstico ficam lado a lado em 992px durante o deslocamento e empilham abaixo disso; após a chegada, o diagnóstico ocupa a área principal sem GPS. O Control amplia sua grade e coloca mapa/lista lado a lado em 1100px.

Áreas de toque têm aproximadamente 42–48px, foco é visível, ícones relevantes são acompanhados por texto e gravidade nunca depende apenas de cor. `prefers-reduced-motion` reduz transições. Ao criar layout, teste 375, 768, 1024, 1280 e 1366px e evite largura fixa no conteúdo.

## 16. Alterar menus e criar páginas

- A estrutura, logo, perfil e drawer comuns ficam em `ModuleSidebar.jsx`; cada shell fornece sua lista de links.
- Control: itens em `ControlShell.jsx`; conteúdo/rota em `ControlPage.jsx`.
- Operator: itens em `OperatorShell.jsx`; conteúdo/rota/turno em `OperatorPage.jsx`.

Passo a passo: crie o componente em `pages/<módulo>`, importe na página raiz, registre a condição de rota, adicione o link ao shell e use os tokens/estruturas já existentes. Não crie uma segunda fonte de ocorrências.

## 17. Onde eu altero cada coisa?

| Quero alterar | Onde mexer |
| --- | --- |
| Logos | `src/assets/logos/` e `src/components/HopLogo.jsx` |
| Fotos de perfil e fallback | `public/assets/profiles/`, `src/components/ProfileAvatar.jsx`, `src/utils/profileAvatar.js` e `GUIA_FOTOS_PERFIL.md` |
| Cor principal/dark mode | `src/styles/tokens.css` |
| Espaçamento, raios e sombras | `src/styles/tokens.css` |
| Card, badge, shell ou cabeçalho compartilhado | `src/styles/components.css` |
| João Carlos | `src/data/mockData.js` (`TEC-010`) e `src/data/operatorData.js` |
| Técnicos, clientes, elevadores, ocorrências | `src/data/mockData.js` |
| Prioridade | `src/utils/priorityScore.js` |
| Despacho | `src/utils/dispatchRecommendation.js` |
| Status compartilhados/reset | `src/data/operationStore.js` |
| Turno do João Carlos | `src/data/operationStore.js`, `src/pages/OperatorPage.jsx`, `src/components/operator/OperatorShiftClosed.jsx` |
| Fluxo de atendimento do Operator | `src/utils/operatorWorkflow.js`, `src/pages/OperatorPage.jsx`, `src/pages/operator/OperatorServicePage.jsx` |
| Cidade, pontos e rota | `src/data/cityMapData.js` |
| Interação visual do mapa | `src/components/CityMap.jsx`, `src/styles/map.css` |
| Modelo 2D | `src/components/operator/Elevator2DModel.jsx` |
| Estrutura comum das sidebars | `src/components/ModuleSidebar.jsx`, `src/styles/components.css` |
| Itens dos menus Operator/Control | respectivos `src/components/*/*Shell.jsx` |
| Home | `src/pages/HomePage.jsx`, `src/styles/components.css` |
| Tema e persistência | `src/context/ThemeContext.jsx` |

## 18. Build e deploy

```bash
npm install
npm run dev
npm run build
npm run preview
```

O build gera `dist/`. Para deploy estático, publique o conteúdo dessa pasta e configure o host para servir `index.html`. Como as rotas usam hash, não é necessário rewrite de URLs internas. Não há backend, variáveis secretas ou serviços externos obrigatórios.

## 19. Problemas comuns

- **Dependência ausente:** execute `npm install` na raiz.
- **Porta ocupada:** o Vite informa outra URL; abra a URL exibida ou encerre o processo antigo.
- **Dados antigos:** use “Restaurar dados de demonstração”.
- **Mapa sem pontos:** confirme IDs iguais entre `mockData.js` e `cityMapData.js`; o fallback mantém o atendimento legível.
- **Logo ausente:** confirme nome e extensão exatos em `src/assets/logos`.
- **Build falhando:** leia o primeiro erro de import/caminho, corrija e execute `npm run build` novamente.

## 20. Glossário

- **Front-end:** parte visual executada no navegador.
- **React:** biblioteca que compõe a interface em componentes.
- **JavaScript / JSX:** linguagem do projeto e sintaxe que mistura marcação com JavaScript.
- **Componente:** bloco reutilizável de interface; **props** são seus dados de entrada.
- **State:** dado mutável que provoca renderização; **render/re-render** é a criação/atualização visual.
- **Context / Provider:** mecanismo que disponibiliza valor a uma árvore; aqui sustenta o tema.
- **Hook:** função React reutilizável. O projeto usa `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef` e `useSyncExternalStore`.
- **Event listener / cleanup:** observação de um evento e sua remoção ao desmontar, evitando duplicação.
- **Rota / hash routing:** caminho que seleciona uma tela usando o fragmento `#` da URL.
- **Mock data:** dados fictícios usados sem banco real.
- **localStorage / JSON:** armazenamento do navegador e formato textual dos dados persistidos.
- **CSS / variável CSS / design token:** estilo, valor reutilizável e decisão semântica de design.
- **Breakpoint / responsividade / mobile-first:** largura de adaptação, capacidade de responder à tela e criação começando por telas pequenas.
- **Bootstrap:** base de classes de layout e controles.
- **SVG:** desenho vetorial; usado na representação esquemática do elevador.
- **Coordenadas:** pares x/y que posicionam itens na cidade fictícia.
- **Pointer Events:** API que unifica mouse, toque e caneta no mapa.
- **Vite / build:** ferramenta de desenvolvimento e geração dos arquivos otimizados.
- **npm / package.json / dependência:** gerenciador, manifesto de scripts/pacotes e biblioteca externa instalada.
- **Import / export:** conexão entre arquivos JavaScript.
- **API:** interface de programação; o projeto usa APIs nativas do navegador, sem API paga.
- **Backend:** servidor e persistência central; não existe neste MVP.

<p align="center">
  <img src="src/assets/logos/hop-logo.png" alt="HOP" width="380">
</p>

# HOP — ecossistema de atendimento a elevadores

HOP é um MVP acadêmico criado para o Challenge FIAP em parceria com a OTIS. A proposta conecta clientes, operação e técnicos de campo em um único fluxo demonstrativo para registrar, priorizar, despachar e acompanhar ocorrências de elevadores. O projeto não representa um produto oficial implantado pela OTIS.

<div align="center">
  <h2>Equipe</h2>
  <p>
    Davi Rabelo<br>
    Enzo Mitev<br>
    Felipe Domingues<br>
    Marcris Filho<br>
    Nicolas Mantovani
  </p>
</div>

## O problema

Falhas de elevadores têm contextos e riscos diferentes — de funcionamento parcial a passageiros presos. Organizar informações, prioridade, equipe e acompanhamento em interfaces desconectadas aumenta o tempo de resposta e reduz a visibilidade operacional.

## A solução

| Módulo | Público | Visão principal |
| --- | --- | --- |
| **HOP Control** | Lideranças | Central operacional com mapa, ocorrências, técnicos, elevadores e indicadores. |
| **HOP Operator** | Técnicos de campo | Turno, fila priorizada, rota, diagnóstico técnico, modelo 2D e fluxo de atendimento. |
| **HOP Client** | Responsáveis locais | Estado dos elevadores, solicitação de suporte e acompanhamento do chamado. |

## Fluxo integrado

**Cliente informa a ocorrência** → **HOP calcula a prioridade** → **Control organiza e atribui** → **Operator recebe e se desloca** → **atendimento é realizado** → **os três módulos refletem a resolução**.

Todos os módulos leem e atualizam a mesma ocorrência no navegador. O cenário principal usa Mariana Alves, Hospital Santa Helena, Elevador 03 e o operador João Carlos.

## Funcionalidades do MVP

- priorização por contexto operacional, passageiros presos, risco, local, condição do elevador, tempo e reincidência;
- recomendação e atribuição demonstrativa de técnico;
- ciclo completo do chamado, da abertura à resolução, com três ações operacionais no Operator;
- mapa local interativo de Nova Aurora, com pan, zoom, filtros e rota compartilhada;
- diagnóstico preliminar/completo e representação 2D interativa detalhada do elevador;
- dashboards, filas, histórico e dados demonstrativos consistentes;
- turno e tema claro/escuro persistentes, com navegação lateral responsiva nos três módulos;
- restauração discreta dos dados originais para repetir a demonstração.

## Tecnologias

- React 19 e JavaScript;
- HTML semântico e CSS responsivo;
- Bootstrap 5;
- Vite;
- APIs nativas do navegador (`localStorage`, Geolocation, Web Audio e Pointer Events).

O mapa é implementado localmente em React/CSS, sem API externa, chave ou serviço pago.

## Como executar

Requer Node.js e npm instalados.

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura resumida

```text
src/
├── assets/       # logos oficiais
├── components/   # componentes globais e dos três módulos
├── context/      # tema da aplicação
├── data/         # mocks, estado compartilhado e mapa
├── hooks/        # assinaturas de estado e acessibilidade
├── pages/        # páginas e roteamento interno dos módulos
├── styles/       # tokens, estilos compartilhados e ajustes responsivos por módulo
└── utils/        # prioridade, despacho, fluxo e apresentação
```

Detalhes de arquitetura e manutenção estão em [DOCUMENTACAO_TECNICA.md](DOCUMENTACAO_TECNICA.md).

## Dados demonstrativos

Técnicos, clientes, ocorrências, endereços, coordenadas, códigos, diagnósticos, ETA e cidade são fictícios ou simulados para apresentação acadêmica. Não há backend, GPS em tempo real, IA ou especificações técnicas oficiais de equipamentos OTIS neste MVP.

# 🏢 LiftHope • Hop-Escalator

> **Plataforma de Triagem Inteligente e Manutenção Preditiva para Transporte Vertical**

---

## 📌 Sobre o Projeto

O **LiftHope** (Hop-Escalator) é um sistema web corporativo voltado para o monitoramento em tempo real, triagem inteligente de alertas e manutenção preditiva de elevadores e esteiras rolantes.

A plataforma permite que operadores e equipes de engenharia identifiquem anomalias mecânicas antes que ocorra uma parada não programada, através de telemetria contínua (temperatura, vibração RMS, desgaste de cabos) e visualização estrutural interativa em **Raio-X (SVG Dinâmico)**.

---

## 🎯 Principais Funcionalidades

- **🚨 Triagem de Alertas & Priorização Automática:**
  - **P1 (Crítico):** Falhas de alto risco com parada iminente (destaque em vermelho sólido e priorização no topo da fila).
  - **P2 (Urgente):** Alertas operacionais e desgaste acelerado (laranja sólido).
  - **Saudável:** Equipamentos operando dentro dos parâmetros nominais (verde esmeralda).
- **🩻 Planta de Raio-X Estrutural (SVG Dinâmico):**
  - Representação técnica em corte do poço do elevador com destaque visual em tempo real dos componentes em anomalia (`Motor`, `Cabos/Contrapeso`, `Cabine`, `Portas`, `Poço/Amortecedores`).
- **⚡ Chaos Simulator:**
  - Injeção controlada de ocorrências e anomalias mecânicas para testes de estresse e validação de tempo de resposta da equipe de manutenção.
- **📊 Telemetria em Tempo Real:**
  - Monitoramento de temperatura do estator, vibração global (RMS), tensão de cabos de tração e lotação de passageiros.

---

## 🎨 Diretrizes de Design & UI/UX

- **Estilo:** Corporativo, *Flat Design*, Clean e Minimalista.
- **Gradientes:** Estritamente proibido o uso de gradientes (100% cores sólidas de alto contraste).
- **Paleta de Cores:**
  - Fundo Geral: Off-white (`#fafafa` / `bg-slate-50`)
  - Primária / Sidebar: Azul Sólido (`#2563eb` / `bg-blue-600`)
  - Alerta P1 (Crítico): Vermelho Sólido (`#ef4444` / `bg-red-500`) com pulso
  - Alerta P2 (Urgente): Laranja Sólido (`#f97316` / `bg-orange-500`)
  - Operacional / Saudável: Verde Sólido (`#10b981` / `bg-emerald-500`)
  - Tipografia: Cinza chumbo / Azul escuro (`#0f172a` / `text-slate-900`)

---

## 🛠️ Stack Tecnológica Recomendada

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Animações (Opcional):** [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Como Iniciar o Projeto (Quando Pronto)

```bash
# 1. Inicializar o template Vite com React
npm create vite@latest . -- --template react

# 2. Instalar dependências e Tailwind CSS
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e técnicos no âmbito do projeto **Hop-Escalator**.

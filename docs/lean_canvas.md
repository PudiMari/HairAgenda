# Lean Canvas

> Projeto: HairAgenda 
> Data: 08/03/2026  
> Responsável: Mariana Dias do Espirito Santo 

---

## 1. Segmentos de Mercado

- Segmento 1: Cabeleireiras autônomas e donas de pequenos estúdios de beleza.
- Segmento 2: Manicures, maquiadoras e profissionais de estética independentes.
- Early adopters: Profissionais que utilizam o Instagram para atrair clientes, mas sofrem com o gargalo de agendamento manual via WhatsApp.
- Perfil do cliente ideal (ICP): Profissional da beleza que atende sozinha, valoriza a organização e busca otimizar o tempo de atendimento.

---

## 2. Problemas

Principais problemas enfrentados pelo segmento:

1. Interrupção do trabalho: Necessidade de parar o atendimento técnico para responder consultas de horários no celular.
2. Gestão ineficiente: Uso de agendas de papel que resultam em rasuras, perda de dados ou marcações duplas.
3. Faltas: Ausência de um sistema formal de confirmação que reduza as faltas de clientes sem aviso prévio.

Alternativas existentes:
- Agendas de papel e blocos de notas físicos.
- Bloco de notas do celular ou conversas fixadas no WhatsApp Business.
- Sistemas complexos de gestão de salões que são caros ou difíceis de usar.

---

## 3. Solução

Descreva a solução proposta para cada problema:

- Funcionalidade 1: Link de agendamento online 24h onde o próprio cliente escolhe o serviço e o horário disponível no banco de dados.
- Funcionalidade 2: Dashboard administrativo simplificado para visualização e gestão da agenda diária/semanal.
- Funcionalidade 3: Catálogo digital de serviços com nomes, durações e preços atualizados em tempo real.

MVP (Produto Mínimo Viável):
- Aplicação web funcional que permite o cadastro de serviços no backend (Django) e a reserva de horários pelo frontend (React), integrada com banco de dados para persistência.

---

## 4. Proposta de Valor

Frase clara e objetiva que explique o valor entregue:

> "Sua beleza, seu horário: Agende seu momento com autonomia e profissionalismo, sem esperas no WhatsApp."

Diferencial percebido pelo cliente:
- Autonomia: Capacidade de marcar um serviço em segundos, a qualquer hora do dia ou da noite.
- Transparência: Acesso imediato à tabela de preços e disponibilidade real da profissional.

---

## 5. Vantagem Competitiva

O que não pode ser facilmente copiado ou comprado:

- Foco em Micro-UX: Interface extremamente enxuta e "limpa", desenhada especificamente para profissionais que não têm tempo para aprender sistemas complexos.
- Integração Ágil: Estrutura técnica leve (React + Django REST) que permite carregamento rápido em dispositivos móveis simples.

---

## 6. Canais

Como o produto alcança o cliente:

- Aquisição: Tráfego orgânico via redes sociais (link na bio do Instagram/TikTok).
- Distribuição: Web App acessível via navegador, eliminando a barreira de instalação de aplicativos pesados.
- Parcerias: Parcerias com lojas de cosméticos e produtos profissionais para indicação da ferramenta.
- Canais digitais: Anúncios segmentados para "interesses em estética e empreendedorismo feminino".

---

## 7. Métricas

Principais indicadores de desempenho (KPIs):

- Aquisição: Número de novos profissionais cadastrados por semana.
- Ativação: Porcentagem de profissionais que cadastram pelo menos 3 serviços e realizam o primeiro agendamento teste.
- Retenção: Frequência com que as clientes finais retornam para agendar novos serviços.
- Receita: Valor recorrente mensal (MRR) das assinaturas premium.
- Indicação (Referral): Número de novos usuários que chegam via link "Powered by HairAgenda".

Métrica norte (North Star Metric):
- Total de agendamentos realizados: O volume de marcações concluídas com sucesso através da plataforma.

---

## 8. Estrutura de Despesas (Opcional)

Principais custos:

- Desenvolvimento: Manutenção do código e implementação de novas funcionalidades.
- Infraestrutura: Hospedagem da API (Render/Railway), do Frontend (Vercel) e banco de dados.
- Marketing: Custos com anúncios digitais e materiais de divulgação.
- Operacional: Tempo dedicado ao suporte e atendimento aos usuários.

---

## 9. Fontes de Receita (Opcional)

Modelo de monetização:

- Assinatura: Plano mensal para acesso a recursos avançados (relatórios financeiros, lembretes via SMS).
- Comissão: (Alternativo) Taxa fixa por agendamento realizado.
- Venda direta: Venda de funcionalidades "add-on" personalizadas.

Preço estimado:

- Plano Basic: Gratuito | Plano Pro: R$ 29,90/mês.

---

# Observações Estratégicas

- Hipóteses críticas: As profissionais estão dispostas a abandonar a agenda de papel em troca de uma solução digital?
- Riscos principais: Falta de conexão com internet no momento do atendimento e resistência cultural ao auto-agendamento.
- Próximos experimentos: Testar o fluxo de agendamento com um grupo pequeno de 5 profissionais locais.

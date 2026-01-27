-- =============================================
-- HOME ALONE TRACKER - Schema do Banco de Dados
-- =============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: categorias_gasto
-- =============================================
CREATE TABLE categorias_gasto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  icone VARCHAR(10),
  ordem INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO categorias_gasto (nome, icone, ordem) VALUES
  ('Moradia', '🏠', 1),
  ('Saude e Bem-estar', '🧘', 2),
  ('Assinaturas e Cuidados', '📱', 3),
  ('Insumos Mensais', '🧺', 4);

-- =============================================
-- TABELA: renda
-- =============================================
CREATE TABLE renda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salario DECIMAL(10,2) NOT NULL DEFAULT 0,
  beneficio DECIMAL(10,2) NOT NULL DEFAULT 0,
  extras DECIMAL(10,2) DEFAULT 0,
  mes_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
  mode VARCHAR(20) DEFAULT 'living', -- 'preparation' ou 'living'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir renda inicial (preparation e living)
INSERT INTO renda (salario, beneficio, extras, mode) VALUES 
  (1800, 550, 0, 'preparation'),
  (1800, 550, 0, 'living');

-- =============================================
-- TABELA: gastos
-- =============================================
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias_gasto(id),
  nome VARCHAR(255) NOT NULL,
  valor_minimo DECIMAL(10,2),
  valor_maximo DECIMAL(10,2),
  valor_atual DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(10) DEFAULT 'fixo',
  fonte VARCHAR(20) DEFAULT 'salario',
  ativo BOOLEAN DEFAULT TRUE,
  observacao TEXT,
  ordem INT DEFAULT 0,
  mode VARCHAR(20) DEFAULT 'living', -- 'preparation' ou 'living'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir gastos padrão para modo 'living' (morando sozinho)
INSERT INTO gastos (categoria_id, nome, valor_minimo, valor_maximo, valor_atual, tipo, fonte, ativo, observacao, ordem, mode) VALUES
  -- MORADIA
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Aluguel', 700, 700, 700, 'fixo', 'salario', true, 'Base', 1, 'living'),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Internet', 100, 100, 100, 'fixo', 'salario', true, 'Fixa', 2),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Celular', 60, 60, 60, 'fixo', 'salario', true, 'Fixa', 3),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Energia - base', 80, 110, 95, 'variavel', 'salario', true, 'Geladeira inverter + uso leve', 4),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Energia - ar-condicionado', 60, 120, 90, 'variavel', 'salario', false, 'Se usar inverter', 5),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Energia - chuveiro eletrico', 25, 40, 32, 'variavel', 'salario', false, 'Se tiver', 6),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Agua', 40, 70, 55, 'variavel', 'salario', true, 'Variavel', 7),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Moradia'), 'Gas (fogao a gas)', 45, 65, 55, 'variavel', 'salario', true, 'Variavel', 8),
  -- SAUDE
  ((SELECT id FROM categorias_gasto WHERE nome = 'Saude e Bem-estar'), 'Academia', 270, 270, 270, 'fixo', 'salario', true, 'Mensal', 1),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Saude e Bem-estar'), 'Terapia', 160, 160, 160, 'fixo', 'salario', true, 'Mensal', 2),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Saude e Bem-estar'), 'Plano de saude (basico)', 120, 200, 160, 'fixo', 'salario', false, 'Individual, enfermaria', 3),
  -- ASSINATURAS
  ((SELECT id FROM categorias_gasto WHERE nome = 'Assinaturas e Cuidados'), 'Crunchyroll', 15, 15, 15, 'fixo', 'salario', true, 'Mensal', 1),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Assinaturas e Cuidados'), 'Amazon Prime', 13, 13, 13, 'fixo', 'salario', true, 'Mensal', 2),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Assinaturas e Cuidados'), 'Corte de cabelo', 80, 80, 80, 'fixo', 'salario', true, 'Mensal', 3),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Assinaturas e Cuidados'), 'Sobrancelha', 50, 50, 50, 'fixo', 'salario', true, 'Mensal', 4),
  -- INSUMOS
  ((SELECT id FROM categorias_gasto WHERE nome = 'Insumos Mensais'), 'Alimentacao (mercado)', 350, 500, 425, 'variavel', 'beneficio', true, 'Compras no mes', 1),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Insumos Mensais'), 'Alimentacao fora / delivery', 150, 300, 200, 'variavel', 'salario', true, 'Flexivel', 2),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Insumos Mensais'), 'Higiene pessoal', 60, 100, 75, 'variavel', 'beneficio', true, 'Recorrente', 3),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Insumos Mensais'), 'Limpeza da casa', 50, 80, 50, 'variavel', 'beneficio', true, 'Recorrente', 4),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Insumos Mensais'), 'Farmacia / imprevistos', 40, 80, 60, 'variavel', 'salario', true, 'Margem', 5),
  ((SELECT id FROM categorias_gasto WHERE nome = 'Insumos Mensais'), 'Manutencao basica', 30, 60, 45, 'variavel', 'salario', true, 'Reposicoes', 6);

-- =============================================
-- TABELA: itens
-- =============================================
CREATE TABLE itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  fase VARCHAR(20) NOT NULL,
  prioridade VARCHAR(20) NOT NULL,
  valor_minimo DECIMAL(10,2),
  valor_maximo DECIMAL(10,2),
  valor_real DECIMAL(10,2),
  valor_poupado DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pendente',
  data_compra TIMESTAMP WITH TIME ZONE,
  observacao TEXT,
  ordem INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir itens padrão
INSERT INTO itens (nome, categoria, fase, prioridade, valor_minimo, valor_maximo, valor_real, status, observacao, ordem) VALUES
  -- PRE-MUDANCA - COZINHA
  ('Geladeira', 'cozinha', 'pre-mudanca', 'essencial', 1200, 2000, NULL, 'pendente', NULL, 1),
  ('Fogao ou Cooktop', 'cozinha', 'pre-mudanca', 'essencial', 400, 800, NULL, 'pendente', NULL, 2),
  ('Pia com gabinete', 'cozinha', 'pre-mudanca', 'essencial', 300, 700, NULL, 'pendente', NULL, 3),
  ('Frigideira (stone)', 'cozinha', 'pre-mudanca', 'essencial', 90, 130, NULL, 'pendente', NULL, 4),
  ('Panela de pressao grande', 'cozinha', 'pre-mudanca', 'essencial', 120, 250, NULL, 'pendente', NULL, 5),
  -- PRE-MUDANCA - QUARTO (ja tem)
  ('Cama', 'quarto', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 1),
  ('Roupas', 'quarto', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 2),
  ('Mesa de cabeceira', 'quarto', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 3),
  ('Mesa de escritorio', 'quarto', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 4),
  ('Cadeira de escritorio', 'quarto', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 5),
  -- PRE-MUDANCA - CASA
  ('Ventilador', 'casa', 'pre-mudanca', 'essencial', 120, 250, NULL, 'pendente', NULL, 1),
  ('Mesa de jantar', 'casa', 'pre-mudanca', 'essencial', NULL, NULL, NULL, 'pendente', 'A combinar com Daniel', 2),
  ('Extensao / Filtro de linha', 'casa', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 3),
  ('Iluminacao (Alexa + lampadas Wi-Fi)', 'casa', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 4),
  ('Notebook', 'casa', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 5),
  ('Moto', 'casa', 'pre-mudanca', 'essencial', NULL, NULL, 0, 'comprado', 'Ja tinha', 6),
  -- POS-MUDANCA - COZINHA
  ('Armario ou prateleiras de cozinha', 'cozinha', 'pos-mudanca', 'alta', 250, 600, NULL, 'pendente', NULL, 1),
  ('Jogo de panelas simples', 'cozinha', 'pos-mudanca', 'alta', 180, 350, NULL, 'pendente', NULL, 2),
  ('Air fryer', 'cozinha', 'pos-mudanca', 'media', 200, 450, NULL, 'pendente', NULL, 3),
  ('Micro-ondas', 'cozinha', 'pos-mudanca', 'media', 400, 700, NULL, 'pendente', NULL, 4),
  -- POS-MUDANCA - BANHEIRO
  ('Armario ou prateleira de banheiro', 'banheiro', 'pos-mudanca', 'alta', 120, 350, NULL, 'pendente', NULL, 1),
  ('Espelho', 'banheiro', 'pos-mudanca', 'alta', 80, 200, NULL, 'pendente', NULL, 2),
  ('Suportes e toalheiros', 'banheiro', 'pos-mudanca', 'media', 50, 150, NULL, 'pendente', NULL, 3),
  -- POS-MUDANCA - QUARTO
  ('Guarda-roupa', 'quarto', 'pos-mudanca', 'alta', 600, 1200, NULL, 'pendente', NULL, 1),
  ('Cortina blackout', 'quarto', 'pos-mudanca', 'media', 150, 350, NULL, 'pendente', NULL, 2),
  ('Espelho de corpo inteiro', 'quarto', 'pos-mudanca', 'baixa', 120, 300, NULL, 'pendente', NULL, 3),
  -- POS-MUDANCA - CASA
  ('Sofa', 'casa', 'pos-mudanca', 'media', 700, 1500, NULL, 'pendente', NULL, 1),
  ('Robo aspirador', 'casa', 'pos-mudanca', 'baixa', 400, 1200, NULL, 'pendente', NULL, 2),
  ('TV Smart', 'casa', 'pos-mudanca', 'baixa', 900, 1200, NULL, 'pendente', NULL, 3),
  ('Ar-condicionado 9.000 BTUs', 'casa', 'pos-mudanca', 'baixa', 1600, 2400, NULL, 'pendente', NULL, 4),
  ('Cesto de roupa', 'casa', 'pos-mudanca', 'alta', NULL, NULL, 0, 'comprado', 'Ja tinha', 5),
  ('Varal movel', 'casa', 'pos-mudanca', 'alta', NULL, NULL, 0, 'comprado', 'Ja tinha', 6),
  ('Lixeiras (cozinha e banheiro)', 'casa', 'pos-mudanca', 'alta', NULL, NULL, 0, 'comprado', 'Ja tinha', 7);

-- =============================================
-- TABELA: app_settings
-- =============================================
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_move_date DATE, -- data prevista de mudança
  current_mode VARCHAR(20) DEFAULT 'preparation', -- 'preparation' ou 'living'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração inicial
INSERT INTO app_settings (target_move_date, current_mode) VALUES ('2025-09-01', 'preparation');

-- =============================================
-- TABELA: timeline_events
-- =============================================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL, -- 'purchase', 'checklist', 'budget_change', 'date_change', 'note'
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB, -- dados extras específicos por tipo de evento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELA: checklist_mudanca
-- =============================================
CREATE TABLE checklist_mudanca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao VARCHAR(500) NOT NULL,
  data_alvo DATE,
  concluido BOOLEAN DEFAULT FALSE,
  observacao TEXT,
  ordem INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir checklist padrão
INSERT INTO checklist_mudanca (descricao, data_alvo, concluido, observacao, ordem) VALUES
  ('Confirmar data de mudanca', '2025-09-01', false, 'Setembro', 1),
  ('Agendar vistoria do imovel', NULL, false, NULL, 2),
  ('Definir data da compra de geladeira e fogao', NULL, false, 'Fazer caixinha', 3),
  ('Combinar mesa de jantar com Daniel', NULL, false, NULL, 4),
  ('Providenciar documentos para mudanca (RG, CPF, comprovante de renda)', NULL, false, NULL, 5);

-- =============================================
-- TABELA: cenarios
-- =============================================
CREATE TABLE cenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  configuracao JSONB NOT NULL,
  saldo_resultante DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Para uso pessoal sem auth, permitir acesso publico
-- =============================================

ALTER TABLE categorias_gasto ENABLE ROW LEVEL SECURITY;
ALTER TABLE renda ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_mudanca ENABLE ROW LEVEL SECURITY;
ALTER TABLE cenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Policies para acesso publico (anon)
CREATE POLICY "Allow all for categorias_gasto" ON categorias_gasto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for renda" ON renda FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gastos" ON gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for itens" ON itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for checklist_mudanca" ON checklist_mudanca FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for cenarios" ON cenarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for timeline_events" ON timeline_events FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- FUNCAO: Atualizar updated_at automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_renda_updated_at BEFORE UPDATE ON renda FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itens_updated_at BEFORE UPDATE ON itens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON checklist_mudanca FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HABILITAR REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE renda;
ALTER PUBLICATION supabase_realtime ADD TABLE gastos;
ALTER PUBLICATION supabase_realtime ADD TABLE itens;
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_mudanca;
ALTER PUBLICATION supabase_realtime ADD TABLE cenarios;
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE timeline_events;

-- =============================================
-- INSTRUÇÕES PARA CRIAR USUÁRIO
-- =============================================
-- 
-- Para habilitar a autenticação, você precisa criar um usuário
-- no painel do Supabase:
-- 
-- 1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/auth/users
-- 2. Clique em "Add user" > "Create new user"
-- 3. Preencha:
--    - Email: seu@email.com
--    - Password: sua_senha_segura
--    - Auto Confirm User: ✓ (marcar)
-- 4. Salvar
-- 
-- Pronto! Use essas credenciais na tela de login do app.
-- =============================================

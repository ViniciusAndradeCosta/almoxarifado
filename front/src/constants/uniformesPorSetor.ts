// uniformesPorSetor.ts
// Gerado a partir da planilha de Uniformes e EPIs por Setor — Hiper Comercial Monlevade
// Inclui uniformes iniciais e complementos por função

export interface ItemUniforme {
  nome: string;
  qtde: number;
  ca?: string;
}

export interface KitSetor {
  epis: ItemUniforme[];
  uniformes: ItemUniforme[];
}

export interface KitFuncao {
  uniformes: ItemUniforme[];
  epis?: ItemUniforme[];
}

// ── Kit por SETOR (compatibilidade com código anterior) ──
export const UNIFORMES_POR_SETOR: Record<string, KitSetor> = {
  "APRENDIZ": {
    epis: [{ nome: "CALÇADO TIPO BOTINA VULCAFLEX", qtde: 1, ca: "43377" }],
    uniformes: [],
  },
  "FRENTE DE CAIXA": {
    epis: [{ nome: "CALÇADO PRETO 50F61", qtde: 1, ca: "47110" }, { nome: "CALÇADO TIPO BOTINA VULCAFLEX", qtde: 1, ca: "43377" }],
    uniformes: [{ nome: "CAMISA VERMELHA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM VERMELHO", qtde: 2 }],
  },
  "ATENDENTE DO SETOR DE FRIOS": {
    epis: [{ nome: "AVENTAL TRANSPARENTE", qtde: 1, ca: "16553" }, { nome: "JAPONA BRANCA", qtde: 2, ca: "28160" }, { nome: "CALÇADO STICK SHOE W.BRANCO", qtde: 1, ca: "39848" }, { nome: "BOTA BRANCA COTURNO", qtde: 1, ca: "32163" }, { nome: "CALÇA PARA FRIO", qtde: 1, ca: "28157" }, { nome: "CAPUZ OU BALACLAVA", qtde: 1, ca: "10979" }, { nome: "LUVA MALHA DE AÇO", qtde: 1, ca: "12203" }, { nome: "LUVA PARA FRIO", qtde: 1, ca: "41784" }, { nome: "MEIAO BRANCO", qtde: 2 }],
    uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM BRANCA", qtde: 3 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }, { nome: "AVENTAL SUBLIMADO", qtde: 1 }],
  },
  "REPOSITOR DE FRIOS": {
    epis: [{ nome: "BOTA BRANCA COTURNO", qtde: 1, ca: "32163" }, { nome: "JAPONA BRANCA", qtde: 1, ca: "28160" }, { nome: "CALÇA PARA FRIO", qtde: 2, ca: "28157" }, { nome: "CAPUZ OU BALACLAVA", qtde: 2, ca: "10979" }, { nome: "LUVA PARA FRIO", qtde: 2, ca: "41784" }, { nome: "MEIAO BRANCO", qtde: 2 }],
    uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }],
  },
  "HORTIFRUTI": {
    epis: [{ nome: "CALÇADO PRETO 50F61", qtde: 1, ca: "47110" }, { nome: "CALÇADO TIPO BOTINA VULCAFLEX", qtde: 1, ca: "43377" }, { nome: "LUVA MALHA DE AÇO", qtde: 1, ca: "13764" }],
    uniformes: [{ nome: "CAMISA VERDE", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM VERDE", qtde: 2 }, { nome: "BONE VERDE", qtde: 2 }],
  },
  "LIMPEZA": {
    epis: [{ nome: "AVENTAL TRANSPARENTE", qtde: 1, ca: "16553" }, { nome: "CALÇADO STICKY", qtde: 1, ca: "39848" }, { nome: "BOTA CANO LONGO MARLUVAS", qtde: 1, ca: "40754" }, { nome: "LUVA NITRILICA VERDE", qtde: 1, ca: "32069" }, { nome: "ÓCULOS DE PROTEÇÃO", qtde: 1, ca: "6136" }, { nome: "LUVA NITRILICA AZUL", qtde: 1, ca: "42997" }, { nome: "MASCARA COM VALVULA", qtde: 1 }],
    uniformes: [{ nome: "CAMISA", qtde: 3 }, { nome: "CALÇA", qtde: 2 }, { nome: "MOLETOM", qtde: 1 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }],
  },
  "MANUTENÇÃO": {
    epis: [{ nome: "CALÇADO TIPO BOTINA MARLUVAS", qtde: 1, ca: "41419" }, { nome: "LUVA DE RASPA", qtde: 1, ca: "36843" }, { nome: "MANGOTE DE RASPA", qtde: 1 }, { nome: "MASCARA DE SOLDA", qtde: 1, ca: "6135" }, { nome: "ÓCULOS DE PROTEÇÃO", qtde: 1, ca: "6136" }, { nome: "PROTETOR AUDITIVO", qtde: 1, ca: "5745" }, { nome: "RESPIRADOR COM VALVULA PFF2", qtde: 1, ca: "5657" }, { nome: "AVENTAL DE RASPA", qtde: 1 }, { nome: "LUVA DE VAQUETA", qtde: 1, ca: "11711" }],
    uniformes: [{ nome: "CAMISA CINZA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM CINZA", qtde: 1 }],
  },
  "PADARIA": {
    epis: [{ nome: "AVENTAL TERMICO RIO VALLEY", qtde: 1, ca: "37995" }, { nome: "AVENTAL TRANSPARENTE", qtde: 1, ca: "16553" }, { nome: "SAPATO STICKY SHOE BRANCO", qtde: 1, ca: "39848" }, { nome: "LUVA TERMICA KOMBAT", qtde: 1, ca: "39334" }, { nome: "MANGOTE LONA", qtde: 1, ca: "38734" }, { nome: "JAPONA BRANCA", qtde: 1, ca: "28160" }, { nome: "BOTA BRANCA COTURNO", qtde: 1, ca: "32163" }, { nome: "CALÇA PARA FRIO", qtde: 1, ca: "28157" }, { nome: "CAPUZ OU BALACLAVA", qtde: 1, ca: "10979" }, { nome: "LUVA PARA FRIO", qtde: 1, ca: "41784" }, { nome: "MEIAO BRANCO", qtde: 1 }],
    uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }],
  },
  "REPOSIÇÃO": {
    epis: [{ nome: "CALÇADO PRETO 50F61", qtde: 1, ca: "47110" }, { nome: "CALÇADO TIPO BOTINA MARLUVAS", qtde: 1, ca: "41419" }, { nome: "ESTILETE PROFISSIONAL 18MM", qtde: 1 }],
    uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }],
  },
  "RECICLAGEM": {
    epis: [{ nome: "AVENTAL TRANSPARENTE", qtde: 1, ca: "16553" }, { nome: "CALÇADO TIPO BOTINA VULCAFLEX", qtde: 1, ca: "43377" }, { nome: "LUVA DE VAQUETA PROCIPA", qtde: 1, ca: "11711" }],
    uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }],
  },
  "DEPOSITO": {
    epis: [{ nome: "CALÇADO TIPO BOTINA MARLUVAS", qtde: 1, ca: "41419" }, { nome: "ESTILETE PROFISSIONAL 18MM", qtde: 1 }],
    uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }],
  },
  "SUSHI": {
    epis: [{ nome: "CALÇADO STICKY", qtde: 1, ca: "39848" }, { nome: "JAPONA BRANCA", qtde: 1, ca: "28160" }, { nome: "BOTA BRANCA COTURNO", qtde: 1, ca: "32163" }, { nome: "CALÇA PARA FRIO", qtde: 1, ca: "28157" }, { nome: "CAPUZ OU BALACLAVA", qtde: 1, ca: "10979" }, { nome: "LUVA PARA FRIO", qtde: 1, ca: "41784" }, { nome: "MEIAO BRANCO", qtde: 1 }],
    uniformes: [{ nome: "DOLMA", qtde: 3 }, { nome: "CALÇA BRANCA", qtde: 3 }, { nome: "MOLETOM PRETO", qtde: 2 }],
  },
  "TRANSPORTE": {
    epis: [{ nome: "CALÇADO TIPO BOTINA MARLUVAS", qtde: 1, ca: "41419" }, { nome: "JAPONA NYLON AZUL", qtde: 1, ca: "28160" }, { nome: "PROTETOR SOLAR", qtde: 1 }],
    uniformes: [{ nome: "CAMISA AZUL", qtde: 5 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM AZUL", qtde: 2 }],
  },
  "SEGURANÇA": {
    epis: [{ nome: "CALÇADO PRETO 50F61", qtde: 1, ca: "47110" }, { nome: "CALÇADO TIPO BOTINA VULCAFLEX", qtde: 1, ca: "43377" }, { nome: "PROTETOR SOLAR", qtde: 1 }],
    uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA PRETA BRIN", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "COLETE", qtde: 2 }, { nome: "BONE", qtde: 2 }],
  },
  "AÇOUGUE": {
    epis: [{ nome: "AVENTAL TRANSPARENTE", qtde: 1, ca: "42326" }, { nome: "JAPONA BRANCA", qtde: 1, ca: "28160" }, { nome: "BOTA BRANCA COTURNO", qtde: 1, ca: "32163" }, { nome: "CALÇA PARA FRIO", qtde: 1, ca: "28157" }, { nome: "BOTA CANO LONGO MARLUVAS", qtde: 1, ca: "40754" }, { nome: "LUVA MALHA DE AÇO", qtde: 1, ca: "13764" }, { nome: "CAPUZ OU BALACLAVA", qtde: 1, ca: "10979" }, { nome: "LUVA PARA FRIO", qtde: 1, ca: "41784" }, { nome: "MEIAO BRANCO", qtde: 1 }, { nome: "AVENTAL MALHA DE AÇO", qtde: 1 }],
    uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM BRANCA", qtde: 3 }, { nome: "BONE BRANCO", qtde: 2 }],
  },
  "HIPERLANCHES": {
    epis: [{ nome: "CALÇADO STICKY SHOE PRETO", qtde: 1, ca: "39848" }, { nome: "LUVA MALHA DE AÇO", qtde: 1, ca: "13764" }, { nome: "AVENTAL TERMICO KOMBAT", qtde: 2, ca: "27624" }, { nome: "AVENTAL TRANSPARENTE", qtde: 1, ca: "16553" }, { nome: "LUVA TÉRMICA GRAFATEX", qtde: 2, ca: "37292" }, { nome: "JAPONA BRANCA", qtde: 1, ca: "28160" }, { nome: "BOTA BRANCA COTURNO", qtde: 1, ca: "32163" }, { nome: "CALÇA PARA FRIO", qtde: 1, ca: "28157" }, { nome: "CAPUZ OU BALACLAVA", qtde: 1, ca: "10979" }, { nome: "LUVA PARA FRIO", qtde: 1, ca: "41784" }, { nome: "MEIAO BRANCO", qtde: 1 }],
    uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA SOCIAL PRETA", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }],
  },
  "BAZAR":     { epis: [], uniformes: [{ nome: "CAMISA PRETA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM PRETO", qtde: 2 }] },
  "ADMIN":     { epis: [], uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }] },
  "TELEVENDAS":{ epis: [], uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }] },
};

// ── Kit por FUNÇÃO (mais específico) ──
export const UNIFORMES_POR_FUNCAO: Record<string, KitFuncao> = {
  "APRENDIZ":                    { uniformes: [] },
  "CAIXA":                       { uniformes: [{ nome: "CAMISA VERMELHA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM VERMELHO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "ENCARREGADO":                 { uniformes: [{ nome: "CAMISA VERMELHA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM VERMELHO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "GUAR.VOL.":                   { uniformes: [{ nome: "CAMISA VERMELHA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM VERMELHO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "SAC":                         { uniformes: [{ nome: "CAMISA PRETA SOCIAL", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "FISCAL DE CAIXA":             { uniformes: [{ nome: "CAMISA PRETA MALHA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "AUTO ATENDIMENTO":            { uniformes: [{ nome: "CAMISA PRETA MALHA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "ATENDENTE DO SETOR DE FRIOS": { uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM BRANCA", qtde: 3 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }, { nome: "AVENTAL SUBLIMADO", qtde: 1 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "REPOSITOR DE FRIOS":          { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "ATENDENTE/REPOSITOR":         { uniformes: [{ nome: "CAMISA VERDE", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM VERDE", qtde: 2 }, { nome: "BONE VERDE", qtde: 2 }, { nome: "CAMISA", qtde: 3 }, { nome: "CALÇA", qtde: 2 }, { nome: "MOLETOM", qtde: 1 }] },
  "LIMPEZA INTERNA":             { uniformes: [{ nome: "CAMISA", qtde: 3 }, { nome: "CALÇA", qtde: 2 }, { nome: "MOLETOM", qtde: 1 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }] },
  "LIMPEZA EXTERNA":             { uniformes: [{ nome: "CAMISA BEGE", qtde: 5 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM BEGE", qtde: 2 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "SERRALHEIRO":                 { uniformes: [{ nome: "CAMISA CINZA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM CINZA", qtde: 1 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "ENCARREGADO MANUTENÇÃO":      { uniformes: [{ nome: "CAMISA PRETA MALHA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "AJUDANTE DE COZINHA":         { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "PROCESSADOS":                 { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "ATENDENTE DE PADARIA":        { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "AVENTAL SUBLIMADO", qtde: 2 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "PADEIRO":                     { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "BANDANA OU BONE", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "AUX. PADEIRO":                { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "BANDANA OU BONE", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "CONFEITEIRO":                 { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "TOUCA TELADO BRANCA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "SALGADEIRO":                  { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "TOUCA TELADO BRANCA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "CHEFE DE COZINHA":            { uniformes: [{ nome: "CAMISA BRANCO", qtde: 5 }, { nome: "CALÇA BRANCO", qtde: 5 }, { nome: "MOLETOM BRANCO", qtde: 3 }, { nome: "BANDANA TOUCA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "REPOSIÇÃO":                   { uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "RECICLAGEM":                  { uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "AUXILIAR DE ARMAZENAMENTO":   { uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "CONFERENTE":                  { uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "ESTOQUISTA":                  { uniformes: [{ nome: "CAMISA CINZA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM CINZA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "SUSHI":                       { uniformes: [{ nome: "DOLMA", qtde: 3 }, { nome: "CALÇA BRANCA", qtde: 3 }, { nome: "MOLETOM PRETO", qtde: 2 }, { nome: "DOLMA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "MOTORISTA":                   { uniformes: [{ nome: "CAMISA AZUL", qtde: 5 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM AZUL", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "AJUDANTE DE ENTREGA":         { uniformes: [{ nome: "CAMISA AZUL", qtde: 5 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM AZUL", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "FISCAL":                      { uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA PRETA BRIN", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "COLETE", qtde: 2 }, { nome: "BONE", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }, { nome: "COLETE", qtde: 1 }] },
  "VIGIA":                       { uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA PRETA BRIN", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "COLETE", qtde: 2 }, { nome: "BONE", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }, { nome: "COLETE", qtde: 1 }] },
  "ORI. TRÁFEGO":                { uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA PRETA BRIN", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "COLETE", qtde: 2 }, { nome: "BONE", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }, { nome: "COLETE", qtde: 1 }] },
  "AÇOUGUEIRO":                  { uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM BRANCA", qtde: 3 }, { nome: "BONE BRANCO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "DESSOSA":                     { uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM BRANCA", qtde: 3 }, { nome: "BONE BRANCO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "OPERADOR DE CAIXA":           { uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA SOCIAL PRETA", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "GARÇON":                      { uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA SOCIAL PRETA", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "CHURRASQUEIRO":               { uniformes: [{ nome: "CAMISA PRETA", qtde: 4 }, { nome: "CALÇA SOCIAL PRETA", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "BONE PRETO", qtde: 2 }, { nome: "DOLMA", qtde: 3 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "AJUDANTE CHURRASQUEIRO":      { uniformes: [{ nome: "CAMISA PRETA", qtde: 4 }, { nome: "CALÇA SOCIAL PRETA", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "BONE PRETO", qtde: 2 }, { nome: "DOLMA", qtde: 3 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "PIZZAIOLO":                   { uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM", qtde: 1 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "AJUDANTE PIZZAIOLO":          { uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM", qtde: 1 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "COZINHEIRO":                  { uniformes: [{ nome: "CAMISA BRANCA", qtde: 5 }, { nome: "CALÇA BRANCA", qtde: 5 }, { nome: "MOLETOM", qtde: 1 }, { nome: "TOUCA TELADA PRETA", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "REPOSIÇÃO BAZAR":             { uniformes: [{ nome: "CAMISA PRETA", qtde: 4 }, { nome: "CALÇA JEANS", qtde: 3 }, { nome: "MOLETOM PRETO", qtde: 2 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "ADMINISTRADOR":               { uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
  "TELEVENDAS":                  { uniformes: [{ nome: "CAMISA PRETA", qtde: 3 }, { nome: "CALÇA JEANS", qtde: 2 }, { nome: "MOLETOM PRETO", qtde: 1 }, { nome: "CAMISA", qtde: 2 }, { nome: "CALÇA", qtde: 1 }, { nome: "MOLETOM", qtde: 1 }] },
};

// ── Mapeamento setor → funções disponíveis ──
export const FUNCOES_POR_SETOR: Record<string, string[]> = {
  "APRENDIZ":                    ["APRENDIZ"],
  "FRENTE DE CAIXA":             ["CAIXA", "ENCARREGADO", "GUAR.VOL.", "SAC", "FISCAL DE CAIXA", "AUTO ATENDIMENTO"],
  "ATENDENTE DO SETOR DE FRIOS": ["ATENDENTE DO SETOR DE FRIOS"],
  "REPOSITOR DE FRIOS":          ["REPOSITOR DE FRIOS"],
  "HORTIFRUTI":                  ["ATENDENTE/REPOSITOR"],
  "LIMPEZA":                     ["LIMPEZA INTERNA", "LIMPEZA EXTERNA"],
  "MANUTENÇÃO":                  ["SERRALHEIRO", "ENCARREGADO MANUTENÇÃO"],
  "PADARIA":                     ["AJUDANTE DE COZINHA", "PROCESSADOS", "ATENDENTE DE PADARIA", "PADEIRO", "AUX. PADEIRO", "CONFEITEIRO", "SALGADEIRO", "CHEFE DE COZINHA"],
  "REPOSIÇÃO":                   ["REPOSIÇÃO", "AUXILIAR DE ARMAZENAMENTO", "CONFERENTE", "ESTOQUISTA"],
  "RECICLAGEM":                  ["RECICLAGEM"],
  "DEPOSITO":                    ["REPOSIÇÃO", "AUXILIAR DE ARMAZENAMENTO", "CONFERENTE", "ESTOQUISTA"],
  "SUSHI":                       ["SUSHI"],
  "TRANSPORTE":                  ["MOTORISTA", "AJUDANTE DE ENTREGA"],
  "SEGURANÇA":                   ["FISCAL", "VIGIA", "ORI. TRÁFEGO"],
  "AÇOUGUE":                     ["AÇOUGUEIRO", "DESSOSA"],
  "HIPERLANCHES":                ["OPERADOR DE CAIXA", "GARÇON", "CHURRASQUEIRO", "AJUDANTE CHURRASQUEIRO", "PIZZAIOLO", "AJUDANTE PIZZAIOLO", "COZINHEIRO", "SALGADEIRO"],
  "BAZAR":                       ["REPOSIÇÃO BAZAR"],
  "ADMIN":                       ["ADMINISTRADOR"],
  "TELEVENDAS":                  ["TELEVENDAS"],
};

// Setores em ordem alfabética
export const SETORES_DISPONIVEIS = Object.keys(FUNCOES_POR_SETOR).sort();
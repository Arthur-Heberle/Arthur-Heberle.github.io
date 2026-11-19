import type { Lang } from '../../shared/i18n/lang'

const en = {
  heading: 'Experience',
  now: 'now',
  hard: 'The hard part:',
  months: (n: number) => `${n} month${n === 1 ? '' : 's'}`,
  soFar: ' so far',
  // The one description that names each experience's object for assistive technology (the drawing itself is
  // aria-hidden). The RP3, laptop and analyzer descriptions say what is illustrative.
  // The words drawn on the objects (aria-hidden: the figure's description above is what a screen reader gets).
  // The UML names and the C++ on the laptop are code, so they are not here. Readings and figures are illustrative.
  objects: {
    chalk: { calc2: 'Calculus II', calc3: 'Calculus III' },
    // the spreadsheet on the clipboard
    sheet: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      month: 'Month',
      base: 'Base',
      after: 'After',
      saved: 'Saved',
      total: 'Total',
      data: 'Data',
      model: 'M&V',
    },
    chart: {
      title: 'Consumption, kWh',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      baseline: 'baseline',
      after: 'after',
      savings: 'savings',
    },
    report: {
      title: 'M&V REPORT',
      sub: 'Baseline and after, savings verified',
      baseline: 'baseline',
      after: 'after',
      tBaseline: 'Baseline',
      tAfter: 'After',
      tSavings: 'Savings',
    },
    // the analyzer's display: a label over a reading
    readings: [
      ['VOLTAGE', 'V1 220.4 V'],
      ['CURRENT', 'I1 18.2 A'],
      ['POWER', 'P 11.9 kW'],
      ['ENERGY', 'E 1284 kWh'],
    ],
  },
  desc: {
    rp3: "An illustration, not RP3's real interface: a monitor showing a part sliced into layers on a gridded build platform with X, Y and Z axes, the layer contours rising one layer at a time, and beside it a small generic 3D printer building the same part layer by layer.",
    'programming-techniques':
      "A laptop showing a class diagram: Entity, with Player and Enemy inheriting from it, and a Level holding a pointer to an Entity, above a few lines of C++. The class names and code are illustrative of the course's SFML game, not its real code.",
    'eletron-energia':
      'An illustration of a power analyzer in the style of the IMS PowerNET T-500, with green terminal blocks standing out of its front, and three current transformers clamped around cables L1 to L3, current pulsing through them, wired to its inputs, its display cycling through illustrative readings; beside it a clipboard with a spreadsheet, a printed measurement-and-verification report, and a chart of consumption before and after with the savings between the two. The readings and figures are illustrative, not measured values.',
    'calculus-ii':
      'A chalkboard in a wooden frame, with a tray along its foot holding chalk and an eraser. It is written on in chalk and shows worked problems: Calculus II on one half (the curve y equals 3x squared from 0 to 2 with the area under it hatched, and its integral worked out, with one wrong attempt struck through, to 8) and Calculus III on the other (the surface z equals x squared plus y squared, and a double integral of x plus y worked out to 3). Faint marks show where it was wiped.',
  } as Record<string, string>,
}

const pt: typeof en = {
  heading: 'Experiência',
  now: 'agora',
  hard: 'A parte difícil:',
  months: (n: number) => `${n} ${n === 1 ? 'mês' : 'meses'}`,
  soFar: ' até agora',
  objects: {
    chalk: { calc2: 'Cálculo II', calc3: 'Cálculo III' },
    sheet: {
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      month: 'Mês',
      base: 'Base',
      after: 'Depois',
      saved: 'Econ.',
      total: 'Total',
      data: 'Dados',
      model: 'M&V',
    },
    chart: {
      title: 'Consumo, kWh',
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      baseline: 'base',
      after: 'depois',
      savings: 'economia',
    },
    report: {
      title: 'RELATÓRIO DE M&V',
      sub: 'Linha de base e depois, economia verificada',
      baseline: 'base',
      after: 'depois',
      tBaseline: 'Linha de base',
      tAfter: 'Depois',
      tSavings: 'Economia',
    },
    readings: [
      ['TENSÃO', 'V1 220,4 V'],
      ['CORRENTE', 'I1 18,2 A'],
      ['POTÊNCIA', 'P 11,9 kW'],
      ['ENERGIA', 'E 1284 kWh'],
    ],
  },
  desc: {
    rp3: 'Uma ilustração, não a interface real do RP3: um monitor mostrando uma peça fatiada em camadas sobre uma plataforma de impressão quadriculada com eixos X, Y e Z, os contornos das camadas subindo uma camada de cada vez e, ao lado, uma pequena impressora 3D genérica construindo a mesma peça camada por camada.',
    'programming-techniques':
      'Um notebook mostrando um diagrama de classes: Entity, com Player e Enemy herdando dela, e um Level que guarda um ponteiro para uma Entity, acima de algumas linhas de C++. Os nomes das classes e o código são ilustrativos do jogo em SFML da disciplina, não o código real.',
    'eletron-energia':
      'Uma ilustração de um analisador de energia no estilo do IMS PowerNET T-500, com blocos de terminais verdes saindo da frente, e três transformadores de corrente presos em volta dos cabos L1 a L3, com corrente pulsando por eles, ligados às suas entradas, e o visor alternando entre leituras ilustrativas; ao lado, uma prancheta com uma planilha, um relatório impresso de medição e verificação e um gráfico do consumo antes e depois, com a economia entre os dois. As leituras e os valores são ilustrativos, não medidos.',
    'calculus-ii':
      'Uma lousa em uma moldura de madeira, com uma bandeja ao longo da base com giz e um apagador. Está escrita a giz e mostra problemas resolvidos: Cálculo II em uma metade (a curva y igual a 3x ao quadrado de 0 a 2, com a área sob ela hachurada, e sua integral resolvida, com uma tentativa errada riscada, até 8) e Cálculo III na outra (a superfície z igual a x ao quadrado mais y ao quadrado, e uma integral dupla de x mais y resolvida até 3). Marcas fracas mostram onde foi apagada.',
  },
}

export const text: Record<Lang, typeof en> = { en, pt }

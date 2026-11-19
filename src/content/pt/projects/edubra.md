---
date: "2025-06"
title: EduBra — dispositivo para ensinar Braille
role: "equipe de 3, escrevi o software e construí a maior parte do hardware"
tags: [hardware, teaching]
links:
  repo: https://github.com/Arthur-Heberle/Oficinas_1
link: /projects/edubra/
line: >-
  Ensina Braille a pessoas cegas e com baixa visão: uma voz diz a letra e, em seguida, seis
  pinos sobem sob o seu dedo.
pinned: true
project:
  what: >-
    Um dispositivo de baixo custo que ajuda pessoas cegas e com baixa visão a aprender Braille por
    conta própria. Ele lê um arquivo letra por letra: uma voz diz a letra e, em seguida, seis
    pinos sobem sob o seu dedo.
  note: >-
    Os leitores de tela não tornaram o Braille obsoleto. Para muitos adultos cegos, ler Braille
    ainda é uma grande parte da independência.
  built:
    - >-
      Os pinos passaram por quatro projetos no SolidWorks até que as juntas deixassem de ser o
      ponto fraco. Imprimimos em PLA no laboratório de prototipagem da universidade.
    - >-
      A Pi não consegue alimentar seis servos ao mesmo tempo, então uma fonte de 5 V separada
      alimenta os motores e a Pi só envia o sinal.
    - >-
      A caixa é de MDF de 3 mm, cortada a laser com encaixes dentados. Mesmo assim, tivemos de
      alargar a abertura da célula com uma serra tico-tico depois de um erro de medida, e afinar a
      tampa sob os botões para que as molas tivessem espaço para apertar.
    - >-
      Cada botão tem um símbolo feito com cola quente, para que dê para diferenciá-los pelo tato.
  part:
    - >-
      Equipe de três na disciplina Oficina de Integração 1, na UTFPR, em 2025: Luiz Correia,
      Rafael Fernandes e eu. Escrevi todo o software e construí a maior parte do hardware.
    - >-
      No notebook, uma pequena página Flask recebe o arquivo, extrai o texto e o envia para a Pi.
      Na Pi, um segundo programa transforma cada caractere em um padrão de seis pinos, fala a
      palavra e depois cada letra, e continua ouvindo os botões e o botão de volume enquanto lê.
    - >-
      Os botões foram a parte teimosa. O áudio e os motores mantinham o laço principal ocupado, e
      os apertos se perdiam. Interrupções resolveram, até que uma reinstalação do sistema as
      quebrou; a versão final usa uma thread separada que só observa os botões.
  differently:
    - >-
      Colocar tudo na Pi, para ser um único dispositivo em vez de um notebook e uma Pi.
    - >-
      Encontrar uma voz offline que seja realmente clara. A primeira que testamos era difícil de
      entender, então trocamos pela do Google, que precisa de internet: algo estranho para
      depender em um dispositivo assistivo. Ela também é o gargalo.
    - >-
      Levantar os seis pinos de uma vez, todos na mesma altura, e eliminar o pequeno tremor que
      alguns pinos ainda têm.
  paper:
    href: /docs/edubra-paper.pdf
    label: Artigo final (PDF)
---

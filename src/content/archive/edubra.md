---
date: "2025-06"
title: EduBra — Braille teaching device
role: "team of 3, wrote the software, built most of the hardware"
tags: [hardware, teaching]
links:
  repo: https://github.com/Arthur-Heberle/Oficinas_1
blurb: >-
  Converts digital text to tactile Braille. Python on a Raspberry Pi 4, Wi-Fi and
  multithreading driving six servos, each word spoken aloud first.
pinned: true
project:
  what: >-
    A low-cost device that helps blind and visually impaired people learn Braille on their own.
    It reads a file letter by letter: a voice says the letter, then six pins rise under your
    finger.
  note: >-
    Screen readers didn't make Braille obsolete. For many blind adults, reading it is still a big
    part of independence.
  built:
    - >-
      The pins took four designs in SolidWorks before the joints stopped being the weak
      point. We printed them in PLA at the university's prototyping lab.
    - >-
      The Pi can't power six servos at once, so a separate 5 V supply feeds the motors and
      the Pi only sends the signal.
    - >-
      The box is 3 mm MDF, laser-cut with finger joints. We still had to widen the cell
      opening with a jigsaw after a measuring mistake, and thin the lid under the buttons so
      their springs had room to press.
    - >-
      Each button has a symbol drawn in hot glue, so you can tell them apart by touch.
  part:
    - >-
      Team of three for Oficina de Integração 1 at UTFPR, 2025: Luiz Correia, Rafael
      Fernandes and me. I wrote all of the software and built most of the hardware.
    - >-
      On the laptop, a small Flask page takes the file, pulls out the text and sends it to
      the Pi. On the Pi, a second program turns each character into a six-pin pattern, plays
      the word and then each letter, and keeps listening to the buttons and the volume knob
      while it reads.
    - >-
      The buttons were the stubborn part. Audio and motors kept the main loop busy, so
      presses got lost. Interrupts fixed it until an OS reinstall broke them; the final
      version uses a separate thread that does nothing but watch the buttons.
  differently:
    - >-
      Put everything on the Pi, so it's one device instead of a laptop and a Pi.
    - >-
      Find an offline voice that's actually clear. The first one we tried was hard to
      understand, so we switched to Google's, which needs internet: a strange thing to
      depend on for an assistive device. It's also the bottleneck.
    - >-
      Raise all six pins at once, all to the same height, and get rid of the small twitch
      some pins still have.
  paper:
    href: /docs/edubra-paper.pdf
    label: Final paper, in Portuguese (PDF)
---

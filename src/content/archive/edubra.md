---
date: "2025-06"
title: EduBra — Braille teaching device
role: "team of 3, wrote the software, built most of the hardware"
tags: [hardware, teaching]
links:
  repo: https://github.com/Arthur-Heberle/Oficinas_1
blurb: >-
  Converts digital text to tactile Braille. Python on a Raspberry Pi 4, Wi-Fi,
  multithreading and hardware interrupts driving six servos, each word spoken aloud first.
pinned: true
project:
  what: >-
    A low-cost device that helps blind and visually impaired people learn Braille on their own.
    It reads a file letter by letter: a voice says the letter, then six pins rise under your
    finger.
  note: >-
    Screen readers didn't make Braille obsolete. For many blind adults, reading it is still a big
    part of independence.
  did: >-
    All of the software. A small upload page that pulls the text out of the file and sends
    it to the Pi over Wi-Fi, and the program on the Pi that turns each character into six
    pins, speaks it first, and keeps listening to the buttons and the volume knob while it
    reads.
  team: >-
    Team of three for Oficina de Integração 1 at UTFPR, 2025, with Luiz Correia and Rafael
    Fernandes. I wrote the software and built most of the hardware.
  differently: >-
    Run everything on the Pi, so it's one device instead of a laptop and a Pi. And make the
    speech work offline: right now the spoken words need an internet connection, which is a
    strange dependency for an assistive device.
---

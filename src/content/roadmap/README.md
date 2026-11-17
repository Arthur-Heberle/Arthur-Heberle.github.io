# Roadmap timelines

Each `.yaml` file in this folder is **one horizontal timeline** in the home page's Roadmap section
(`src/home/roadmap/`). The schema is in `src/content.config.ts` (`roadmap`); a wrong field fails the build.

## Add a timeline

Copy any file here (e.g. `rp3.yaml`), rename it (the file name is its id: lowercase, dashes), and edit:

```yaml
title: Bible            # the timeline's name
order: 5                # position in the section, smallest first
groups:                 # one or more blocks of nodes, shown as labelled stretches of the line
  - title: Old Testament
    nodes:
      - title: Proverbs
        due: 2026-12-20         # the date limit: YYYY-MM-DD, or YYYY-MM for "sometime that month"
        start: 2026-12-10       # optional: makes it a range, "Dec 10–20"
        done: false             # true draws the tick in the box
        about: What this step is about, shown in the popup when the node is clicked.
```

## Mark something done

Set `done: true` on the node. The timeline's count (`3/18`) is computed, never typed.

## Notes

- Quote a value that contains `: ` (colon + space), or YAML reads it as a key: `about: "Three things: a, b, c."`
- Dates are written without quotes (`2026-12-20`); YAML may read them as dates, the schema accepts both.
- Nodes are shown in the order written, evenly spaced, not to a time scale.
- The wave of each timeline is random but fixed: it is seeded from the file name.

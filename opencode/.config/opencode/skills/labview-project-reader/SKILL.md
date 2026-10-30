---
name: labview-project-reader
description: Read NI LabVIEW projects without LabVIEW. Use when asked to inspect .vi, .ctl, .lvclass, .lvproj, actor hierarchies, class private data fields, VI logic, or project dependencies.
---

# LabVIEW Project Reader

Read LabVIEW files as data, not as opaque binaries. No LabVIEW runtime required.

## Tool

`scripts/lv.sh` wraps `junior941230/labview-vi-reader`, a pylabview fork with LabVIEW 2017–2026 support.

First use clones it to:

```text
${XDG_CACHE_HOME:-$HOME/.cache}/labview-vi-reader
```

Override with `LABVIEW_VI_READER=/path/to/labview-vi-reader`.

## Workflow

1. **Map the project**
   - List `.lvclass`, `.lvlib`, `.vi`, `.ctl` paths.
   - Read `.lvproj` and `.lvclass` as XML.
2. **Read one VI**
   ```bash
   scripts/lv.sh vi "path/to/My VI.vi"
   ```
   Gives block diagram tree, wires, case labels, constants, subVI calls, dependencies.
3. **Read one class**
   ```bash
   scripts/lv.sh class "path/to/My Class.lvclass"
   ```
   Prints parent classes and private-data field names.
4. **Read private data only**
   ```bash
   scripts/lv.sh private "path/to/My Class.lvclass" /tmp/lv-class
   ```
   Decodes `NI.LVClass.FlattenedPrivateDataCTL` into a `.ctl` RSRC and extracts its front-panel labels.
5. **Read many VIs**
   Loop `scripts/lv.sh vi` over the files. Filter the output with `grep` or a subagent.

## Limits

- Private data gives field names and control structure, not live values.
- `VICD` compiled code is raw binary.
- Link objects may be partially resolved.
- The block diagram tree is reconstructed, not rendered exactly like LabVIEW.
- No runtime execution, probing, or breakpoints.

## Output Discipline

Return:

- file path
- class or VI purpose
- parent classes
- fields or messages that matter
- exact evidence with file paths
- limits of what could not be read

Do not dump full XML unless asked.

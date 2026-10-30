#!/usr/bin/env python3
"""Decode a LabVIEW .lvclass private-data control without LabVIEW."""
import os
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

PRIVATE = "NI.LVClass.FlattenedPrivateDataCTL"


def decode_text(text: str) -> bytes:
    text = "".join(text.split())
    bits = []
    for ch in text:
        value = (ord(ch) - 0x21) & 0x3F
        for shift in range(5, -1, -1):
            bits.append((value >> shift) & 1)
    data = bytearray()
    for i in range(0, len(bits) - 7, 8):
        byte = 0
        for bit in bits[i:i + 8]:
            byte = (byte << 1) | bit
        data.append(byte)
    return bytes(data)


def labels_from_fphb(xml_path: Path) -> list[str]:
    if not xml_path.exists():
        return []
    root = ET.parse(xml_path).getroot()
    skip = {"Pane", "Cluster of class private data", "Size: 0", "&#x00;", "String"}
    out = []
    for el in root.iter("text"):
        text = (el.text or "").strip().strip('"')
        if len(text) > 1 and text not in skip and text not in out:
            out.append(text)
    return out


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: lv_private.py <file.lvclass> [outdir]", file=sys.stderr)
        return 2
    src = Path(sys.argv[1]).expanduser().resolve()
    outdir = Path(sys.argv[2]).expanduser().resolve() if len(sys.argv) > 2 else Path(tempfile.mkdtemp(prefix="lv-class-"))
    outdir.mkdir(parents=True, exist_ok=True)

    root = ET.parse(src).getroot()
    parents = [item.get("Name") for item in root.iter("Item") if item.get("Type") == "Parent"]

    prop = next((p for p in root.iter() if p.get("Name") == PRIVATE), None)
    if prop is None or not (prop.text or "").strip():
        print(f"{src}: no {PRIVATE}")
        return 1

    raw = decode_text(prop.text or "")
    if not raw.startswith(b"RSRC", 33):
        print(f"{src}: decoded private data does not contain RSRC at offset 33", file=sys.stderr)
        return 1
    ctl = outdir / (src.stem.replace(" ", "_") + "_private.ctl")
    ctl.write_bytes(raw[33:])

    print(f"class: {src.name}")
    if parents:
        print("parents:")
        for parent in parents:
            print(f"- {parent}")

    reader = Path(__file__).resolve().parent.parent / "vendor"
    if not (reader / "pylabview").exists():
        print(f"private data: {ctl}")
        print(f"pylabview missing at {reader}")
        return 0

    env = os.environ.copy()
    env["PYTHONPATH"] = str(reader) + (os.pathsep + env["PYTHONPATH"] if env.get("PYTHONPATH") else "")
    subprocess.run(
        [sys.executable, "-m", "pylabview.readRSRC", "-i", str(ctl), "-x"],
        cwd=outdir,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    fields = labels_from_fphb(outdir / (ctl.stem + "_FPHb.xml"))
    if fields:
        print("private data fields:")
        for field in fields:
            print(f"- {field}")
    else:
        print(f"private data: {ctl}")
        print("no front-panel labels extracted")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
import argparse
import io
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


REDACTIONS = {
    93: {
        "box": (0.065, 0.405, 0.935, 0.885),
        "title": "Состав команды",
        "body": "Персональные данные и подробные профили участников доступны инвесторам по запросу.",
    },
    94: {
        "box": (0.065, 0.055, 0.935, 0.885),
        "title": "Команда проекта",
        "body": "Профессиональный опыт и роли участников раскрываются в закрытых материалах для инвесторов.",
    },
    97: {
        "box": (0.497, 0.247, 0.885, 0.334),
        "title": "",
        "body": "Структура владения раскрывается инвесторам по запросу.",
    },
    104: {
        "box": (0.105, 0.515, 0.895, 0.625),
        "title": "",
        "body": "Руководитель направления отвечает за технологическую базу, качество продукта и взаимодействие инженерных команд.",
    },
    153: {
        "box": (0.135, 0.285, 0.885, 0.955),
        "title": "Команда инвестиционного проекта",
        "body": "Роли, опыт и персональные профили руководителей направлений доступны потенциальным инвесторам в закрытых материалах.",
    },
    154: {
        "box": (0.145, 0.055, 0.885, 0.835),
        "title": "Блок исследований и разработок",
        "body": "Направление отвечает за прототипирование, испытания и развитие технологической базы продукта. Персональный состав команды раскрывается инвесторам в закрытом контуре.",
    },
    160: {
        "box": (0.105, 0.065, 0.895, 0.565),
        "title": "Дивидендная модель",
        "body": "Детальная структура владения и распределения выплат доступна потенциальным инвесторам после подтверждения интереса и подписания соглашения о конфиденциальности.",
    },
    161: {
        "box": (0.105, 0.275, 0.895, 0.915),
        "title": "Инвестиционные раунды",
        "body": "Параметры раундов, доли участников и сценарии выхода представлены в закрытой финансовой модели для квалифицированных инвесторов.",
    },
}


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def wrapped_lines(draw, text, font_value, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and draw.textbbox((0, 0), candidate, font=font_value)[2] > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def redact_image(image_path, config):
    image = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(image)
    width, height = image.size
    x1, y1, x2, y2 = config["box"]
    box = (int(x1 * width), int(y1 * height), int(x2 * width), int(y2 * height))
    draw.rectangle(box, fill="#ffffff", outline="#d7e0f2", width=max(2, width // 700))

    padding = max(20, width // 30)
    cursor_y = box[1] + padding
    if config["title"]:
        title_font = font(max(24, width // 30), bold=True)
        draw.text((box[0] + padding, cursor_y), config["title"], fill="#152863", font=title_font)
        cursor_y += max(48, width // 18)

    body_font = font(max(18, width // 45))
    line_height = int(body_font.size * 1.45) if hasattr(body_font, "size") else 28
    for line in wrapped_lines(draw, config["body"], body_font, box[2] - box[0] - padding * 2):
        draw.text((box[0] + padding, cursor_y), line, fill="#182b67", font=body_font)
        cursor_y += line_height
    image.save(image_path, format="PNG", optimize=True)


def image_page(image_path, width, height):
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(width, height))
    pdf.drawImage(ImageReader(str(image_path)), 0, 0, width=width, height=height)
    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return PdfReader(buffer).pages[0]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("output")
    parser.add_argument("--pdftoppm", default="pdftoppm")
    args = parser.parse_args()

    source = Path(args.source).resolve()
    output = Path(args.output).resolve()
    reader = PdfReader(str(source))
    if reader.is_encrypted:
        reader.decrypt("")

    with tempfile.TemporaryDirectory(prefix="genidev-business-plan-") as temp_dir:
        temp = Path(temp_dir)
        replacement_pages = {}
        for page_number, config in REDACTIONS.items():
            prefix = temp / f"page-{page_number}"
            subprocess.run(
                [args.pdftoppm, "-f", str(page_number), "-l", str(page_number), "-singlefile", "-png", "-r", "150", str(source), str(prefix)],
                check=True,
                stdout=subprocess.DEVNULL,
            )
            image_path = prefix.with_suffix(".png")
            redact_image(image_path, config)
            source_page = reader.pages[page_number - 1]
            replacement_pages[page_number] = image_page(
                image_path,
                float(source_page.mediabox.width),
                float(source_page.mediabox.height),
            )

        writer = PdfWriter()
        for page_number, page in enumerate(reader.pages, 1):
            writer.add_page(replacement_pages.get(page_number, page))
        if reader.metadata:
            writer.add_metadata({key: str(value) for key, value in reader.metadata.items() if value is not None})
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("wb") as stream:
            writer.write(stream)


if __name__ == "__main__":
    main()

<img src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=for-the-badge" alt="Gitmoji" /> <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/t/cuzimbisonratte/WuP?style=for-the-badge"> <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/cuzimbisonratte/wup?style=for-the-badge"> <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/cuzimbisonratte/WuP?style=for-the-badge">

# WuP Homepage

Dies ist ein selber geschriebener modularer statische-Webseiten-Generator. Er ist mit node.js geschrieben und benutzt als Eingabe hauptsächlich Markdown-Dateien. Die Ausgabe ist eine statische Webseite. (Mit ausnahme von Formularen und dem Admin-Panel)

# Usage

## Installation

```bash
npm install
```

Für die Entwicklung sollte `nodemon` global installiert werden:

```bash
npm install -g nodemon
```

## Development

```bash
nodemon -e * -i build index
```

Wenn irgendeine Datei verändert wird, startet der Statische-Seiten-Bauprozess neu.

Nun muss nur noch ein Web-Server im build-Ordner gestartet werden.

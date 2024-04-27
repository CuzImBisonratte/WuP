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

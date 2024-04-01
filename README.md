
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

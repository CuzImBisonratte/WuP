<?php

# Check if the user is logged in
session_start();
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

# List of all download settings
$DOWNLOADS = json_decode('{DOWNLOADS}', true);
# For each download read the whole /res/downloads/[DOWNLOADS.dir_location] folder and check all files and store their names in an array
foreach ($DOWNLOADS as $key => $value) {
    $dir = scandir($_SERVER['DOCUMENT_ROOT'] . '/res/downloads/' . $value['dir_location']);
    $files = array();
    foreach ($dir as $file) {
        if ($file != '.' && $file != '..') {
            array_push($files, $file);
        }
    }
    $DOWNLOADS[$key]['files'] = $files;
    # Natsort the files
    natsort($DOWNLOADS[$key]['files']);
    # Reverse file order
    $DOWNLOADS[$key]['files'] = array_reverse($DOWNLOADS[$key]['files']);
}
?>

<!DOCTYPE html>
<html lang="de">

<head>
    {head}
    <link rel="stylesheet" href="/res/style/article.css" />
</head>

<body>
    <noscript>
        <h1 style="text-align: center; color: red;">Das Admin-Panel funktioniert nur mit aktiviertem JavaScript</h1>
    </noscript>
    {topbar}
    <nav>
        <div class="container nav-container">
            <div class="logo">
                <a href="/" aria-label="Zur Startseite">
                    <img src="/res/images/Logo.jpg" alt="" srcset="" />
                    <img src="/res/images/LogoSquare.jpg" alt="" srcset="" id="alt_mini_logo" />
                </a>
            </div>
            <div class="navbuttons">
                <a href="/">
                    <div class="navbutton">Home</div>
                </a>
                <a href="logout.php">
                    <div class="navbutton">
                        [icon:lock]
                    </div>
                </a>
            </div>
        </div>
    </nav>
    <div id="nav-spacer"></div>
    <main>
        <div class="container">
            <h1>Downloads</h1>
            <div class="rl-divider">
                <div class="left">
                    <?php
                    foreach ($DOWNLOADS as $key => $value) {
                        echo '<h2>' . $value['title'] . '</h2>';
                        foreach ($value['files'] as $file) {
                            echo '<div class="file-list"><div class="file-list-text">';
                            echo str_replace('_', ' ', str_replace('-', '/', pathinfo($file, PATHINFO_FILENAME)));
                            echo '</div><div class="file-list-icons">';
                            echo '<button onclick="window.open(\'/res/downloads/' . $value['dir_location'] . '/' . $file . '\', \'_blank\', \'location=yes,height=570,width=520,scrollbars=yes,status=no\');">[icon:download]</button>';
                            echo '<button onclick="window.location.href=\'delete-file.php?category=' . $key . '&file=' . $file . '\';">[icon:trash]</button>';
                            echo '</div></div>';
                            if ($file != end($value['files'])) {
                                echo '<hr>';
                            }
                        }
                    }
                    ?>
                </div>
                <div class="right">
                    <form action="update-downloads.php" enctype="multipart/form-data" method="post">
                        <h2>Datei hinzufügen</h2>
                        <p>Bei Corona-Hilfen kein Monat und Jahr angeben!</p>
                        <p><strong>Dateinamen werden automatisch angepasst</strong>.</p>
                        <label for="category">Kategorie</label>
                        <select name="category" required>
                            <?php foreach ($DOWNLOADS as $key => $value) echo '<option value="' . $key . '">' . $value['title'] . '</option>'; ?>
                        </select>
                        <label for="month">Monat</label>
                        <input type="number" name="month" min="1" max="12" value="<?= date('m') ?>">
                        <label for="year">Jahr</label>
                        <input type="number" name="year" min="2000" max="2500" value="<?= date('Y') ?>">
                        <label for="file">Datei (ALS PDF!)</label>
                        <input type="file" name="file" accept=".pdf" required>
                        <input type="submit" value="Datei Hochladen + Webseite Aktualisieren">
                    </form>
                </div>
            </div>
        </div>
    </main>
    {subfooter}
    <style>
        .navbutton svg {
            width: 1.5rem;
            height: 1.5rem;
        }

        .navbutton:hover svg {
            color: var(--secondary-color);
        }

        .rl-divider {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr;
            gap: 3rem;
            grid-auto-flow: row;
            grid-template-areas: "left right";
            font-size: 15px;
            color: #555;
        }

        .left {
            grid-area: left;
        }

        .right {
            grid-area: right;
        }

        /* 
        Datei herunterladen
        */
        .file-list {

            display: grid;
            grid-template-columns: 1fr 5rem;
            grid-template-rows: 1fr;
            gap: 0px 0px;
            grid-template-areas:
                "text icons";
        }

        .file-list-text {
            grid-area: text;
        }

        .file-list-icons {
            grid-area: icons;
        }

        button {
            display: inline;
            margin-left: 0.5rem;
            background-color: transparent;
            border: 1px solid #555;
            border-radius: 4px;
        }

        svg {
            width: 1rem;
            height: 1rem;
            cursor: pointer;
        }


        /* 
        Datei hochladen
        */

        input,
        select {
            display: block;
            padding: 6px 12px;
            font-size: 14px;
            line-height: 1.428571429;
            color: #555555;
            background-color: #fff;
            background-image: none;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        label {
            margin-top: 1rem;
            display: block;
        }

        input[type="submit"] {
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
            background-color: var(--primary-color);
            color: #fff;
        }

        input[type="file"] {
            border: 1px solid #ccc;
            border-radius: 0.5rem;
            padding: 0.5rem;
        }
    </style>
</body>

</html>
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
}

// Check if there is a file upload
if (isset($_FILES['file'])) {
    $category = $DOWNLOADS[$_POST['category']]["dir_location"];
    // $category = $_POST['category'];
    $month = isset($_POST['month']) ? $_POST['month'] : null;
    $year = isset($_POST['year']) ? $_POST['year'] : null;
    $file = $_FILES['file'];

    switch ($category) {
        case 'coronahilfen':
            // Get the latest file in /res/downloads/coronahilfen/ number as in "Rundschreiben_Corona_Krise_1.pdf" -> 1
            $latest = 0;
            foreach (scandir($_SERVER['DOCUMENT_ROOT'] . '/res/downloads/coronahilfen') as $file) {
                if ($file != '.' && $file != '..') {
                    $number = intval(explode('_', $file)[3]);
                    if ($number > $latest) {
                        $latest = $number;
                    }
                }
            }
            $filename = 'Rundschreiben_Corona_Krise_' . ($latest + 1) . '.pdf';
            break;
        case 'mandanteninfo':
            $filename = 'Mandanteninfo_' . $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '.pdf';
            // Check if the file already exists
            if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/res/downloads/mandanteninfo/' . $filename)) die('File already exists');
            break;
    }

    $dir = $_SERVER['DOCUMENT_ROOT'] . '/res/downloads/' . $category;
    if (!file_exists($dir)) {
        mkdir($dir);
    }
    move_uploaded_file($_FILES['file']['tmp_name'], $dir . '/' . $filename);
    // Add the file to the download list
    array_push($DOWNLOADS[$_POST['category']]['files'], $filename);
}

// Rebuild the download list page
header('Location: rebuild-downloads.php');

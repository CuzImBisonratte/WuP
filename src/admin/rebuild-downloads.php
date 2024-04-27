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

// 
// Redo the download list page
// 
foreach ($DOWNLOADS as $key => $value) {
    $empty_downloads_page = file_get_contents('res/downloads.html');
    $empty_downloads_page = str_replace('?DOWNLOAD_TITLE?', $value['title'], $empty_downloads_page);
    $downloadlist = '';
    // Reverse the files array
    $value['files'] = array_reverse($value['files']);
    foreach ($value['files'] as $file) {
        $file_name = str_replace('_', ' ', str_replace('-', '/', pathinfo($file, PATHINFO_FILENAME)));
        $downloadlist .= '<div class="download-item">';
        $downloadlist .= '<a href="/res/downloads/' . $value['dir_location'] . '/' . $file . '" download="' . $file . '">';
        $downloadlist .= '<h2>' . $file_name . '</h2>';
        $downloadlist .= '<img src="/res/images/icons/download.svg" alt="Download" />';
        $downloadlist .= '</a></div>';
        if ($file != $value['files'][count($value['files']) - 1]) $downloadlist .= '<hr>';
    }
    $empty_downloads_page = str_replace('?DOWNLOAD_LIST?', $downloadlist, $empty_downloads_page);

    // Delete dir from (value[url]) - even with files in it
    unlink($_SERVER['DOCUMENT_ROOT'] . $value['url'] . '/index.html');
    rmdir($_SERVER['DOCUMENT_ROOT'] . $value['url']);
    // Create dir 
    mkdir($_SERVER['DOCUMENT_ROOT'] . $value['url']);
    // Write new index.html
    file_put_contents($_SERVER['DOCUMENT_ROOT'] . $value['url'] . '/index.html', $empty_downloads_page);
}

header('Location: ./');

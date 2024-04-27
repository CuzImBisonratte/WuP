<?php

# Check if the user is logged in
session_start();
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

# List of all download settings
$DOWNLOADS = json_decode('{DOWNLOADS}', true);

// Check if there is the file is a download file
$file = $_GET['file'];
$category = $DOWNLOADS[$_GET['category']]["dir_location"];
if (strpos($file, '..') !== false) {
    die('Invalid file');
}
if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/res/downloads/' . $category . '/' . $file)) {
    unlink($_SERVER['DOCUMENT_ROOT'] . '/res/downloads/' . $category . '/' . $file);
    header('Location: ./rebuild-downloads.php');
} else {
    die('File not found');
}

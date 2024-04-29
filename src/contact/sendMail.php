<?php

$sender = json_decode('{sender_data}', true);
$recipient = "{recipient}";

// Get PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require $_SERVER["DOCUMENT_ROOT"] . "/res/php/PHPMailer-master/src/Exception.php";
require $_SERVER["DOCUMENT_ROOT"] . "/res/php/PHPMailer-master/src/PHPMailer.php";
require $_SERVER["DOCUMENT_ROOT"] . "/res/php/PHPMailer-master/src/SMTP.php";

// 
// Create mail body
// 

// Sanitize input
$input = array();
foreach ($_POST as $key => $value) {
    $input[$key] = htmlspecialchars($value);
}

// array(13) { ["email"]=> string(13) "asdasd@sad.de" ["title"]=> string(2) "sd" ["message"]=> string(63) "sd <script> alert("MEEE"); </script> " ["anrede"]=> string(4) "Frau" ["nachname"]=> string(2) "sd" ["vorname"]=> string(0) "" ["firma"]=> string(0) "" ["strasse"]=> string(0) "" ["ort"]=> string(0) "" ["plz"]=> string(0) "" ["telefon"]=> string(0) "" ["mobile"]=> string(0) "" ["datenschutz"]=> string(2) "on" } 

$mailbody = "<h1>Neue Nachricht aus dem Kontaktformular</h1>";
$mailbody_alt = "Neue Nachricht aus dem Kontaktformular\n";
$mailbody .= "<ul>";
$mailbody .= "<li>E-Mail: " . $input["email"] . "</li>";
$mailbody_alt .= " ⋅ E-Mail: " . $input["email"] . "\n";
$mailbody .= "<li>Titel: " . $input["title"] . "</li>";
$mailbody_alt .= " ⋅ Titel: " . $input["title"] . "\n";
$mailbody .= "<li>Anrede: " . $input["anrede"] . "</li>";
$mailbody_alt .= " ⋅ Anrede: " . $input["anrede"] . "\n";
$mailbody .= "<li>Nachname: " . $input["nachname"] . "</li>";
$mailbody_alt .= " ⋅ Nachname: " . $input["nachname"] . "\n";
$mailbody .= "<li>Vorname: " . $input["vorname"] . "</li>";
$mailbody_alt .= " ⋅ Vorname: " . $input["vorname"] . "\n";
$mailbody .= "<li>Firma: " . $input["firma"] . "</li>";
$mailbody_alt .= " ⋅ Firma: " . $input["firma"] . "\n";
$mailbody .= "<li>Straße: " . $input["strasse"] . "</li>";
$mailbody_alt .= " ⋅ Straße: " . $input["strasse"] . "\n";
$mailbody .= "<li>Ort: " . $input["ort"] . "</li>";
$mailbody_alt .= " ⋅ Ort: " . $input["ort"] . "\n";
$mailbody .= "<li>PLZ: " . $input["plz"] . "</li>";
$mailbody_alt .= " ⋅ PLZ: " . $input["plz"] . "\n";
$mailbody .= "<li>Telefon: " . $input["telefon"] . "</li>";
$mailbody_alt .= " ⋅ Telefon: " . $input["telefon"] . "\n";
$mailbody .= "<li>Mobile: " . $input["mobile"] . "</li>";
$mailbody_alt .= " ⋅ Mobile: " . $input["mobile"] . "\n";
$mailbody .= "</ul>";
$mailbody_alt .= "\n\n";

$mailbody .= "<h2>Interessen</h2>";
$mailbody_alt .= "Interessen\n\n";
if (isset($input['interesse_wp']) && $input['interesse_wp'] == "on") {
    $mailbody .= "<p>Wirtschaftsprüfung</p>";
    $mailbody_alt .= "Wirtschaftsprüfung\n";
}
if (isset($input['interesse_sb']) && $input['interesse_sb'] == "on") {
    $mailbody .= "<p>Steuerberatung</p>";
    $mailbody_alt .= "Steuerberatung\n";
}
if (isset($input['interesse_rb']) && $input['interesse_rb'] == "on") {
    $mailbody .= "<p>Rechtsberatung</p>";
    $mailbody_alt .= "Rechtsberatung\n";
}
if (isset($input['interesse_bwl']) && $input['interesse_bwl'] == "on") {
    $mailbody .= "<p>Betriebswirtschaftliche Beratung</p>";
    $mailbody_alt .= "Betriebswirtschaftliche Beratung\n";
}
$mailbody_alt .= "\n\n";

$mailbody .= "<h2>Nachricht</h2>";
$mailbody_alt .= "Nachricht\n\n";
$mailbody .= "<p style='background-color:#ccc;padding: 1rem;width: fit-content;filter: drop-shadow(5px 5px 4px #aaa);'>" . $input["message"] . "</p>";
$mailbody_alt .= $input["message"] . "\n";

// Create an instance of PHPMailer
$mail = new PHPMailer();


try {
    // Server settings
    $mail->isSMTP();                                                //Send using SMTP
    $mail->Host       = $sender["credentials"]["host"];             //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                       //Enable SMTP authentication
    $mail->Username   = $sender["credentials"]["username"];         //SMTP username
    $mail->Password   = $sender["credentials"]["password"];         //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;                //Enable implicit TLS encryption
    $mail->Port       = $sender["credentials"]["port"];             //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    // Recipients
    $mail->setFrom($sender["credentials"]["mail"], $sender["name"]);
    $mail->addAddress($recipient);                                  //Add a recipient

    // Content
    $mail->isHTML(true);                                            //Set email format to HTML
    $mail->Subject = 'Kontaktformular';
    $mail->CharSet = 'UTF-8';

    $mail->Body       = $mailbody;
    $mail->AltBody    = $mailbody_alt;

    // Disable debugging
    $mail->SMTPDebug = false;

    // Send mail
    $mail->send();

    // Mail sent 
    header("Location: {success_url}");
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}

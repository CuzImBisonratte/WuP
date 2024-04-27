<?php

# Check if the user is logged in
session_start();
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: login.php');
    exit;
}

?>

<!DOCTYPE html>
<html lang="de">

<head>
    {head}
    <link rel="stylesheet" href="/res/style/article.css" />
</head>

<body>
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
    </style>
</body>

</html>
<?php

$password = '{ADMIN_PASSWORD}';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['password']) && password_verify($_POST['password'], $password)) {
        session_set_cookie_params(300, '/', '', false, true);
        session_start();
        $_SESSION['logged_in'] = true;
        header('Location: index.php');
        exit;
    } else {
        echo '<h1 style="text-align: center; color: red;">Falsches Passwort</h1>';
    }
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
    <main>
        <div class="container" id="login-container">
            <h1>Admin-Login</h1>
            <form action="login.php" method="post">
                <input type="password" name="password" placeholder="Passwort" />
                <input type="submit" value="Login" />
            </form>
        </div>
    </main>
    {subfooter}
    <style>
        #login-container {
            max-width: 400px;
            margin: auto;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        input {
            padding: 0.5rem;
            font-size: 1rem;
            border: 1px solid #ccc;
            border-radius: 0.25rem;
        }

        input[type="submit"] {
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 0.25rem;
            padding: 0.5rem;
            cursor: pointer;
        }

        input[type="submit"]:hover {
            background-color: #0056b3;
        }
    </style>
</body>

</html>
<?php
session_start();

// GitHub OAuth Configuration
$client_id = 'Ov23li6lk70P27Fvrcyv';
$client_secret = 'd8c1c019bc1262a07f9fd949aad9660e03feafdd';
$allowed_users = ['iriecoffelt'];

// Handle GitHub OAuth callback
if (isset($_GET['code'])) {
    $code = $_GET['code'];
    $state = $_GET['state'] ?? '';
    
    // Exchange code for access token
    $token_url = "https://github.com/login/oauth/access_token";
    $data = [
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'code' => $code,
        'redirect_uri' => 'https://iriedevelopment.com/github_callback.php'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $token_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'User-Agent: Irie-Development-Newsletter'
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        $token_data = json_decode($response, true);
        
        if (isset($token_data['access_token'])) {
            $access_token = $token_data['access_token'];
            
            // Get user information
            $user_url = "https://api.github.com/user";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $user_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: token ' . $access_token,
                'Accept: application/vnd.github.v3+json',
                'User-Agent: Irie-Development-Newsletter'
            ]);
            
            $user_response = curl_exec($ch);
            $user_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($user_http_code === 200) {
                $user_data = json_decode($user_response, true);
                $username = $user_data['login'];
                
                // Check if user is authorized
                if (in_array($username, $allowed_users)) {
                    $_SESSION['github_authenticated'] = true;
                    $_SESSION['github_username'] = $username;
                    $_SESSION['github_token'] = $access_token;
                    
                    // Redirect to newsletter page
                    header('Location: send_newsletter.html?auth=success');
                    exit;
                } else {
                    $_SESSION['auth_error'] = 'Access denied. Only authorized users can access this page.';
                    header('Location: send_newsletter.html?auth=denied');
                    exit;
                }
            } else {
                $_SESSION['auth_error'] = 'Failed to get user information from GitHub.';
                header('Location: send_newsletter.html?auth=error');
                exit;
            }
        } else {
            $_SESSION['auth_error'] = 'Failed to get access token from GitHub.';
            header('Location: send_newsletter.html?auth=error');
            exit;
        }
    } else {
        $_SESSION['auth_error'] = 'GitHub OAuth request failed.';
        header('Location: send_newsletter.html?auth=error');
        exit;
    }
} else {
    // No code provided, redirect to login
    header('Location: send_newsletter.html');
    exit;
}
?> 
<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$phone   = trim($_POST['phone']   ?? '');
$company = trim($_POST['company'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!$name || !$email || !$message || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'error' => 'Neplatné údaje']);
    exit;
}

$to      = 'hello@arteo.sk';
$subject = 'Nová správa z arteo.sk — ' . mb_substr($name, 0, 60);

$body  = "Meno: $name\n";
$body .= "Email: $email\n";
if ($phone)   $body .= "Telefón: $phone\n";
if ($company) $body .= "Firma: $company\n";
$body .= "\nSpráva:\n$message\n";

$headers  = "From: Arteo Web <no-reply@arteo.sk>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

echo json_encode(['ok' => (bool)$sent]);

<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$lockout = isset($data['lockout']) ? (int)$data['lockout'] : 0;

// Simpan status lockout ke database
mysqli_query($koneksi, "UPDATE kontrol SET lockout = $lockout WHERE id = 1");

// Kirim respon
echo json_encode(["status" => "ok", "lockout" => $lockout]);
?>

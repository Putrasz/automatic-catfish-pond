<?php
require "db.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  $status = isset($data['relay_status']) ? intval($data['relay_status']) : 0;

  $query = "UPDATE kontrol SET tmisi = $status WHERE id = 1";

  if ($koneksi->query($query)) {
    // Ambil nilai terbaru dari DB setelah update
    $result = $koneksi->query("SELECT tmisi FROM kontrol WHERE id = 1");
    $row = $result->fetch_assoc();
    echo json_encode(["status" => "success", "relay_status" => intval($row['tmisi'])]);
  } else {
    echo json_encode(["status" => "error", "message" => $koneksi->error]);
  }
} else {
  // ESP akan akses GET untuk membaca status relay
  $result = $koneksi->query("SELECT relay_status FROM kontrol WHERE id = 1");
  $row = $result->fetch_assoc();
  echo json_encode(["relay_status" => intval($row['relay_status'])]);
}
?>

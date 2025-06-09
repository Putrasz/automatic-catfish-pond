<?php
require "db.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  $response = ["status" => "error", "message" => "Invalid input"];

  // Handle pengisian (tmisi)
  if (isset($data['relay_status'])) {
    $tmisi = intval($data['relay_status']);
    $query = "UPDATE kontrol SET tmisi = $tmisi WHERE id = 1";

    if ($koneksi->query($query)) {
      $result = $koneksi->query("SELECT tmisi FROM kontrol WHERE id = 1");
      $row = $result->fetch_assoc();
      $response = ["status" => "success", "relay_status" => intval($row['tmisi'])];
    } else {
      $response = ["status" => "error", "message" => $koneksi->error];
    }
  }

  // Handle pengurasan (tmkuras)
  if (isset($data['tmkuras'])) {
    $tmkuras = intval($data['tmkuras']);
    $query = "UPDATE kontrol SET tmkuras = $tmkuras WHERE id = 1";

    if ($koneksi->query($query)) {
      $result = $koneksi->query("SELECT tmkuras FROM kontrol WHERE id = 1");
      $row = $result->fetch_assoc();
      $response = ["status" => "success", "relay_status" => intval($row['tmkuras'])];
    } else {
      $response = ["status" => "error", "message" => $koneksi->error];
    }
  }

  // Handle penguras isi (tmkurasis)
  if (isset($data['tmkurasis'])) {
    $tmkurasis = intval($data['tmkurasis']);
    $query = "UPDATE kontrol SET tmkurasis = $tmkurasis WHERE id = 1";

    if ($koneksi->query($query)) {
      $result = $koneksi->query("SELECT tmkurasis FROM kontrol WHERE id = 1");
      $row = $result->fetch_assoc();
      $response = ["status" => "success", "relay_status" => intval($row['tmkurasis'])];
    } else {
      $response = ["status" => "error", "message" => $koneksi->error];
    }
  }

  echo json_encode($response);

} else {
  // GET request → kirim status terkini
  $result = $koneksi->query("SELECT tmisi, tmkuras, tmkurasis FROM kontrol WHERE id = 1");
  if ($result && $row = $result->fetch_assoc()) {
    echo json_encode([
      "tmisi" => intval($row['tmisi']),
      "tmkuras" => intval($row['tmkuras']),
      "tmkurasis" => intval($row['tmkurasis'])
    ]);
  } else {
    echo json_encode(["status" => "error", "message" => "Data tidak ditemukan"]);
  }
}
?>

<?php
require "db.php";
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ambil data JSON dari ESP atau Web
    $data = json_decode(file_get_contents('php://input'), true);

    // Ambil nilai jika tersedia
    $relay_status = isset($data['relay_status']) ? intval($data['relay_status']) : null;
    $tmisi = isset($data['tmisi']) ? intval($data['tmisi']) : null;
    $tmkuras = isset($data['tmkuras']) ? intval($data['tmkuras']) : null;
    $tmkurasis = isset($data['tmkurasis']) ? intval($data['tmkurasis']) : null;
    $lockout = isset($data['lockout']) ? intval($data['lockout']) : null;

    $response = [];

    // Update relay_status jika dikirim
    if ($relay_status !== null) {
        $queryRelay = "UPDATE kontrol SET relay_status = $relay_status WHERE id = 1";
        if ($koneksi->query($queryRelay)) {
            $response['relay_status'] = $relay_status;
        } else {
            $response['error'] = "❌ Gagal update relay_status: " . $koneksi->error;
        }
    }

    // Update tmisi jika dikirim
    if ($tmisi !== null) {
        $queryTmisi = "UPDATE kontrol SET tmisi = $tmisi WHERE id = 1";
        if ($koneksi->query($queryTmisi)) {
            $response['tmisi'] = $tmisi;
        } else {
            $response['error'] = "❌ Gagal update tmisi: " . $koneksi->error;
        }
    }

        // Update tmisi jika dikirim
    if ($tmkuras !== null) {
        $querytmkuras = "UPDATE kontrol SET tmkuras = $tmkuras WHERE id = 1";
        if ($koneksi->query($querytmkuras)) {
            $response['tmkuras'] = $tmkuras;
        } else {
            $response['error'] = "❌ Gagal update tmisi: " . $koneksi->error;
        }
    }
        // Update tmisi jika dikirim
    if ($tmkurasis !== null) {
        $querytmkurasis = "UPDATE kontrol SET tmkurasis = $tmkurasis WHERE id = 1";
        if ($koneksi->query($querytmkurasis)) {
            $response['tmkurasis'] = $tmkurasis;
        } else {
            $response['error'] = "❌ Gagal update tmisi: " . $koneksi->error;
        }
    }
        // Update tmisi jika dikirim
    if ($lockout !== null) {
        $querylockout = "UPDATE kontrol SET lockout = $lockout WHERE id = 1";
        if ($koneksi->query($querylockout)) {
            $response['lockout'] = $lockout;
        } else {
            $response['error'] = "❌ Gagal update tmisi: " . $koneksi->error;
        }
    }
    // Respon
    if (!isset($response['error'])) {
        $response['status'] = "success";
        $response['message'] = "✅ Data berhasil diperbarui";
    } else {
        $response['status'] = "error";
    }

    echo json_encode($response);
} else {
    // Method GET – untuk diakses oleh ESP
    $result = $koneksi->query("SELECT relay_status, tmisi, tmkuras, tmkurasis, lockout FROM kontrol WHERE id = 1");

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            "relay_status" => intval($row['relay_status']),
            "tmisi" => intval($row['tmisi']),
            "tmkuras" => intval($row['tmkuras']),
            "tmkurasis" => intval($row['tmkurasis']),
            "lockout" => intval($row['lockout']),
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "❌ Data tidak ditemukan"
        ]);
    }
}



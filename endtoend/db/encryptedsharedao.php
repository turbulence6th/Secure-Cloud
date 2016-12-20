<?php
namespace OCA\EndToEnd\Db;

use OCP\IDBConnection;

class EncryptedShareDao {

    private $db;

    public function __construct(IDBConnection $db) {
        $this->db = $db;
    }

    public function find($file_id) {
        $sql = "SELECT * FROM oc_encrypted_share WHERE file_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
        $stmt->execute();

		$rows = array();
        while($row = $stmt->fetch()) {
        	array_push($rows, $row);
        }

        $stmt->closeCursor();
        return $rows;
    }
	
	public function find_by_user($file_id, $user_id) {
        $sql = "SELECT * FROM oc_encrypted_share WHERE file_id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $user_id);
        $stmt->execute();

		$row = $stmt->fetch();
		$stmt->closeCursor();
        return $row;
    }
	
	public function add($file_id, $user_id, $session_key) {
		$sql = "INSERT INTO oc_encrypted_share (file_id, user_id, session_key) VALUES (?, ?, ?);";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $user_id);
		$stmt->bindParam(3, $session_key);
        $stmt->execute();
        $stmt->closeCursor();
	}
	
	public function add_with_change_share($file_id, $user_id, $session_key, $change_share) {
		$sql = "INSERT INTO oc_encrypted_share (file_id, user_id, session_key, change_share) VALUES (?, ?, ?, ?);";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $user_id);
		$stmt->bindParam(3, $session_key);
		$stmt->bindParam(4, $change_share);
        $stmt->execute();
        $stmt->closeCursor();
	}
	
	public function update($file_id, $user_id, $session_key) {
		$sql = "UPDATE oc_encrypted_share SET session_key = ? WHERE file_id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $session_key);
		$stmt->bindParam(2, $file_id);
		$stmt->bindParam(3, $user_id);
        $stmt->execute();
		$stmt->closeCursor();
	}
	
	public function delete($file_id) {
		$sql = "DELETE FROM oc_encrypted_share WHERE file_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
        $stmt->execute();
		$stmt->closeCursor();
	}
	
	public function delete_by_user($file_id, $user_id) {
		$sql = "DELETE FROM oc_encrypted_share WHERE file_id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $user_id);
        $stmt->execute();
		$stmt->closeCursor();
	}

}
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
	
	public function find_by_model($file_id, $model_id, $type) {
        $sql = "SELECT * FROM oc_encrypted_share WHERE file_id = ? AND model_id = ? AND type = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $model_id);
		$stmt->bindParam(3, $type);
        $stmt->execute();

		$row = $stmt->fetch();
		$stmt->closeCursor();
        return $row;
    }
	
	public function add($file_id, $model_id, $session_key, $type) {
		$sql = "INSERT INTO oc_encrypted_share (file_id, model_id, session_key, type) VALUES (?, ?, ?, ?);";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $model_id);
		$stmt->bindParam(3, $session_key);
		$stmt->bindParam(4, $type);
        $stmt->execute();
        $stmt->closeCursor();
	}
	
	public function add_with_change_share($file_id, $model_id, $session_key, $change_share ,$type) {
		$sql = "INSERT INTO oc_encrypted_share (file_id, model_id, session_key, change_share, type) VALUES (?, ?, ?, ?, ?);";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $model_id);
		$stmt->bindParam(3, $session_key);
		$stmt->bindParam(4, $change_share);
		$stmt->bindParam(5, $type);
        $stmt->execute();
        $stmt->closeCursor();
	}
	
	public function update($file_id, $model_id, $session_key, $type) {
		$sql = "UPDATE oc_encrypted_share SET session_key = ? WHERE file_id = ? AND model_id = ? AND type = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $session_key);
		$stmt->bindParam(2, $file_id);
		$stmt->bindParam(3, $model_id);
		$stmt->bindParam(4, $type);
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
	
	public function delete_by_model($file_id, $model_id, $type) {
		$sql = "DELETE FROM oc_encrypted_share WHERE file_id = ? AND model_id = ? AND type = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $file_id);
		$stmt->bindParam(2, $model_id);
		$stmt->bindParam(3, $type);
        $stmt->execute();
		$stmt->closeCursor();
	}

}
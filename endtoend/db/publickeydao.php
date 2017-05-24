<?php
namespace OCA\EndToEnd\Db;

use OCP\IDBConnection;

class PublicKeyDao {

    private $db;

    public function __construct(IDBConnection $db) {
        $this->db = $db;
    }
	
	public function get_all_usernames() {
		$sql = "SELECT user_id FROM oc_publickey";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();

		$rows = array();
        while($row = $stmt->fetch()) {
        	array_push($rows, $row);
        }
		$stmt->closeCursor();
        return $rows;
	}

    public function find($user_id) {
        $sql = "SELECT * FROM oc_publickey WHERE user_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();

		$row = $stmt->fetch();
		$stmt->closeCursor();
        return $row;
    }
	
	public function update($user_id, $public_key) {
		$sql = "UPDATE oc_publickey SET public_key = ? WHERE user_id = ?";
		$stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $public_key);
		$stmt->bindParam(2, $user_id);
        $stmt->execute();
		$stmt->closeCursor();
	}
	
	public function add($user_id, $public_key) {
		$sql = "INSERT INTO oc_publickey (user_id, public_key) VALUES (?, ?);";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $user_id);
		$stmt->bindParam(2, $public_key);
        $stmt->execute();
		$stmt->closeCursor();
	}

}
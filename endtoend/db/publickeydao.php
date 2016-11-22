<?php
namespace OCA\EndToEnd\Db;

use OCP\IDBConnection;

class PublicKeyDao {

    private $db;

    public function __construct(IDBConnection $db) {
        $this->db = $db;
    }

    public function find($user_id) {
        $sql = "SELECT * FROM oc_publickey WHERE user_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();

		$rows = array();
        while($row = $stmt->fetch()) {
        	array_push($rows, $row);
        }

        $stmt->closeCursor();
        return $rows;
    }
	
	public function add($user_id, $key) {
		$sql = "INSERT INTO oc_publickey (user_id, key) VALUES (?, ?);";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $user_id);
		$stmt->bindParam(2, $key);
        $stmt->execute();
	}

}
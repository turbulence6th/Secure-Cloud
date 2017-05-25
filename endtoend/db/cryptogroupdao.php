<?php
namespace OCA\EndToEnd\Db;

use OCP\IDBConnection;

class CryptoGroupDao {

    private $db;

    public function __construct(IDBConnection $db) {
        $this->db = $db;
    }
	
	public function get_all_groups($user_id) {
		$sql = "SELECT group_id FROM oc_crypto_group WHERE user_id = ?";
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

    public function find($group_id, $user_id) {
        $sql = "SELECT * FROM oc_crypto_group WHERE group_id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $group_id);
		$stmt->bindParam(2, $user_id);
        $stmt->execute();

		$row = $stmt->fetch();
		$stmt->closeCursor();
        return $row;
    }
	
	public function update($user_id, $public_key) {
		$sql = "UPDATE oc_crypto_group SET public_key = ? WHERE user_id = ?";
		$stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $public_key);
		$stmt->bindParam(2, $user_id);
        $stmt->execute();
		$stmt->closeCursor();
	}
	
	public function add($group_id, $user_id, $group_secret, $iv) {
		$sql = "INSERT INTO oc_crypto_group (group_id, user_id, group_secret, iv) VALUES (?, ?, ?, ?);";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $group_id);
		$stmt->bindParam(2, $user_id);
		$stmt->bindParam(3, $group_secret);
		$stmt->bindParam(4, $iv);
        $stmt->execute();
		$stmt->closeCursor();
	}
	
	public function delete($group_id, $user_id) {
		$sql = "DELETE FROM oc_crypto_group WHERE group_id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $group_id);
		$stmt->bindParam(2, $user_id);
        $stmt->execute();
		$stmt->closeCursor();
	}

}
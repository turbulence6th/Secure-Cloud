<?php
// db/authordao.php

namespace OCA\EndToEnd\Db;

use \OCP\IDb;

class AuthorDAO {

    private $db;

    public function __construct(IDb $db) {
        $this->db = $db;
    }

    public function find($id) {
        $sql = 'SELECT * FROM `*PREFIX*myapp_authors` ' .
            'WHERE `id` = ?';
        $query = $db->prepareQuery($sql);
        $query->bindParam(1, $id, \PDO::PARAM_INT);
        $result = $query->execute();

        while($row = $result->fetchRow()) {
            return $row;
        }
    }

}
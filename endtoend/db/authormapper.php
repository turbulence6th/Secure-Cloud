<?php
// db/authormapper.php

namespace OCA\EndToEnd\Db;

use \OCP\IDb;
use \OCP\AppFramework\Db\Mapper;

class AuthorMapper extends Mapper {

    public function __construct(IDb $db) {
        parent::__construct($db, 'myapp_authors');
    }


    /**
     * @throws \OCP\AppFramework\Db\DoesNotExistException if not found
     * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException if more than one result
     */
    public function find($id) {
        $sql = 'SELECT * FROM `*PREFIX*myapp_authors` ' .
            'WHERE `id` = ?';
        return $this->findEntity($sql, array($id));
    }


    public function findAll($limit=null, $offset=null) {
        $sql = 'SELECT * FROM `*PREFIX*myapp_authors`';
        return $this->findEntities($sql, $limit, $offset);
    }


    public function authorNameCount($name) {
        $sql = 'SELECT COUNT(*) AS `count` FROM `*PREFIX*myapp_authors` ' .
            'WHERE `name` = ?';
        $query = $this->db->prepareQuery($sql);
        $query->bindParam(1, $name, \PDO::PARAM_STR);
        $result = $query->execute();

        while($row = $result->fetchRow()) {
            return $row['count'];
        }
    }

}
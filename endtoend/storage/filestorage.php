<?php
namespace OCA\EndToEnd\Storage;

class FileStorage {

    private $storage;

    public function __construct($storage){
        $this->storage = $storage;
    }
	
	public function writeFile($fileName, $content) {
        try {
            $file = $this->storage->get($fileName);
        } catch(\OCP\Files\NotFoundException $e) {
            $this->storage->newFile($fileName);
            $file = $this->storage->get($fileName);
        }

        $file->putContent($content);
	}
}
<?php

$file = fopen(dirname(__FILE__).'/skills.json', 'w');

if ($file !== false) {
  fwrite($file, $_POST['skills']);
  fclose($file);
}

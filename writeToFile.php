<?php
  $fileName = $_POST['file'];
  $a = fopen("JSONdata/$fileName.json", "w");
  fwrite($a, $_POST['code']);
  fclose($a);
  echo "Saving data to the file";
?>
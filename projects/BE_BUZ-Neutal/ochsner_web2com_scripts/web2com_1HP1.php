<?php

$host = "192.168.11.167";
$user = "USER";
$pass = "123";
$errors = "";
  

get_oidvalues($host, $user, $pass);

function get_oidvalues($host, $user, $pass)
{
    $oids = explode(";", str_replace(",", ";", "1/2/1/125/0;1/2/1/125/1;1/2/1/125/3;1/2/1/125/4;1/2/1/125/5;1/2/1/125/8;1/2/1/125/9"));
	
    $url = "http://$host/ws";
	
    $jsonresponse = "{";

    $ch = curl_init();
    $curlverbose = fopen('php://temp', 'w+');
	
    foreach ($oids as $oid) {
		    $xml_post_string  = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
			$xml_post_string .= "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:ns=\"http://ws01.lom.ch/soap/\">";
			$xml_post_string .= "<SOAP-ENV:Body><ns:getDpRequest><ref><oid>$oid</oid><prop/></ref><startIndex>0</startIndex><count>-1</count></ns:getDpRequest></SOAP-ENV:Body></SOAP-ENV:Envelope>";
			
			$headers = array(
                        "Content-Type: text/xml; charset=utf-8",
                        "Accept: text/xml",
                        "Cache-Control: no-cache",
                        "Pragma: no-cache",
                        "SOAPAction: http://ws01.lom.ch/soap/listDP", 
                        "Content-length: " . strlen($xml_post_string)
                    ); 

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HEADER, false);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_USERPWD, $user.":".$pass); 
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $xml_post_string);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_VERBOSE, true);
            curl_setopt($ch, CURLOPT_STDERR, $curlverbose);
            $response = curl_exec($ch);
			
			if ($response === FALSE) {
				printf("cUrl error (#%d): %s<br>\n", curl_errno($ch),
				htmlspecialchars(curl_error($ch)));
				rewind($verbose);
				$verboseLog = stream_get_contents($verbose);
				echo "Verbose information:\n<pre>", htmlspecialchars($verboseLog), "</pre>\n";
			}

		$object = str_replace("/", "", $oid);
		$value = get_string_between($response, "<value>", "</value>"); 
        $jsonresponse .= "\"$object\":$value,";
    }

    curl_close($ch);
	echo rtrim($jsonresponse, ",") . "}";
} 

function get_string_between($mystring, $start, $end)
{
    $string = " ".$mystring;
    $ini = strpos($mystring,$start);
    if ($ini == 0) return "";
    $ini += strlen($start);
    $len = strpos($mystring,$end,$ini) - $ini;
    return substr($mystring,$ini,$len);
}

?>
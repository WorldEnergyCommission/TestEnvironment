package com.efficientio.keycloakQREndpoints;

public class OTPSecretAndQRDto {
	public String Secret;
	public String QR;
	
	public OTPSecretAndQRDto(String secret, String qr){
		this.Secret = secret;
		this.QR = qr;
	}
}

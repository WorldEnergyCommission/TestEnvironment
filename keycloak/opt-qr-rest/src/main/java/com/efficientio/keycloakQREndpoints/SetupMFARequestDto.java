package com.efficientio.keycloakQREndpoints;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class SetupMFARequestDto {
	@XmlElement public String Secret;
	@XmlElement public String InitialCode;
	@XmlElement public String DeviceName;
	
	public SetupMFARequestDto(){
	}

	public SetupMFARequestDto(String secret, String initialCode, String deviceName){
		this.Secret = secret;
		this.InitialCode = initialCode;
		this.DeviceName = deviceName;
	}

	public String getSecret() {
		return this.Secret;
	}

	public void setSecret(String secret){
		this.Secret = secret;
	}

	public String getDeviceName() {
		return this.DeviceName;
	}

	public void setDeviceName(String deviceName){
		this.DeviceName = deviceName;
	}

	public String getInitialCode() {
		return this.InitialCode;
	}
	

	public void setInitialCode(String initialCode){
		this.InitialCode = initialCode;
	}

	 @Override
	  public String toString() {
	    return "SetupMFARequestDto{Secret: "+ this.Secret + "InitialCode" + this.InitialCode;
	  }
}

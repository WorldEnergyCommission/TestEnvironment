package com.efficientio.keycloakQREndpoints;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.credential.OTPCredentialModel;
import org.keycloak.models.utils.HmacOTP;
import org.keycloak.services.managers.AppAuthManager;
import org.keycloak.services.managers.AuthenticationManager.AuthResult;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.utils.CredentialHelper;
import org.keycloak.utils.TotpUtils;
import org.jboss.logging.Logger;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

public class QRProvider implements RealmResourceProvider {
	protected KeycloakSession session;
    private static final Logger log = Logger.getLogger(QRProvider.class);

	public QRProvider(KeycloakSession session) {
        this.session = session;
	}

	
	@Override
	public void close() {	
	}

	@Override
	public Object getResource() {
		return this;
	}
	

	
	@GET
	@Path("/mfa/qr")
	@Produces({MediaType.APPLICATION_JSON})
	public OTPSecretAndQRDto get2FASetup() {
		AuthResult auth = checkAuth();
	    final RealmModel realm = this.session.getContext().getRealm();
	    final UserModel user = this.session.users().getUserById(realm,  auth.getUser().getId());
	    final String totpSecret = HmacOTP.generateSecret(20);
	    final String totpSecretQrCode = TotpUtils.qrCode(totpSecret, realm, user);
	    return new OTPSecretAndQRDto(totpSecret, totpSecretQrCode);
	}

	@POST
	@Path("/mfa")
	@Consumes({MediaType.APPLICATION_JSON})
	public void setup2FA(SetupMFARequestDto dto) {
		AuthResult auth = checkAuth();
	    final RealmModel realm = this.session.getContext().getRealm();
	    final UserModel user = auth.getUser();
	    Object[] creds =  user.credentialManager().getStoredCredentialsByTypeStream("otp").toArray();
	    
	    if (creds.length > 0) {
	    	throw new BadRequestException();
	    }
	    
	    final OTPCredentialModel otpCredentialModel = OTPCredentialModel.createFromPolicy(realm, dto.getSecret(), dto.getDeviceName());
	    boolean success = CredentialHelper.createOTPCredential(this.session, realm, user, dto.getInitialCode(), otpCredentialModel);

		if (success == false){
			log.errorf("Unsuccessful setup2FA request for User with Id: %s ; Request-Model: ", user.getId(),dto);
			throw new InternalServerErrorException();
		}
	}
	
	private AuthResult checkAuth() {
		final AuthResult auth = new AppAuthManager.BearerTokenAuthenticator(session).authenticate();

		if (auth == null) {
			log.errorf("Unauthorized Request for MFA: %s", session);
			
			throw new NotAuthorizedException("bearer");
		}
		
		return auth;
	}

}

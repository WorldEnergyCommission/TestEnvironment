package com.efficientio.keycloakQREndpoints;
import org.keycloak.Config.Scope;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.services.resource.RealmResourceProviderFactory;

public class QRProviderFactory implements RealmResourceProviderFactory {
	public static final String PROVIDER_ID = "qr-rest-provider";


	@Override
	public RealmResourceProvider create(KeycloakSession session) {
		return new QRProvider(session);

	}

	@Override
	public void init(Scope config) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void postInit(KeycloakSessionFactory factory) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void close() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getId() {
		return PROVIDER_ID;
	}

}

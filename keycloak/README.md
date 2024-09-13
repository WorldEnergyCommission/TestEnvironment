# Keycloak

Keycloak is only used for authentication in Lynus so that sign-up, login, jwt tokens, etc. didn't have to be implemented
by myself. More information on how to use Keycloak can be found
at [https://www.keycloak.org/](https://www.keycloak.org/)

## Setting up Keycloak for a new realm

1. Access Keycloak through `accounts.<domain>` admin realm
1. Create a new realm, e.g. `lynus` and select it
1. Set the theme under `Realm Settings` > `Themes` > `Login Theme + Account Theme`
1. Enable User registration (`Realm Settings` > `Login`) and set `Email as username` to `ON`. After
   that, `User registration` can be disabled again. Make sure to click on `Save`.
1. Create three clients under `Clients`:
   1. `console`: Set `Valid Redirect URIs` to `https://<whitelabel-console-domain>/*`,
      Set [Web Origins](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
      to `https://<whitelabel-console-domain>`. This will be the client through which the user accesses the
      whitelabel-console
   1. `app`: Set `Valid Redirect URIs` to `http://localhost:4000/*` and `Web Origins` to `http://localhost:4000`. This
      client is only used for the App
   1. `openapi`: Set `Valid Redirect URIs` to `https://api.<lynus-domain>/v1/swagger/` and `Web Origins`
      to `https://api.<lynus-domain>`. This client will only be used for swagger/openapi

## Creating users manually

When creating a user manually, make sure to

- set email as "verified", otherwise he has to confirm his email address
- set a temporary password
- set attributes (below)

| Name              | Description                                                      | Required |
| ----------------- | ---------------------------------------------------------------- | -------- |
| address.country   | country code (`at, de, ch, it`)                                  | yes      |
| address.city      | city name                                                        | yes      |
| address.street    | street name                                                      | yes      |
| address.zipCode   | city zipCode                                                     | yes      |
| organization.id   | organization identification                                      | no       |
| organization.name | organization name                                                | no       |
| mobile            | mobile phone                                                     | yes      |
| limit.project     | project limit for user in which he can be in (number) default 10 | no       |

Please note that these are all strings, so they can also be empty, but the ones that are required **must** exist

## Environment

### Ports

| NAME | Description   |
| ---- | ------------- |
| 8080 | HTTP endpoint |

## Building

`docker build -t <tag> .`

## Creating whitelabel

This guide shows you how to create a whitelabel

### Prerequisites

1. [Install Docker](https://docs.docker.com/engine/install/)
1. Clone this repository onto your computer.

### Run keycloak in a docker container locally

1. Run the docker container using the default `lynus` theme:

```bash
docker run -p 8080:8080 -v <PATH_TO_KEYCLOAK_REPOSITORY>/themes/lynus:/opt/jboss/keycloak/themes/lynus -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin --name keycloak jboss/keycloak:15.0.2
```

Replace `<PATH_TO_KEYCLOAK_REPOSITORY>` with the path of your cloned repository!

2. Navigate to `http://localhost:8080/`in your browser.
1. You should see the default keycloak page, where you can access the admin console using user `admin` and
   password `admin`.

### Add a new theme

1. Duplicate one of the existing theme-folders which extend from the main `lynus` theme, e.g. the folder "eww".
1. Rename the folder to the new theme name.
1. Open `account/theme.properties` and `login/theme.properties` and modify **line number 2** in both files to match the
   new theme name:

```
import=common/<NEW_THEME_NAME>
```

4. Navigate to the folder `common/resources/img/` and replace the images for background, favicon and logo. Maintain the
   same filenames!

### Test the new theme on docker container locally

1. Remove the old docker container (if exists): `docker stop keycloak && docker rm keycloak`
1. Run the container and additionally mount the new theme folder into the container:

```bash
docker run -p 8080:8080 -v <PATH_TO_KEYCLOAK_REPOSITORY>/themes/lynus:/opt/jboss/keycloak/themes/lynus -v <PATH_TO_KEYCLOAK_REPOSITORY>/themes/<NEW_THEME_NAME>:/opt/jboss/keycloak/themes/<NEW_THEME_NAME> -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin --name keycloak jboss/keycloak:15.0.2
```

Where `<NEW_THEME_NAME>` has to be replaced accordingly.

3. For easier development: disable caching ->
   see [Avoid container restarts by disabling caching](#avoid-container-restarts-by-disabling-caching)
1. Navigate to `http://localhost:8080/`in your browser and set the new login theme in the administrator console.
1. When making changes (e.g. exchanging an image while testing) you have to force a complete reload of the site (Ctrl+F5
   on Windows+Linus) to see the changes.

#### Avoid container restarts by disabling caching

Normally, on every change of a resource, e.g. `logo.svg`, the container would have to be restarted to apply the changes.
To disable caching for development purposes, do the following:

1. Open a shell within your container by doing: `docker exec -it keycloak bash`
1. Execute the following command (which are actually multiple) in one go:

```bash
sed -i -E "s/(<staticMaxAge>)2592000(<\/staticMaxAge>)/\1\-1\2/" /opt/jboss/keycloak/standalone/configuration/standalone.xml && sed -i -E "s/(<cacheThemes>)true(<\/cacheThemes>)/\1false\2/" /opt/jboss/keycloak/standalone/configuration/standalone.xml && sed -i -E "s/(<cacheTemplates>)true(<\/cacheTemplates>)/\1false\2/" /opt/jboss/keycloak/standalone/configuration/standalone.xml && sed -i -E "s/(<staticMaxAge>)2592000(<\/staticMaxAge>)/\1\-1\2/" /opt/jboss/keycloak/standalone/configuration/standalone-ha.xml && sed -i -E "s/(<cacheThemes>)true(<\/cacheThemes>)/\1false\2/" /opt/jboss/keycloak/standalone/configuration/standalone-ha.xml && sed -i -E "s/(<cacheTemplates>)true(<\/cacheTemplates>)/\1false\2/" /opt/jboss/keycloak/standalone/configuration/standalone-ha.xml
```

3. Restart the container: `docker restart keycloak`
1. Proceed normally with other stuff.

### Add custom CSS theme colors

First, install [npm](https://www.npmjs.com/get-npm)
and [gulp](https://gulpjs.com/docs/en/getting-started/quick-start/#install-the-gulp-command-line-utility).

1. Clone or download the repository of [spectre](https://github.com/picturepan2/spectre).
1. Navigate into the cloned folder and run `npm i`.
1. To modify the css colors, open the file `src/_variables.scss` and edit the primary color variable or more if needed.

```scss
$primary-color: #215b28 !default;
```

4. Within the root folder of the cloned spectre repository run `gulp build` to build the minified css.
1. Get the `dist/spectre.min.css` file and copy it into the keycloak theme folder under `common/resources/css`.
1. Remove the existing container and start a new one.
